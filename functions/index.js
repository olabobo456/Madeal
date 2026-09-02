const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const PAYSTACK_SECRET_KEY = defineSecret('PAYSTACK_SECRET_KEY');

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
      return { success: true, alreadyPaid: true };
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY.value()}` } }
    );

    if (!verifyRes.ok) {
      throw new HttpsError('internal', 'Could not reach Paystack to verify payment.');
    }

    const verifyJson = await verifyRes.json();
    const tx = verifyJson && verifyJson.data;

    if (!tx || tx.status !== 'success') {
      throw new HttpsError('failed-precondition', 'Payment was not successful.');
    }

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
