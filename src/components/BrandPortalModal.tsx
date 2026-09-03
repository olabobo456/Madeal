import React, { useState, useRef, useEffect } from 'react';
import { Deal, CreatorProfile, CommunicationMessage } from '../types';
import {
  X,
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
  RotateCcw,
  AlertCircle,
  Download,
} from 'lucide-react';
import { DeliverableTracker } from './DeliverableTracker';
import { exportInvoicePDF, exportContractPDF } from '../lib/pdfExport';
import { getBrandPortalUrl } from '../lib/cloudStore';
import { formatMoney } from '../utils/currency';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

interface BrandPortalModalProps {
  deal: Deal;
  creator: CreatorProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDeal: (deal: Deal) => void;
  onToggleDeliverable: (dealId: string, deliverableId: string, deliveredUrl?: string) => void;
}

export const BrandPortalModal: React.FC<BrandPortalModalProps> = ({
  deal,
  creator,
  isOpen,
  onClose,
  onUpdateDeal,
  onToggleDeliverable,
}) => {
  const [activeTab, setActiveTab] = useState<'agreement' | 'messages' | 'payment'>('agreement');
  const [brandMessage, setBrandMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [brandSignMode, setBrandSignMode] = useState<'draw' | 'type'>('type');
  const [typedSignerName, setTypedSignerName] = useState(deal.signature || `${deal.brandName} Partnerships Team`);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasCanvasDrawn, setHasCanvasDrawn] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeTab === 'agreement' && brandSignMode === 'draw' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#59171B';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab, brandSignMode]);

  if (!isOpen) return null;

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
    setBrandMessage('');
  };

  const handleBrandSignAgreement = () => {
    const signer = typedSignerName.trim() || `${deal.brandName} Authorized Signer`;
    const updatedDeal: Deal = {
      ...deal,
      signature: signer,
      signedAt: new Date().toISOString(),
      clientSigned: true,
      status: deal.status === 'paid' ? 'paid' : 'active',
      messages: [
        ...deal.messages,
        {
          id: 'msg-brand-signed-' + Date.now(),
          sender: 'brand',
          senderName: `${deal.brandName} Lead`,
          text: `Signed and executed agreement via Brand Partner Portal (${signer})`,
          timestamp: 'Just now',
          attachment: {
            type: 'contract',
            title: `Executed Agreement - ${deal.invoiceNumber}`,
          },
        },
      ],
    };

    onUpdateDeal(updatedDeal);
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF3EC] rounded-3xl max-w-2xl w-full border-2 border-[#59171B]/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 text-[#230B0D]">
        
        {/* Security / Privacy Guarantee Callout & Controls */}
        <div className="bg-[#FFF2E6] border-b border-[#FED7B8] px-4 py-3 flex items-center justify-between text-[11px] text-[#A63A24] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#59171B] shrink-0" />
            <span>
              <strong>Brand Privacy:</strong> This portal is isolated for <strong>{deal.brandName}</strong> and only displays agreed campaign details.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#FED7B8] hover:bg-[#FAF3EC] text-[#59171B] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-payno-sm"
              title="Copy secure link sent to brand"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied' : 'Copy brand Link'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/5 text-[#59171B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brand Portal Clean Navbar */}
        <div className="bg-white px-5 py-3.5 border-b border-[#ECD9CB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] font-bold text-base flex items-center justify-center shadow-payno-sm">
              {deal.brandName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-[#230B0D] leading-tight">
                {deal.brandName} Partnership Portal
              </h2>
              <p className="text-[11px] text-[#7E635F]">
                Creator Agreement & Invoice with <strong className="text-[#59171B]">{creator.name}</strong> ({creator.handle})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => exportInvoicePDF(deal, creator)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF3EC] hover:bg-[#59171B] hover:text-[#FED7B8] text-[11px] font-bold text-[#59171B] border border-[#ECD9CB] transition-all flex items-center gap-1 cursor-pointer shadow-payno-sm"
              title="Download Official Tax Invoice PDF"
            >
              <Download className="w-3 h-3" />
              <span>Invoice PDF</span>
            </button>
            <button
              type="button"
              onClick={() => exportContractPDF(deal, creator)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF3EC] hover:bg-[#59171B] hover:text-[#FED7B8] text-[11px] font-bold text-[#59171B] border border-[#ECD9CB] transition-all flex items-center gap-1 cursor-pointer shadow-payno-sm"
              title="Download Signed Deed Agreement PDF"
            >
              <Download className="w-3 h-3" />
              <span>Deed PDF</span>
            </button>
          </div>
        </div>

        {/* Brand Portal Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#F5E8DC]/60 p-1.5 border-b border-[#ECD9CB] text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('agreement')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'agreement'
                ? 'bg-white text-[#59171B] shadow-payno-sm border border-[#ECD9CB]'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Agreement & Deliverables</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('messages')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'messages'
                ? 'bg-white text-[#59171B] shadow-payno-sm border border-[#ECD9CB]'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Brand Discussion ({deal.messages.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'payment'
                ? 'bg-white text-[#59171B] shadow-payno-sm border border-[#ECD9CB]'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Invoice & Settlement</span>
          </button>
        </div>

        {/* Portal Body (Scrollable) */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 bg-white/50">
          
          {/* TAB 1: Agreement, Terms & Digital Signature */}
          {activeTab === 'agreement' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Campaign Summary & Terms */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECD9CB] shadow-payno-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#230B0D]">
                      {deal.title}
                    </h3>
                    <p className="text-xs text-[#7E635F]">
                      Payment Due: {new Date(deal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {deal.clientSigned ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF6EE] text-[#2D8A68] border border-[#C2E7D1]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Signed & Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF2E6] text-[#A63A24] border border-[#FED7B8]">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Brand Signature
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Legal Conditions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-[#FAF3EC] p-2.5 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Usage Term</span>
                    <span className="font-semibold text-[#230B0D]">{deal.usageTerm || '30 Days Standard'}</span>
                  </div>
                  <div className="bg-[#FAF3EC] p-2.5 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Exclusivity</span>
                    <span className="font-semibold text-[#230B0D]">{deal.exclusivity || 'Non-Exclusive'}</span>
                  </div>
                  <div className="bg-[#FAF3EC] p-2.5 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Included Revisions</span>
                    <span className="font-semibold text-[#230B0D]">{deal.revisions || 2} Rounds</span>
                  </div>
                  <div className="bg-[#FAF3EC] p-2.5 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Late Settlement</span>
                    <span className="font-semibold text-[#230B0D]">{deal.lateFeePercent || 1.5}% / mo</span>
                  </div>
                  <div className="bg-[#FAF3EC] p-2.5 rounded-xl border border-[#ECD9CB]/80">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Cancellation Fee</span>
                    <span className="font-semibold text-[#230B0D]">{deal.cancellationFeePercent ?? 20}% if cancelled</span>
                  </div>
                </div>

                {/* Deliverables Scope & Live Fulfillment Tracker */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#59171B] block mb-2">
                    Scope of Deliverables
                  </span>
                  <DeliverableTracker
                    dealId={deal.id}
                    brandName={deal.brandName}
                    deliverables={deal.deliverables}
                    onToggleDeliverable={onToggleDeliverable}
                  />
                </div>
              </div>

              {/* Digital Signing Section for the Brand */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECD9CB] shadow-payno-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-2">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-[#230B0D]">
                      Authorized Brand Signature
                    </h4>
                    <p className="text-xs text-[#7E635F]">
                      Sign below to legally execute this creator collaboration agreement.
                    </p>
                  </div>
                </div>

                {deal.clientSigned ? (
                  <div className="bg-[#EAF6EE] p-4 rounded-xl border border-[#C2E7D1] space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#2D8A68]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Agreement Executed & Counter-signed</span>
                    </div>
                    <p className="text-[#230B0D]">
                      Signer: <strong className="font-mono">{deal.signature || 'Brand Partner'}</strong>
                    </p>
                    <p className="text-[10px] text-[#7E635F]">
                      Timestamp: {deal.signedAt ? new Date(deal.signedAt).toLocaleString() : 'Executed'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setBrandSignMode('type')}
                        className={`px-3 py-1 rounded-lg font-semibold cursor-pointer ${
                          brandSignMode === 'type'
                            ? 'bg-[#59171B] text-[#FED7B8]'
                            : 'bg-[#FAF3EC] text-[#7E635F]'
                        }`}
                      >
                        Type Signature
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#7E635F] uppercase">
                        Signer Full Name & Title
                      </label>
                      <input
                        type="text"
                        value={typedSignerName}
                        onChange={(e) => setTypedSignerName(e.target.value)}
                        placeholder="e.g. Jane Doe, VP Marketing"
                        className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleBrandSignAgreement}
                      className="w-full py-2.5 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold rounded-xl shadow-payno-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Sign Agreement as {deal.brandName}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Brand Messaging Thread */}
          {activeTab === 'messages' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECD9CB] shadow-payno-sm space-y-4">
                <div className="border-b border-[#F5E8DC] pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#230B0D]">
                      Direct Discussion with {creator.name}
                    </h3>
                    <p className="text-xs text-[#7E635F]">
                      Messages sent here appear directly in the creator's inbox.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-[#FAF3EC] text-[#59171B] px-2 py-0.5 rounded-full border border-[#ECD9CB]">
                    Campaign #{deal.invoiceNumber}
                  </span>
                </div>

                {/* Message Log */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {deal.messages.map((msg) => {
                    const isBrand = msg.sender === 'brand';
                    const isSystem = msg.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center my-2">
                          <span className="inline-block text-[10px] bg-[#FAF3EC] text-[#7E635F] px-2.5 py-0.5 rounded-full border border-[#ECD9CB]">
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
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
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
                              className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#59171B] font-bold text-[10px] hover:underline"
                            >
                              <span>View Deliverable: {msg.attachment.title}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Send Brand Message Form */}
                <form onSubmit={handleBrandSendMessage} className="flex gap-2 pt-2 border-t border-[#F5E8DC]">
                  <input
                    type="text"
                    value={brandMessage}
                    onChange={(e) => setBrandMessage(e.target.value)}
                    placeholder={`Message ${creator.name.split(' ')[0]} directly (e.g. feedback on draft, timeline update)...`}
                    className="flex-1 bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] rounded-xl text-xs font-bold transition-all shadow-payno-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Invoice Statement & Settlement Instructions */}
          {activeTab === 'payment' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECD9CB] shadow-payno-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-3">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#230B0D]">
                      Invoice Statement: {deal.invoiceNumber}
                    </h3>
                    <p className="text-xs text-[#7E635F]">
                      Payee: {creator.name} ({creator.email})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-heading text-xl font-bold text-[#59171B]">
                      {formatMoney(deal.totalAmount, deal.currency || creator.defaultCurrency || 'USD')}
                    </span>
                    <span className="block text-[10px] text-[#7E635F]">
                      Status: {deal.status === 'paid' ? 'Settled & Paid' : 'Payment Due'}
                    </span>
                  </div>
                </div>

                {/* Instant Online Payment Trigger */}
                {deal.status !== 'paid' ? (
                  <div className="bg-[#59171B] text-[#FED7B8] p-4 sm:p-5 rounded-2xl shadow-payno-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#FED7B8]" />
                        Instant Portal Checkout (Card / Apple Pay / Google Pay)
                      </span>
                      <span className="text-[10px] bg-white/20 text-[#FED7B8] px-2 py-0.5 rounded-full font-mono font-bold">
                        Zero Fees
                      </span>
                    </div>
                    <p className="text-xs text-[#FED7B8]/80">
                      Settle this invoice in seconds. Generates instant verified tax receipt and updates agreement ledger.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full py-2.5 bg-[#FED7B8] hover:bg-white text-[#59171B] font-bold text-xs rounded-xl shadow-payno-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay {formatMoney(deal.totalAmount, deal.currency || creator.defaultCurrency || 'USD')} via Instant Checkout</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold block">Invoice Fully Paid</span>
                        <span className="text-[11px] text-emerald-700">
                          Settled via {deal.paymentMethodUsed || 'Instant Online Payment'}
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
                <div className="bg-[#FAF3EC] p-4 rounded-2xl border border-[#ECD9CB] space-y-3">
                  <span className="text-xs font-bold text-[#59171B] flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    Direct Bank Transfer & Wire Details
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-[#ECD9CB]/80">
                      <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Bank Name</span>
                      <span className="font-semibold text-[#230B0D] truncate block">{payPref.bankName || 'Standard Chartered'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#ECD9CB]/80">
                      <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Beneficiary Name</span>
                      <span className="font-semibold text-[#230B0D] truncate block">{payPref.accountName || creator.name}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#ECD9CB]/80">
                      <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Account / IBAN</span>
                      <span className="font-mono font-semibold text-[#230B0D] block">{payPref.accountNumber || '••••4892'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-[#ECD9CB]/80">
                      <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Routing / SWIFT</span>
                      <span className="font-mono font-semibold text-[#230B0D] block">{payPref.routingNumber || payPref.swiftBic || '121000358'}</span>
                    </div>
                  </div>

                  {/* Payment Remarks */}
                  <div className="text-[11px] text-[#7E635F] bg-white p-3 rounded-xl border border-[#ECD9CB]/80">
                    <span className="font-bold text-[#230B0D]">Payment Reference Instruction: </span>
                    {payPref.customInstructions || `Please quote invoice reference ${deal.invoiceNumber} in payment details.`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-3.5 sm:p-4 border-t border-[#ECD9CB] flex items-center justify-end text-xs shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB] font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Brand Preview
          </button>
        </div>

      </div>

      {/* Instant Checkout Modal */}
      <PaymentCheckoutModal
        deal={deal}
        creator={creator}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onPaymentSuccess={(updatedDeal) => {
          onUpdateDeal(updatedDeal);
        }}
      />
    </div>
  );
};
