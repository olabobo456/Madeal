import React, { useState } from 'react';
import { Deal, CreatorProfile } from '../types';
import { formatMoney } from '../utils/currency';
import {
  X,
  CreditCard,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Building,
  Download,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { exportInvoicePDF } from '../lib/pdfExport';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

let paystackScriptPromise: Promise<void> | null = null;
function loadPaystackScript(): Promise<void> {
  if (window.PaystackPop) return Promise.resolve();
  if (paystackScriptPromise) return paystackScriptPromise;
  paystackScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack checkout.'));
    document.body.appendChild(script);
  });
  return paystackScriptPromise;
}

interface PaymentCheckoutModalProps {
  deal: Deal;
  creator: CreatorProfile;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedDeal: Deal) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  deal,
  creator,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentTab, setPaymentTab] = useState<'pay' | 'wire'>('pay');
  const [billingEmail, setBillingEmail] = useState(deal.clientEmail || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!isOpen) return null;

  const currency = deal.currency || creator.defaultCurrency || 'NGN';
  const taxRate = deal.taxRate ?? creator.defaultTaxRate ?? 0;
  const subtotal = deal.subtotal ?? Math.round((deal.totalAmount / (1 + taxRate / 100)) * 100) / 100;
  const taxAmount = deal.taxAmount ?? Math.round((deal.totalAmount - subtotal) * 100) / 100;

  const prefs = creator.paymentPreferences || {
    preferredMethod: 'bank_transfer',
    bankName: 'Global Commercial Bank',
    accountName: creator.name,
    accountNumber: '••••••••4892',
    routingNumber: '121000358',
    swiftBic: 'GLBAUS33',
  };

  const handlePaystackPay = async () => {
    setPaymentError(null);

    if (!PAYSTACK_PUBLIC_KEY) {
      setPaymentError('Payments are not configured yet — missing Paystack public key.');
      return;
    }
    if (!billingEmail) {
      setPaymentError('Please enter a receipt email to continue.');
      return;
    }

    setIsProcessing(true);
    try {
      await loadPaystackScript();
    } catch {
      setIsProcessing(false);
      setPaymentError('Could not load the payment form. Check your connection and try again.');
      return;
    }

    if (!window.PaystackPop) {
      setIsProcessing(false);
      setPaymentError('Payment form unavailable right now. Please try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: billingEmail,
      amount: Math.round(deal.totalAmount * 100), // kobo/cents
      currency,
      ref: `MDL-${deal.id}-${Date.now()}`,
      metadata: {
        dealId: deal.id,
        invoiceNumber: deal.invoiceNumber,
      },
      callback: (response: { reference: string }) => {
        // The popup reporting success is NOT proof of payment on its own —
        // we hand the reference to a server function that independently
        // re-verifies it with Paystack before anything is marked paid.
        void verifyOnServer(response.reference);
      },
      onClose: () => {
        setIsProcessing(false);
      },
    });

    handler.openIframe();
  };

  const verifyOnServer = async (reference: string) => {
    setIsVerifying(true);
    try {
      const verify = httpsCallable(functions, 'verifyPaystackPayment');
      await verify({ dealId: deal.id, reference });

      setTransactionId(reference);
      setIsSuccess(true);

      const now = new Date().toISOString();
      const updatedDeal: Deal = {
        ...deal,
        status: 'paid',
        paidAt: now,
        paymentMethodUsed: 'Paystack',
        paymentTransactionId: reference,
        messages: [
          ...deal.messages,
          {
            id: 'msg-pay-' + Date.now(),
            sender: 'system',
            senderName: 'Madeal Payment Engine',
            text: `Payment of ${formatMoney(deal.totalAmount, currency)} verified and settled via Paystack (Ref: ${reference}).`,
            timestamp: 'Just now',
          },
        ],
      };
      onPaymentSuccess(updatedDeal);
    } catch (err: any) {
      setPaymentError(
        err?.message?.includes('Amount')
          ? 'Payment verification failed: amount did not match this invoice.'
          : 'We could not verify this payment. If you were charged, contact the creator — do not pay again.'
      );
    } finally {
      setIsProcessing(false);
      setIsVerifying(false);
    }
  };

  const handleConfirmWireInitiated = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const updatedDeal: Deal = {
        ...deal,
        // NOT marked 'paid' — a client-side "I sent it" claim isn't proof
        // of funds received. The creator confirms manually once the wire
        // actually lands, then marks the invoice paid themselves.
        status: 'active',
        messages: [
          ...deal.messages,
          {
            id: 'msg-wire-' + Date.now(),
            sender: 'brand',
            senderName: deal.brandName,
            text: `Reported initiating a bank wire for ${formatMoney(deal.totalAmount, currency)} (Ref: ${deal.invoiceNumber}). Awaiting confirmation from ${creator.name}.`,
            timestamp: 'Just now',
          },
        ],
      };
      onPaymentSuccess(updatedDeal);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF3EC] rounded-3xl max-w-lg w-full border-2 border-[#59171B]/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 text-[#230B0D]">

        {/* Header */}
        <div className="bg-[#59171B] text-[#FED7B8] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-[#FED7B8]" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-white leading-tight">
                Secure Invoice Settlement
              </h2>
              <span className="text-[11px] text-[#FED7B8]/80 font-mono">
                Invoice: {deal.invoiceNumber} • {deal.brandName}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-[#FED7B8] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-payno-sm animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                  Payment Verified &amp; Settled
                </span>
                <h3 className="font-heading text-2xl font-bold text-[#230B0D] mt-1">
                  {formatMoney(deal.totalAmount, currency)} Paid
                </h3>
                <p className="text-xs text-[#7E635F] mt-1 max-w-sm mx-auto">
                  Confirmed directly with Paystack and logged into the creator agreement ledger.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] text-left space-y-2 text-xs shadow-payno-sm">
                <div className="flex justify-between text-[#7E635F]">
                  <span>Transaction Reference:</span>
                  <span className="font-mono font-bold text-[#230B0D]">{transactionId}</span>
                </div>
                <div className="flex justify-between text-[#7E635F]">
                  <span>Recipient:</span>
                  <span className="font-semibold text-[#230B0D]">{creator.name}</span>
                </div>
                <div className="flex justify-between text-[#7E635F]">
                  <span>Invoice:</span>
                  <span className="font-mono text-[#230B0D]">{deal.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-[#7E635F]">
                  <span>Payment Date:</span>
                  <span className="text-[#230B0D]">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="border-t border-[#ECD9CB] pt-2 flex justify-between font-bold text-sm text-[#59171B]">
                  <span>Amount Settled:</span>
                  <span>{formatMoney(deal.totalAmount, currency)} {currency}</span>
                </div>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => exportInvoicePDF(deal, creator)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-[#59171B] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Tax Receipt PDF</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all cursor-pointer shadow-payno-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Amount Breakdown Summary */}
              <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#7E635F]">
                  <span>Subtotal ({deal.deliverables.length} deliverables)</span>
                  <span className="font-semibold text-[#230B0D]">{formatMoney(subtotal, currency)}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex items-center justify-between text-xs text-[#7E635F]">
                    <span>Tax / VAT ({taxRate}%)</span>
                    <span className="font-semibold text-[#230B0D]">{formatMoney(taxAmount, currency)}</span>
                  </div>
                )}
                <div className="border-t border-[#ECD9CB] pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#7E635F] uppercase tracking-wider block">
                      Total Due
                    </span>
                    <span className="font-heading text-2xl font-bold text-[#59171B]">
                      {formatMoney(deal.totalAmount, currency)}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#FAF3EC] text-[#59171B] px-2.5 py-1 rounded-full border border-[#ECD9CB]">
                    {currency} Settlement
                  </span>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-2 gap-1.5 bg-[#FAF3EC] p-1 rounded-2xl border border-[#ECD9CB]">
                <button
                  type="button"
                  onClick={() => setPaymentTab('pay')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentTab === 'pay'
                      ? 'bg-white text-[#59171B] shadow-payno-sm'
                      : 'text-[#7E635F] hover:text-[#230B0D]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay with Paystack</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('wire')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentTab === 'wire'
                      ? 'bg-white text-[#59171B] shadow-payno-sm'
                      : 'text-[#7E635F] hover:text-[#230B0D]'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Bank Wire</span>
                </button>
              </div>

              {paymentError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* TAB 1: Paystack Inline Checkout */}
              {paymentTab === 'pay' && (
                <div className="space-y-3.5">
                  <p className="text-xs text-[#7E635F]">
                    Pay securely by card, bank transfer, USSD, or mobile money via Paystack's
                    hosted checkout — your card details are never seen by this app.
                  </p>

                  <div>
                    <label className="text-[11px] font-bold text-[#7E635F] block mb-1">
                      RECEIPT EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      placeholder="accounts@brand.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECD9CB] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#59171B]/30"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handlePaystackPay}
                    disabled={isProcessing || isVerifying}
                    className="w-full py-3 rounded-2xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold text-sm shadow-payno-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
                  >
                    {isVerifying ? (
                      <span>Verifying payment...</span>
                    ) : isProcessing ? (
                      <span>Opening secure checkout...</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay {formatMoney(deal.totalAmount, currency)} Now</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: Direct Bank Wire Details */}
              {paymentTab === 'wire' && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#ECD9CB] text-xs">
                  <div className="flex items-center gap-2 text-[#59171B] font-bold text-xs">
                    <Building className="w-4 h-4" />
                    <span>Direct Wire / ACH Instructions</span>
                  </div>

                  <div className="space-y-2 text-[#7E635F]">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#7E635F]">Beneficiary Name:</span>
                      <span className="font-semibold text-[#230B0D]">{prefs.accountName || creator.name}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#7E635F]">Bank Name:</span>
                      <span className="font-semibold text-[#230B0D]">{prefs.bankName || 'Global Commercial Bank'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#7E635F]">Account / IBAN:</span>
                      <span className="font-mono font-bold text-[#230B0D]">{prefs.accountNumber || '••••••••4892'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#7E635F]">Routing / SWIFT:</span>
                      <span className="font-mono text-[#230B0D]">{prefs.routingNumber || prefs.swiftBic || '121000358'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#7E635F]">Payment Memo / Reference:</span>
                      <span className="font-mono font-bold text-[#59171B]">{deal.invoiceNumber}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Bank: ${prefs.bankName}\nBeneficiary: ${prefs.accountName || creator.name}\nAccount: ${prefs.accountNumber}\nRouting: ${prefs.routingNumber}\nReference: ${deal.invoiceNumber}`
                      );
                      setCopiedAccount(true);
                      setTimeout(() => setCopiedAccount(false), 2000);
                    }}
                    className="w-full py-2 bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] font-bold rounded-xl border border-[#ECD9CB] transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    {copiedAccount ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Receipt className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Bank Details Copied!' : 'Copy Wire Details'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmWireInitiated}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>Notify Creator: Wire Initiated</span>
                  </button>
                  <p className="text-[10px] text-[#7E635F] text-center leading-relaxed">
                    This notifies {creator.name} — the invoice is marked paid only once they
                    confirm funds actually landed.
                  </p>
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7E635F] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payments verified server-side via Paystack — no card data touches this app</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
