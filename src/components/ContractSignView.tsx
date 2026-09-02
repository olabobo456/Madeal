import React, { useRef, useState, useEffect } from 'react';
import { Deal, CreatorProfile } from '../types';
import {
  Clock,
  RotateCcw,
  Download,
  ArrowLeft,
  PenTool,
  CheckCircle2,
  Lock,
  Check,
  Building,
  Link2,
  ExternalLink,
  CreditCard,
  Eye,
  Trash2,
} from 'lucide-react';
import { TermInfoTooltip } from './TermInfoTooltip';
import { DeliverableTracker } from './DeliverableTracker';
import { exportInvoicePDF, exportContractPDF } from '../lib/pdfExport';
import { getBrandPortalUrl } from '../lib/cloudStore';
import {
  USAGE_TERMS_MAP,
  EXCLUSIVITY_TERMS_MAP,
  OTHER_LEGAL_TERMS,
} from '../utils/legalTerms';

interface ContractSignViewProps {
  deal: Deal;
  creator?: CreatorProfile;
  onUpdateDeal: (updatedDeal: Deal) => void;
  onToggleDeliverable: (dealId: string, deliverableId: string, deliveredUrl?: string) => void;
  onBack: () => void;
  onOpenMessages: () => void;
  onOpenBrandPreview?: (deal: Deal) => void;
  onDeleteDeal?: (dealId: string) => void;
}

