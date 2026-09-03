import React, { useState, useRef, useEffect } from 'react';
import { Deal, CreatorProfile, CommunicationMessage } from '../types';
import {
  Lock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Send,
  Building,
  CreditCard,
  FileText,
  ShieldCheck,
  PenTool,
  Download,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { DeliverableTracker } from './DeliverableTracker';
import { exportInvoicePDF, exportContractPDF } from '../lib/pdfExport';
import { syncDealToCloud, getBrandPortalUrl } from '../lib/cloudStore';
import { formatMoney } from '../utils/currency';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

interface BrandPortalViewProps {
  deal: Deal;
  creator: CreatorProfile;
  onUpdateDeal: (deal: Deal) => void;
  onToggleDeliverable: (dealId: string, deliverableId: string, deliveredUrl?: string) => void;
  isStandalone?: boolean;
}

export const BrandPortalView: React.FC<BrandPortalViewProps> = ({
  deal,
  creator,
  onUpdateDeal,
  onToggleDeliverable,
  isStandalone = true,
}) => {
  const [activeTab, setActiveTab] = useState<'agreement' | 'messages' | 'payment'>('agreement');
  const [brandMessage, setBrandMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [brandSignMode, setBrandSignMode] = useState<'type' | 'draw'>('type');
  const [typedSignerName, setTypedSignerName] = useState(deal.signature || `${deal.brandName} Partnerships Team`);
  const [signerJobTitle, setSignerJobTitle] = useState('Marketing & Partnerships Lead');
  const [isSigning, setIsSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(deal.clientSigned);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const shareableUrl = getBrandPortalUrl(deal.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleBrandSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandMessage.trim()) return;

    const newMsg: CommunicationMessage = {
      id: 'msg-brand-' + Date.now(),
      sender: 'brand',
      senderName: `${deal.brandName} Sponsor`,
      text: brandMessage.trim(),
      timestamp: 'Just now',
    };

    const updatedDeal: Deal = {
      ...deal,
      messages: [...deal.messages, newMsg],
    };

    onUpdateDeal(updatedDeal);
    syncDealToCloud(updatedDeal);
    setBrandMessage('');
  };

  const handleBrandSignAgreement = () => {
    setIsSigning(true);
    const signer = typedSignerName.trim() || `${deal.brandName} Authorized Signer`;
    const fullSignerInfo = `${signer} (${signerJobTitle.trim() || 'Authorized Signer'})`;
    
    const updatedDeal: Deal = {
      ...deal,
      signature: fullSignerInfo,
      signedAt: new Date().toISOString(),
      clientSigned: true,
      status: deal.status === 'paid' ? 'paid' : 'active',
      messages: [
        ...deal.messages,
        {
          id: 'msg-brand-signed-' + Date.now(),
          sender: 'brand',
          senderName: `${deal.brandName} Lead`,
          text: `✅ Agreement digitally countersigned & approved by ${fullSignerInfo}`,
          timestamp: 'Just now',
          attachment: {
            type: 'contract',
            title: `Executed Agreement - ${deal.invoiceNumber}`,
          },
        },
      ],
    };

    onUpdateDeal(updatedDeal);
    syncDealToCloud(updatedDeal);
    setIsSigning(false);
    setSignedSuccess(true);
  };

  const payPref = creator.paymentPreferences || {
    preferredMethod: 'bank_transfer',
    paymentLink: 'https://buy.stripe.com/example_creator_payment_link',
    bankName: 'Standard Chartered / Global Bank',
    accountName: creator.name,
    accountNumber: '••••••••4892',
    routingNumber: '121000358',
    swiftBic: 'GLBAUS33',
    paypalEmail: creator.email,
    customInstructions: 'Please quote invoice reference number in payment description. Settlement due within 30 days.',
  };

  return (
    <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] flex flex-col font-sans selection:bg-[#59171B]/20 selection:text-[#59171B]">
      {/* Top Banner: Official Brand Portal Navigation */}
      <header className="bg-white border-b border-[#ECD9CB] sticky top-0 z-40 shadow-payno-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] font-bold text-base flex items-center justify-center shadow-payno-sm">
              {deal.brandName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-base sm:text-lg font-bold text-[#230B0D] leading-tight">
                  {deal.brandName} Partner Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#EAF6EE] text-[#2D8A68] border border-[#C2E7D1] text-[10px] font-bold">
                  Verified Agreement
                </span>
              </div>
              <p className="text-xs text-[#7E635F]">
                Creator Agreement with <strong className="text-[#59171B]">{creator.name}</strong> ({creator.handle})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-[#FAF3EC] p-1 rounded-xl border border-[#ECD9CB]">
              <button
                type="button"
                onClick={() => exportInvoicePDF(deal, creator)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#59171B] hover:text-[#FED7B8] text-xs font-bold text-[#59171B] border border-[#ECD9CB] transition-all flex items-center gap-1 cursor-pointer shadow-payno-sm"
                title="Download Official Tax Invoice PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Invoice PDF</span>
              </button>
              <button
                type="button"
                onClick={() => exportContractPDF(deal, creator)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#59171B] hover:text-[#FED7B8] text-xs font-bold text-[#59171B] border border-[#ECD9CB] transition-all flex items-center gap-1 cursor-pointer shadow-payno-sm"
                title="Download Signed Deed Agreement PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Deed PDF</span>
              </button>
            </div>

            <div className="text-right">
              <span className="font-heading text-lg sm:text-xl font-bold text-[#59171B] block">
                ${deal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="block text-[10px] text-[#7E635F] font-mono">
                Ref: #{deal.invoiceNumber}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        
        {/* Status Callout Bar */}
        <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              deal.clientSigned ? 'bg-[#EAF6EE] text-[#2D8A68]' : 'bg-[#FFF2E6] text-[#A63A24]'
            }`}>
              {deal.clientSigned ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-[#230B0D]">
                  {deal.clientSigned ? 'Agreement Executed & Active' : 'Action Required: Countersign Agreement'}
                </span>
                <span className="text-xs text-[#7E635F]">• Due {new Date(deal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <p className="text-xs text-[#7E635F]">
                {deal.clientSigned
                  ? `Signed on ${deal.signedAt ? new Date(deal.signedAt).toLocaleDateString() : 'Active'} by ${deal.signature}`
                  : 'Please review deliverables and execute digital signature below to finalize campaign booking.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
              title="Copy portal link for your team or finance department"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#2D8A68]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Portal Link'}</span>
            </button>
          </div>
        </div>

        {/* Portal Tabs Navigation */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#FAF3EC] p-1.5 rounded-2xl border border-[#ECD9CB] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('agreement')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'agreement'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D] hover:bg-white/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Agreement & Scope</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D] hover:bg-white/60'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Discussion ({deal.messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'payment'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D] hover:bg-white/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Invoice & Bank Details</span>
          </button>
        </div>

        {/* Tab 1: Agreement & Deliverables Scope */}
        {activeTab === 'agreement' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Campaign Summary & Terms */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#ECD9CB] shadow-payno-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5E8DC] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#59171B] bg-[#FAF3EC] px-2.5 py-1 rounded-full border border-[#ECD9CB]">
                    Campaign Scope Overview
                  </span>
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-[#230B0D] mt-2">
                    {deal.title}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#7E635F] block">Total Agreed Fee:</span>
                  <span className="font-heading text-xl font-bold text-[#59171B]">
                    ${deal.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Key Deal Terms Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#FAF3EC] p-3 rounded-2xl border border-[#ECD9CB]">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Usage Rights</span>
                  <span className="font-semibold text-[#230B0D]">{deal.usageTerm || '30 Days Standard Organic'}</span>
                </div>
                <div className="bg-[#FAF3EC] p-3 rounded-2xl border border-[#ECD9CB]">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Exclusivity</span>
                  <span className="font-semibold text-[#230B0D]">{deal.exclusivity || 'Non-Exclusive Category'}</span>
                </div>
                <div className="bg-[#FAF3EC] p-3 rounded-2xl border border-[#ECD9CB]">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Included Revisions</span>
                  <span className="font-semibold text-[#230B0D]">{deal.revisions || 2} Rounds Included</span>
                </div>
                <div className="bg-[#FAF3EC] p-3 rounded-2xl border border-[#ECD9CB]">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Late Settlement</span>
                  <span className="font-semibold text-[#230B0D]">{deal.lateFeePercent || 1.5}% / month</span>
                </div>
                <div className="bg-[#FAF3EC] p-3 rounded-2xl border border-[#ECD9CB]">
                  <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Cancellation Fee</span>
                  <span className="font-semibold text-[#230B0D]">{deal.cancellationFeePercent ?? 20}% if cancelled</span>
                </div>
              </div>

              {/* Scope of Deliverables Fulfillment */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#59171B]">
                    Agreed Deliverables & Proof of Fulfillment
                  </h3>
                  <span className="text-xs text-[#7E635F]">
                    {deal.deliverables.filter((d) => d.completed).length} of {deal.deliverables.length} Delivered
                  </span>
                </div>
                <DeliverableTracker
                  dealId={deal.id}
                  brandName={deal.brandName}
                  deliverables={deal.deliverables}
                  onToggleDeliverable={onToggleDeliverable}
                />
              </div>
            </div>

            {/* Digital Countersign Pad Section */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-[#59171B]/30 shadow-payno-md space-y-4">
              <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#59171B]" />
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#230B0D]">
                      Authorized Brand Digital Execution
                    </h3>
                    <p className="text-xs text-[#7E635F]">
                      Legally binding countersignature under the Electronic Signatures in Global and National Commerce Act.
                    </p>
                  </div>
                </div>
              </div>

              {deal.clientSigned ? (
                <div className="bg-[#EAF6EE] p-5 rounded-2xl border border-[#C2E7D1] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#2D8A68]">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Agreement Successfully Counter-Signed & Executed</span>
                    </div>
                    <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-full text-[#2D8A68] border border-[#C2E7D1]">
                      Hash: {deal.id.slice(0, 10).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#230B0D]">
                    Authorized Signer: <strong className="font-mono text-[#59171B]">{deal.signature}</strong>
                  </p>
                  <p className="text-xs text-[#7E635F]">
                    Execution Timestamp: {deal.signedAt ? new Date(deal.signedAt).toLocaleString() : 'Executed'}
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => exportContractPDF(deal, creator)}
                      className="px-3 py-1.5 bg-[#59171B] text-[#FED7B8] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Executed Deed PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#7E635F] uppercase mb-1">
                        Signer Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={typedSignerName}
                        onChange={(e) => setTypedSignerName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#7E635F] uppercase mb-1">
                        Official Title / Company Role
                      </label>
                      <input
                        type="text"
                        value={signerJobTitle}
                        onChange={(e) => setSignerJobTitle(e.target.value)}
                        placeholder="e.g. VP Marketing, Brand Manager"
                        className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] text-[11px] text-[#7E635F] leading-relaxed">
                    By clicking <strong>"Sign & Execute Agreement"</strong>, you acknowledge that you have the corporate authority to bind <strong>{deal.brandName}</strong> to the terms, deliverables, and payment fee specified in this agreement.
                  </div>

                  <button
                    type="button"
                    disabled={isSigning || !typedSignerName.trim()}
                    onClick={handleBrandSignAgreement}
                    className="w-full py-3 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-sm font-bold rounded-2xl shadow-payno-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Sign & Execute Agreement as {deal.brandName}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Brand ↔ Creator Discussion Thread */}
        {activeTab === 'messages' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#ECD9CB] shadow-payno-sm space-y-4">
              <div className="border-b border-[#F5E8DC] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#230B0D]">
                    Direct Discussion with {creator.name}
                  </h3>
                  <p className="text-xs text-[#7E635F]">
                    Fast feedback, timeline questions, or creative briefing notes.
                  </p>
                </div>
                <span className="text-xs font-bold bg-[#FAF3EC] text-[#59171B] px-3 py-1 rounded-full border border-[#ECD9CB]">
                  Campaign #{deal.invoiceNumber}
                </span>
              </div>

              {/* Message Thread Box */}
              <div className="space-y-3 min-h-[280px] max-h-[420px] overflow-y-auto pr-1">
                {deal.messages.map((msg) => {
                  const isBrand = msg.sender === 'brand';
                  const isSystem = msg.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="inline-block text-[11px] bg-[#FAF3EC] text-[#7E635F] px-3 py-1 rounded-full border border-[#ECD9CB]">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBrand ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-[#7E635F] px-1 mb-0.5">
                        {msg.senderName} • {msg.timestamp}
                      </span>
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isBrand
                            ? 'bg-[#59171B] text-[#FED7B8] rounded-tr-xs'
                            : 'bg-[#FAF3EC] text-[#230B0D] border border-[#ECD9CB] rounded-tl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                        {msg.attachment && msg.attachment.url && (
                          <a
                            href={msg.attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#59171B] font-bold text-[11px] hover:underline shadow-payno-sm"
                          >
                            <span>Open Attachment: {msg.attachment.title}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Form */}
              <form onSubmit={handleBrandSendMessage} className="flex gap-2 pt-3 border-t border-[#F5E8DC]">
                <input
                  type="text"
                  value={brandMessage}
                  onChange={(e) => setBrandMessage(e.target.value)}
                  placeholder={`Send feedback or questions to ${creator.name.split(' ')[0]}...`}
                  className="flex-1 bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none font-medium"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] rounded-2xl text-xs font-bold transition-all shadow-payno-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Invoice Statement & Remittance Details */}
        {activeTab === 'payment' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#ECD9CB] shadow-payno-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5E8DC] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#59171B] bg-[#FAF3EC] px-2.5 py-1 rounded-full border border-[#ECD9CB]">
                    Official Remittance Statement
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#230B0D] mt-2">
                    Invoice #{deal.invoiceNumber}
                  </h3>
                  <p className="text-xs text-[#7E635F]">
                    Beneficiary Payee: {creator.name} ({creator.email})
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-heading text-2xl font-bold text-[#59171B] block">
                    {formatMoney(deal.totalAmount, deal.currency || creator.defaultCurrency || 'USD')}
                  </span>
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                    deal.status === 'paid' ? 'bg-[#EAF6EE] text-[#2D8A68]' : 'bg-[#FFF2E6] text-[#A63A24]'
                  }`}>
                    {deal.status === 'paid' ? 'Settled & Paid' : 'Payment Outstanding'}
                  </span>
                </div>
              </div>

              {/* Instant Online Payment Option */}
              {deal.status !== 'paid' ? (
                <div className="bg-[#59171B] text-[#FED7B8] p-5 rounded-2xl shadow-payno-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#FED7B8]" />
                      Instant Portal Checkout (Card / Apple Pay / Google Pay)
                    </span>
                    <span className="text-[10px] bg-white/20 text-[#FED7B8] px-2.5 py-0.5 rounded-full font-mono font-bold">
                      Zero Fees
                    </span>
                  </div>
                  <p className="text-xs text-[#FED7B8]/80">
                    Settle this invoice immediately with corporate card or mobile wallet. Verified payment receipt is issued automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-3 bg-[#FED7B8] hover:bg-white text-[#59171B] font-bold text-xs rounded-xl shadow-payno-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatMoney(deal.totalAmount, deal.currency || creator.defaultCurrency || 'USD')} via Instant Checkout</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold block">Invoice Fully Settled</span>
                      <span className="text-[11px] text-emerald-700">
                        Paid via {deal.paymentMethodUsed || 'Instant Online Checkout'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportInvoicePDF(deal, creator)}
                    className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1 shadow-payno-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Receipt PDF</span>
                  </button>
                </div>
              )}

              {/* Direct Bank / Wire Transfer Details */}
              <div className="bg-[#FAF3EC] p-4 sm:p-5 rounded-2xl border border-[#ECD9CB] space-y-3.5">
                <span className="text-xs font-bold text-[#59171B] flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  Direct Bank Wire & EFT Remittance Details
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Bank Name</span>
                    <span className="font-semibold text-[#230B0D] truncate block">{payPref.bankName || 'Standard Chartered'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Account Holder</span>
                    <span className="font-semibold text-[#230B0D] truncate block">{payPref.accountName || creator.name}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Account / IBAN</span>
                    <span className="font-mono font-semibold text-[#230B0D] block">{payPref.accountNumber || '••••4892'}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">Routing / SWIFT</span>
                    <span className="font-mono font-semibold text-[#230B0D] block">{payPref.routingNumber || payPref.swiftBic || '121000358'}</span>
                  </div>
                </div>

                <div className="text-xs text-[#7E635F] bg-white p-3.5 rounded-xl border border-[#ECD9CB]/80">
                  <span className="font-bold text-[#230B0D]">Mandatory Wire Reference: </span>
                  {payPref.customInstructions || `Please quote invoice reference ${deal.invoiceNumber} in payment details.`}
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => exportInvoicePDF(deal, creator)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-xs font-bold text-[#59171B] transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official Invoice PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportContractPDF(deal, creator)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-xs font-bold text-[#59171B] transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Deed PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#ECD9CB] py-4 text-center text-xs text-[#7E635F] mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-[#59171B]" />
            <span>Secure Sandboxed Brand Portal • Powered by Madeal</span>
          </div>
          <span className="text-[11px] font-mono text-[#7E635F]">
            Invoice #{deal.invoiceNumber}
          </span>
        </div>
      </footer>

      {/* Instant Checkout Modal */}
      <PaymentCheckoutModal
        deal={deal}
        creator={creator}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentSuccess={(updatedDeal) => {
          onUpdateDeal(updatedDeal);
          syncDealToCloud(updatedDeal);
        }}
      />
    </div>
  );
};
