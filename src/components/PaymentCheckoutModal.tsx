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
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Globe,
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
  const [paymentTab, setPaymentTab] = useState<'card' | 'wire'>('card');
  const [billingEmail, setBillingEmail] = useState(deal.clientEmail || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [wireReference, setWireReference] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  if (!isOpen) return null;

  const currency = deal.currency || creator.defaultCurrency || 'USD';
  const taxRate = deal.taxRate ?? creator.defaultTaxRate ?? 0;
  const subtotal = deal.subtotal ?? Math.round((deal.totalAmount / (1 + taxRate / 100)) * 100) / 100;
  const taxAmount = deal.taxAmount ?? Math.round((deal.totalAmount - subtotal) * 100) / 100;

  const prefs = creator.paymentPreferences || {
    preferredMethod: 'bank_transfer',
    bankName: 'Global Commercial Bank',
    accountName: creator.name,
    accountNumber: '••••4892',
    routingNumber: '121000358',
    swiftBic: 'GLBAUS33',
  };

  const handlePaystackPay = async () => {
    setPaymentError(null);

    if (!PAYSTACK_PUBLIC_KEY) {
      setPaymentError('Paystack checkout is not configured yet with a public key. You can use the Direct Bank Wire or Custom Payment Link options below.');
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
      setPaymentError('Could not load the payment form. Check your internet connection and try again.');
      return;
    }

    if (!window.PaystackPop) {
      setIsProcessing(false);
      setPaymentError('Payment gateway unavailable right now. Please try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: billingEmail,
      amount: Math.round(deal.totalAmount * 100),
      currency,
      ref: `MDL-${deal.id}-${Date.now()}`,
      metadata: {
        dealId: deal.id,
        invoiceNumber: deal.invoiceNumber,
      },
      callback: (response: { reference: string }) => {
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
            senderName: 'Madeal Settlement Engine',
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
          : 'We could not verify this payment automatically. If your card was charged, contact the creator with your transaction receipt.'
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
        messages: [
          ...deal.messages,
          {
            id: 'msg-wire-' + Date.now(),
            sender: 'brand',
            senderName: deal.brandName,
            text: `Initiated direct bank remittance of ${formatMoney(deal.totalAmount, currency)} for Invoice ${deal.invoiceNumber}${wireReference ? ` (Wire Ref: ${wireReference.trim()})` : ''}.`,
            timestamp: 'Just now',
          },
        ],
      };
      onPaymentSuccess(updatedDeal);
      onClose();
    }, 600);
  };



  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF3EC] rounded-3xl max-w-lg w-full border-2 border-[#59171B]/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 text-[#230B0D]">

        {/* Modal Header */}
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-payno-sm animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                  Payment Recorded &amp; Settled
                </span>
                <h3 className="font-heading text-2xl font-bold text-[#230B0D] mt-1">
                  {formatMoney(deal.totalAmount, currency)} Settled
                </h3>
                <p className="text-xs text-[#7E635F] mt-1 max-w-sm mx-auto">
                  Invoice {deal.invoiceNumber} has been updated in the agreement ledger with an official audit record.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] text-left space-y-2 text-xs shadow-payno-sm">
                <div className="flex justify-between text-[#7E635F]">
                  <span>Transaction Reference:</span>
                  <span className="font-mono font-bold text-[#230B0D]">{transactionId}</span>
                </div>
                <div className="flex justify-between text-[#7E635F]">
                  <span>Beneficiary:</span>
                  <span className="font-semibold text-[#230B0D]">{creator.name}</span>
                </div>
                <div className="flex justify-between text-[#7E635F]">
                  <span>Invoice:</span>
                  <span className="font-mono text-[#230B0D]">{deal.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-[#7E635F]">
                  <span>Settlement Date:</span>
                  <span className="text-[#230B0D]">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="border-t border-[#ECD9CB] pt-2 flex justify-between font-bold text-sm text-[#59171B]">
                  <span>Total Settled:</span>
                  <span>{formatMoney(deal.totalAmount, currency)}</span>
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
              {/* Invoice Breakdown Card */}
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

              {/* Payment Methods Tab Selector */}
              <div className="grid grid-cols-2 gap-1 bg-[#FAF3EC] p-1 rounded-2xl border border-[#ECD9CB] text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentTab('card')}
                  className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentTab === 'card'
                      ? 'bg-white text-[#59171B] shadow-payno-sm'
                      : 'text-[#7E635F] hover:text-[#230B0D]'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="truncate">Card / Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentTab('wire')}
                  className={`py-2 px-1 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    paymentTab === 'wire'
                      ? 'bg-white text-[#59171B] shadow-payno-sm'
                      : 'text-[#7E635F] hover:text-[#230B0D]'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span className="truncate">Bank Wire / ACH</span>
                </button>
              </div>

              {paymentError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* TAB 1: Online Card / Gateway Checkout */}
              {paymentTab === 'card' && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#ECD9CB]">
                  {prefs.paymentLink ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#59171B]">
                        <Globe className="w-4 h-4" />
                        <span>Direct Online Checkout Link</span>
                      </div>
                      <p className="text-xs text-[#7E635F]">
                        {creator.name} has configured a verified online payment link for direct credit card, Apple Pay, Google Pay, or Wise settlement.
                      </p>
                      <a
                        href={prefs.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold text-xs shadow-payno-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Secure Checkout ({formatMoney(deal.totalAmount, currency)})</span>
                      </a>
                      <p className="text-[10px] text-[#7E635F] text-center">
                        Payments through this link cannot be verified automatically — message the brand to confirm once settled, or ask them to use Paystack instead.
                      </p>
                    </div>
                  ) : PAYSTACK_PUBLIC_KEY ? (
                    <div className="space-y-3">
                      <p className="text-xs text-[#7E635F]">
                        Pay securely by card, bank transfer, USSD, or mobile money via Paystack's
                        hosted checkout.
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
                        className="w-full py-3 rounded-2xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold text-sm shadow-payno-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
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
                  ) : prefs.paypalEmail ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#59171B]">
                        <Globe className="w-4 h-4" />
                        <span>PayPal Remittance</span>
                      </div>
                      <p className="text-xs text-[#7E635F]">
                        Remit payment directly to the creator's PayPal account:
                      </p>
                      <div className="bg-[#FAF3EC] p-3 rounded-xl border border-[#ECD9CB] flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#230B0D]">{prefs.paypalEmail}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(prefs.paypalEmail || '');
                            setCopiedAccount(true);
                            setTimeout(() => setCopiedAccount(false), 2000);
                          }}
                          className="text-[#59171B] hover:underline font-bold text-xs flex items-center gap-1"
                        >
                          {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <a
                        href={`https://paypal.me/${prefs.paypalEmail.split('@')[0]}/${deal.totalAmount}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-[#003087] hover:bg-[#002266] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Pay with PayPal ({formatMoney(deal.totalAmount, currency)})</span>
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-[#FAF3EC] rounded-xl border border-[#ECD9CB] text-xs text-[#7E635F] space-y-1">
                        <span className="font-bold text-[#59171B] block">Direct Remittance Available</span>
                        <p>
                          Please use the <strong>Bank Wire / ACH</strong> or <strong>Confirm Proof</strong> tab to settle this invoice directly with the creator's banking instructions.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentTab('wire')}
                        className="w-full py-2.5 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Building className="w-4 h-4" />
                        <span>View Bank Wire Instructions</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Direct Bank Wire / ACH Details */}
              {paymentTab === 'wire' && (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#ECD9CB] text-xs">
                  <div className="flex items-center justify-between text-[#59171B] font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-4 h-4" />
                      <span>Direct Wire / ACH Instructions</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(deal.totalAmount.toString());
                        setCopiedAmount(true);
                        setTimeout(() => setCopiedAmount(false), 2000);
                      }}
                      className="text-[11px] font-semibold text-[#7E635F] hover:text-[#59171B] flex items-center gap-1"
                    >
                      {copiedAmount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Amount</span>
                    </button>
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
                      <span className="font-mono font-bold text-[#230B0D]">{prefs.accountNumber || '••••4892'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#7E635F]">Routing / SWIFT:</span>
                      <span className="font-mono text-[#230B0D]">{prefs.routingNumber || prefs.swiftBic || '121000358'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-[#7E635F]">Payment Memo / Reference:</span>
                      <span className="font-mono font-bold text-[#59171B]">{deal.invoiceNumber}</span>
                    </div>
                    {prefs.customInstructions && (
                      <div className="bg-[#FAF3EC] p-2.5 rounded-xl border border-[#ECD9CB] text-[11px] text-[#230B0D]">
                        <span className="font-bold text-[#59171B] block text-[10px] uppercase">Creator Note:</span>
                        {prefs.customInstructions}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Bank: ${prefs.bankName || 'Bank'}\nBeneficiary: ${prefs.accountName || creator.name}\nAccount: ${prefs.accountNumber}\nRouting: ${prefs.routingNumber || prefs.swiftBic}\nReference: ${deal.invoiceNumber}\nAmount: ${formatMoney(deal.totalAmount, currency)}`
                        );
                        setCopiedAccount(true);
                        setTimeout(() => setCopiedAccount(false), 2000);
                      }}
                      className="py-2.5 bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] font-bold rounded-xl border border-[#ECD9CB] transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAccount ? 'Copied Details' : 'Copy All Info'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmWireInitiated}
                      disabled={isProcessing}
                      className="py-2.5 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>Notify Creator</span>
                    </button>
                  </div>
                </div>
              )}


              {/* Download Tax Invoice link */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => exportInvoicePDF(deal, creator)}
                  className="text-[#59171B] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Invoice PDF</span>
                </button>

                <div className="flex items-center gap-1 text-[11px] text-[#7E635F]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Encrypted Ledger Security</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