export const ContractSignView: React.FC<ContractSignViewProps> = ({
  deal,
  creator,
  onUpdateDeal,
  onToggleDeliverable,
  onBack,
  onOpenMessages,
  onOpenBrandPreview,
  onDeleteDeal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(deal.clientSigned || !!deal.signature);
  const [typedName, setTypedName] = useState(deal.signature || '');
  const [signMode, setSignMode] = useState<'draw' | 'type'>('draw');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);

  // Setup canvas for drawing with terracotta coral stroke
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#59171B';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [signMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (deal.clientSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || deal.clientSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setTypedName('');
  };

  const handleAdoptSignature = () => {
    const signatureText = typedName.trim() || deal.brandName || 'Authorized Signer';
    const updatedDeal: Deal = {
      ...deal,
      signature: signatureText,
      signedAt: new Date().toISOString(),
      clientSigned: true,
      status: deal.status === 'paid' ? 'paid' : 'active',
      messages: [
        ...deal.messages,
        {
          id: 'msg-sign-' + Date.now(),
          sender: 'system',
          senderName: 'Madeal Protocol',
          text: `Agreement executed & signed by ${signatureText}`,
          timestamp: 'Just now',
        },
      ],
    };

    onUpdateDeal(updatedDeal);
  };

  const handleMarkAsPaid = () => {
    const paidDeal: Deal = {
      ...deal,
      status: 'paid',
      clientSigned: true,
      signature: deal.signature || 'Brand Accounting Department',
      signedAt: deal.signedAt || new Date().toISOString(),
      messages: [
        ...deal.messages,
        {
          id: 'msg-paid-' + Date.now(),
          sender: 'system',
          senderName: 'Payment Remittance',
          text: `Invoice #${deal.invoiceNumber} of $${deal.totalAmount.toLocaleString()} marked as paid & settled directly by brand.`,
          timestamp: 'Just now',
        },
      ],
    };

    onUpdateDeal(paidDeal);
    setShowMarkPaidModal(false);
  };

  const handleCopyLink = () => {
    const link = getBrandPortalUrl(deal.id);
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Resolve Creator's Preferred Remittance Method
  const payPref = creator?.paymentPreferences || {
    preferredMethod: 'bank_transfer',
    paymentLink: '',
    bankName: '',
    accountName: creator?.name || '',
    accountNumber: '',
    routingNumber: '',
    swiftBic: '',
    customInstructions: '',
  };

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <div className="space-y-6 pb-32">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7E635F] hover:text-[#230B0D] bg-white px-3.5 py-2 rounded-xl border border-[#ECD9CB] transition-colors cursor-pointer self-start shadow-payno-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onOpenBrandPreview && (
            <button
              onClick={() => onOpenBrandPreview(deal)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF3EC] hover:bg-[#F5E8DC] border border-[#59171B]/40 text-xs font-bold text-[#59171B] transition-colors flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
              title={`Simulate what ${deal.brandName} sees in their isolated view`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview as Brand</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95"
            title="Copy secure link sent to brand"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Link2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy brand Link'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#FAF3EC] p-1 rounded-2xl border border-[#ECD9CB]">
            <button
              onClick={() => creator && exportInvoicePDF(deal, creator)}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#59171B] hover:text-[#FED7B8] text-xs font-bold text-[#59171B] border border-[#ECD9CB] transition-all flex items-center gap-1 cursor-pointer shadow-payno-sm"
              title="Download Tax-Compliant PDF Invoice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Invoice PDF</span>
            </button>
            <button
              onClick={() => creator && exportContractPDF(deal, creator)}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#59171B] hover:text-[#FED7B8] text-xs font-bold text-[#59171B] border border-[#ECD9CB] transition-all flex items-center gap-1 cursor-pointer shadow-payno-sm"
              title="Download Binding Deed Agreement PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Deed PDF</span>
            </button>
          </div>

          {deal.status !== 'paid' ? (
            <button
              onClick={() => setShowMarkPaidModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#2D8A68] hover:bg-[#246e53] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Invoice Paid</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-[#EAF6EE] text-[#2D8A68] text-xs font-bold border border-[#C2E7D1] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settled & Paid</span>
            </span>
          )}

          {onDeleteDeal && (
            isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200">
                <button
                  type="button"
                  onClick={() => onDeleteDeal(deal.id)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-2 py-1 text-xs text-stone-600 hover:bg-white rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="p-2 text-[#7E635F] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                title="Delete this deal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Contract & Deed Document Paper Surface */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ECD9CB] shadow-payno-md space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#F5E8DC] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#59171B] uppercase">
                DIGITAL CONTENT AGREEMENT & INVOICE
              </span>
              {deal.status === 'paid' && (
                <span className="bg-[#EAF6EE] text-[#2D8A68] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#C2E7D1]">
                  PAID
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#230B0D]">
              {deal.title}
            </h1>
            <p className="text-xs text-[#7E635F]">
              Agreement ID: <span className="font-mono text-[#230B0D] font-bold">{deal.id}</span> • Invoice #{deal.invoiceNumber}
            </p>
          </div>

          <div className="text-left sm:text-right bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB]">
            <span className="text-[10px] uppercase font-bold text-[#7E635F] block">
              Total Invoice Amount
            </span>
            <span className="font-heading text-2xl font-bold text-[#59171B]">
              ${deal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-[#7E635F] block mt-0.5">
              Net 30 Days Remittance Terms
            </span>
          </div>
        </div>

        {/* Section 1: The Parties */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#59171B]">
            1. The Contracting Parties
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF3EC] p-4 rounded-2xl border border-[#ECD9CB] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#7E635F]">Creator / Beneficiary</span>
              <p className="font-heading text-base font-bold text-[#230B0D]">{deal.creatorHandle}</p>
              <p className="text-xs text-[#7E635F]">{deal.creatorEmail}</p>
            </div>

            <div className="bg-[#FAF3EC] p-4 rounded-2xl border border-[#ECD9CB] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#7E635F]">Client / Brand Sponsor</span>
              <p className="font-heading text-base font-bold text-[#230B0D]">{deal.brandName}</p>
              <p className="text-xs text-[#7E635F]">{deal.clientEmail}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Deliverable Schedule & Fulfillment Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#59171B]">
              2. Scope of Deliverables & Fulfillment
            </h2>
            <span className="text-[10px] text-[#7E635F] italic hidden sm:inline">
              Check off deliverables as they are completed and delivered
            </span>
          </div>

          <DeliverableTracker
            dealId={deal.id}
            brandName={deal.brandName}
            deliverables={deal.deliverables}
            onToggleDeliverable={onToggleDeliverable}
          />
        </div>

        {/* Section 3: Rights, Exclusivity & Protections */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#59171B]">
            3. Legal Protections & Licensing Terms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Usage Term Card */}
            <div className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#7E635F]">
                  Usage Rights
                </span>
                <TermInfoTooltip
                  info={
                    USAGE_TERMS_MAP[deal.usageTerm] ||
                    Object.values(USAGE_TERMS_MAP).find((u) => u.term.includes(deal.usageTerm)) ||
                    OTHER_LEGAL_TERMS.whitelisting
                  }
                />
              </div>
              <span className="font-semibold text-[#230B0D] block">{deal.usageTerm}</span>
            </div>

            {/* Exclusivity Card */}
            <div className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#7E635F]">
                  Exclusivity Window
                </span>
                <TermInfoTooltip
                  info={
                    EXCLUSIVITY_TERMS_MAP[deal.exclusivity] ||
                    Object.values(EXCLUSIVITY_TERMS_MAP).find((e) => e.term.includes(deal.exclusivity)) ||
                    EXCLUSIVITY_TERMS_MAP['None (Non-Exclusive)']
                  }
                />
              </div>
              <span className="font-semibold text-[#230B0D] block">{deal.exclusivity}</span>
            </div>

            {/* Revisions & Late Fees Card */}
            <div className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#7E635F]">
                  Revisions & Terms
                </span>
                <TermInfoTooltip info={OTHER_LEGAL_TERMS.revisions} />
              </div>
              <span className="font-semibold text-[#230B0D] block">
                {deal.revisions} rounds • {deal.lateFeePercent || 1.5}% late fee
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Direct Remittance & Payment Options */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#59171B]">
              4. Payment Remittance Options (Direct to Creator)
            </h2>
            <span className="text-[10px] font-semibold text-[#2D8A68] bg-[#EAF6EE] px-2.5 py-0.5 rounded-full border border-[#C2E7D1]">
              Direct Creator Settlement
            </span>
          </div>

          <div className="bg-[#FAF3EC] rounded-2xl p-5 border border-[#ECD9CB] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECD9CB]/80 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7E635F] block">
                  Chosen Payment Channel
                </span>
                <p className="font-heading text-base font-bold text-[#230B0D]">
                  {payPref.preferredMethod === 'payment_link'
                    ? 'Creator Payment Link (1-Click Remittance)'
                    : payPref.preferredMethod === 'paypal'
                    ? 'PayPal Remittance'
                    : 'Direct Wire / ACH Bank Transfer'}
                </p>
              </div>

              {payPref.preferredMethod === 'payment_link' && payPref.paymentLink && (
                <a
                  href={payPref.paymentLink.startsWith('http') ? payPref.paymentLink : `https://${payPref.paymentLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold rounded-xl shadow-payno-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Creator Payment Link</span>
                </a>
              )}
            </div>

            {/* Bank details breakdown */}
            {(payPref.preferredMethod === 'bank_transfer' || !payPref.paymentLink) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase">Bank / Institution</span>
                  <p className="font-bold text-[#230B0D] truncate">{payPref.bankName || 'Standard Chartered / Global Bank'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase">Account Name</span>
                  <p className="font-bold text-[#230B0D] truncate">{payPref.accountName || deal.creatorHandle}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase">Account / IBAN</span>
                  <p className="font-mono font-bold text-[#230B0D]">{payPref.accountNumber || '••••4892'}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase">Sort / Routing / SWIFT</span>
                  <p className="font-mono font-bold text-[#230B0D]">{payPref.routingNumber || payPref.swiftBic || '121000358'}</p>
                </div>
              </div>
            )}

            {/* Custom note or memo instructions */}
            {(payPref.customInstructions || deal.notes) && (
              <div className="text-[11px] text-[#7E635F] bg-white p-3 rounded-xl border border-[#ECD9CB]/80">
                <span className="font-bold text-[#230B0D]">Payment Instructions: </span>
                {payPref.customInstructions || deal.notes}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Digital Execution & Signatures */}
        <div className="space-y-4 pt-4 border-t border-[#F5E8DC]">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#59171B]">
              5. Digital Execution & Signatures
            </h2>
            {deal.clientSigned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2D8A68] bg-[#EAF6EE] px-3 py-1 rounded-full border border-[#C2E7D1]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Legally Executed</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Creator Signature (Pre-signed) */}
            <div className="bg-[#FAF3EC] rounded-2xl p-5 border border-[#ECD9CB] space-y-3">
              <span className="text-[10px] uppercase font-bold text-[#7E635F] block">
                Creator Counter-Signature
              </span>
              <div className="h-20 border-b border-dashed border-[#ECD9CB] flex items-center justify-center">
                <span className="font-heading italic text-xl font-bold text-[#59171B]">
                  {deal.creatorHandle}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7E635F]">
                <span>Status: Authenticated</span>
                <span>Date: {new Date(deal.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Client Signature Pad */}
            <div className="bg-[#FAF3EC] rounded-2xl p-5 border border-[#ECD9CB] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#7E635F]">
                  Brand Sponsor Authorized Signature
                </span>

                {!deal.clientSigned && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      onClick={() => setSignMode('draw')}
                      className={`px-2.5 py-1 rounded-lg ${signMode === 'draw' ? 'bg-[#59171B] text-[#FED7B8] font-bold' : 'text-[#7E635F]'}`}
                    >
                      Draw
                    </button>
                    <button
                      onClick={() => setSignMode('type')}
                      className={`px-2.5 py-1 rounded-lg ${signMode === 'type' ? 'bg-[#59171B] text-[#FED7B8] font-bold' : 'text-[#7E635F]'}`}
                    >
                      Type
                    </button>
                    <button
                      onClick={clearCanvas}
                      className="text-[#7E635F] hover:text-[#230B0D] ml-1"
                      title="Clear"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {deal.clientSigned ? (
                <div className="h-20 border-b border-[#2D8A68] flex items-center justify-center">
                  <span className="font-heading italic text-xl font-bold text-[#2D8A68]">
                    {deal.signature || deal.brandName}
                  </span>
                </div>
              ) : signMode === 'draw' ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={80}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-20 bg-white border border-[#ECD9CB] rounded-xl cursor-crosshair touch-none"
                  />
                  {!hasSignature && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-[#8C726D] pointer-events-none">
                      Sign here with stylus or mouse
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => {
                      setTypedName(e.target.value);
                      setHasSignature(!!e.target.value.trim());
                    }}
                    placeholder="Type legal representative name..."
                    className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-sm text-[#230B0D] outline-none"
                  />
                  {typedName && (
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-heading italic text-lg font-bold text-[#59171B]">
                        {typedName}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[#7E635F] pt-1">
                <span>{deal.clientSigned ? `Signed by: ${deal.signature}` : 'Awaiting signature'}</span>
                {!deal.clientSigned && (
                  <button
                    onClick={handleAdoptSignature}
                    disabled={!hasSignature}
                    className="px-3 py-1.5 bg-[#59171B] hover:bg-[#451014] disabled:opacity-40 text-[#FED7B8] rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-payno-sm active:scale-95"
                  >
                    Adopt & Execute
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Mark Invoice Paid */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#ECD9CB] shadow-payno-lg space-y-5 text-[#230B0D] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EAF6EE] text-[#2D8A68] flex items-center justify-center font-bold">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold">Mark Invoice as Paid</h3>
                  <p className="text-[11px] text-[#7E635F]">Update accounting ledger</p>
                </div>
              </div>
              <button
                onClick={() => setShowMarkPaidModal(false)}
                className="text-xs text-[#7E635F] hover:text-[#230B0D]"
              >
                Close
              </button>
            </div>

            <div className="bg-[#FAF3EC] p-4 rounded-2xl border border-[#ECD9CB] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#7E635F]">Invoice Number:</span>
                <span className="font-mono font-bold text-[#230B0D]">{deal.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#7E635F]">Sponsor:</span>
                <span className="font-bold text-[#230B0D]">{deal.brandName}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-[#ECD9CB] pt-2">
                <span className="font-bold text-[#230B0D]">Settlement Sum:</span>
                <span className="font-heading text-lg font-bold text-[#2D8A68]">
                  ${deal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#7E635F]">
              Confirm that you have received payment directly via your bank account or payment link from {deal.brandName}.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMarkPaidModal(false)}
                className="flex-1 py-2.5 px-4 border border-[#ECD9CB] text-[#7E635F] hover:text-[#230B0D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkAsPaid}
                className="flex-1 py-2.5 px-4 bg-[#2D8A68] hover:bg-[#246e53] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-payno-sm active:scale-95"
              >
                Confirm Payment Received
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
