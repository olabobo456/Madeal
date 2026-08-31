const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Set with: firebase functions:secrets:set PAYSTACK_SECRET_KEY
// Never put your Paystack secret key in client code (.env / Vite) — only here.
const PAYSTACK_SECRET_KEY = defineSecret('PAYSTACK_SECRET_KEY');

/**
 * verifyPaystackPayment
 *
 * Called by the client after the Paystack Inline popup reports a
 * successful charge. This is the ONLY place a deal is ever marked
 * "paid" — we independently re-verify the transaction against
 * Paystack's API using the secret key (never exposed to the browser),
 * confirm the amount/currency/reference actually match this deal, and
 * only then write the result using the Admin SDK (which bypasses
 * Firestore security rules, since this is a trusted server context).
 *
 * A brand's browser can never set status:'paid' directly — see
 * firestore.rules, which only allows the client to move a deal to
 * 'active' on its own.
 */
exports.verifyPaystackPayment = onCall(
  { secrets: [PAYSTACK_SECRET_KEY] },
  async (request) => {
    const { dealId, reference } = request.data || {};

    if (!dealId || !reference) {
      throw new HttpsError('invalid-argument', 'dealId and reference are required.');
    }

    const dealRef = db.collection('deals').doc(dealId);
    const dealSnap = await dealRef.get();
    if (!dealSnap.exists) {
      throw new HttpsError('not-found', 'Deal not found.');
    }
    const deal = dealSnap.data();

    if (deal.status === 'paid') {
      // Idempotent: already settled (e.g. duplicate callback), just confirm.
      return { success: true, alreadyPaid: true };
    }

    // Verify directly with Paystack — this is the step that was missing
    // in the original implementation. The client's "success" callback
    // alone proves nothing; only Paystack's server response does.
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY.value()}`,
        },
      }
    );

    if (!verifyRes.ok) {
      throw new HttpsError('internal', 'Could not reach Paystack to verify payment.');
    }

    const verifyJson = await verifyRes.json();
    const tx = verifyJson && verifyJson.data;

    if (!tx || tx.status !== 'success') {
      throw new HttpsError('failed-precondition', 'Payment was not successful.');
    }

    // Cross-check the verified transaction actually pays for THIS deal,
    // for THIS amount — prevents replaying a valid reference from a
    // different (possibly smaller) transaction against this invoice.
    const expectedKobo = Math.round(Number(deal.totalAmount) * 100);
    const paidKobo = Number(tx.amount);
    const currency = deal.currency || 'NGN';

    if (tx.currency !== currency) {
      throw new HttpsError('failed-precondition', 'Currency mismatch.');
    }
    if (paidKobo !== expectedKobo) {
      throw new HttpsError('failed-precondition', 'Amount paid does not match invoice total.');
    }
    if (tx.metadata && tx.metadata.dealId && tx.metadata.dealId !== dealId) {
      throw new HttpsError('failed-precondition', 'Reference does not belong to this deal.');
    }

    const now = new Date().toISOString();
    await dealRef.update({
      status: 'paid',
      paidAt: now,
      paymentMethodUsed: `Paystack (${tx.channel || 'card'})`,
      paymentTransactionId: reference,
      messages: admin.firestore.FieldValue.arrayUnion({
        id: `msg-pay-${Date.now()}`,
        sender: 'system',
        senderName: 'Madeal Payment Engine',
        text: `Payment of ${(paidKobo / 100).toLocaleString()} ${currency} verified and settled via Paystack (Ref: ${reference}). Invoice marked as PAID.`,
        timestamp: 'Just now',
      }),
    });

    // Immutable audit trail, scoped to the deal's owning creator.
    await db.collection('audit_logs').doc(`audit_${dealId}_${Date.now()}`).set({
      creatorId: deal.creatorId,
      dealId,
      invoiceNumber: deal.invoiceNumber,
      brandName: deal.brandName,
      totalAmount: deal.totalAmount,
      paymentTransactionId: reference,
      status: 'paid',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, paidAt: now, reference };
  }
);
