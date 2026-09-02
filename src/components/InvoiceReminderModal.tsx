import React, { useState } from 'react';
import { Deal, CreatorProfile } from '../types';
import { formatMoney } from '../utils/currency';
import { getBrandPortalUrl } from '../lib/cloudStore';
import {
  X,
  Send,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  FileCheck,
  ExternalLink
} from 'lucide-react';

interface InvoiceReminderModalProps {
  deal: Deal;
  creator: CreatorProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogReminder?: (updatedDeal: Deal) => void;
}

export const InvoiceReminderModal: React.FC<InvoiceReminderModalProps> = ({
  deal,
  creator,
  isOpen,
  onClose,
  onLogReminder,
}) => {
  const [templateType, setTemplateType] = useState<'due_soon' | 'overdue' | 'sign_contract' | 'review_deliverables'>('due_soon');
  const [copied, setCopied] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  const currency = deal.currency || creator.defaultCurrency || 'USD';
  const formattedTotal = formatMoney(deal.totalAmount, currency);
  const dueDateStr = deal.dueDate.split('T')[0];
  const brandPortalUrl = getBrandPortalUrl(deal.id);

  // Generate template text based on selection
  let subject = '';
  let body = '';

  const prefs = creator.paymentPreferences;
  let paymentDetails = '';
  if (prefs?.preferredMethod === 'payment_link' && prefs.paymentLink) {
    paymentDetails = `Direct Payment Link: ${prefs.paymentLink}`;
  } else if (prefs?.preferredMethod === 'bank_transfer' && prefs.bankName) {
    paymentDetails = `Bank: ${prefs.bankName}\nAccount Name: ${prefs.accountName || creator.name}\nAccount: ${prefs.accountNumber || '••••••••'}\nRouting / SWIFT: ${prefs.routingNumber || ''}`;
  } else if (prefs?.preferredMethod === 'paypal') {
    paymentDetails = `PayPal: ${prefs.paypalEmail || creator.email}`;
  }

  if (templateType === 'due_soon') {
    subject = `[Payment Reminder] Invoice ${deal.invoiceNumber} - ${deal.title} (${deal.brandName})`;
    body = `Dear ${deal.brandName} Accounts Payable & Partnerships Team,\n\nI hope you're having a wonderful week!\n\nThis is a friendly note regarding invoice ${deal.invoiceNumber} for the "${deal.title}" campaign.\n\n• Agreed Total: ${formattedTotal} ${currency}\n• Due Date: ${dueDateStr}\n• Secure Portal: ${brandPortalUrl}\n\n${paymentDetails ? `Payment Instructions:\n${paymentDetails}\n\n` : ''}${customNote ? `Note: ${customNote}\n\n` : ''}Please let us know once the remittance has been scheduled.\n\nWarm regards,\n${creator.name}\n${creator.handle}`;
  } else if (templateType === 'overdue') {
    subject = `[OVERDUE REMINDER] Invoice ${deal.invoiceNumber} for ${deal.brandName} (${formattedTotal})`;
    body = `Dear ${deal.brandName} Partnerships Team,\n\nAccording to our records, payment for invoice ${deal.invoiceNumber} ("${deal.title}") was due on ${dueDateStr} and remains outstanding.\n\n• Balance Due: ${formattedTotal} ${currency}\n• Due Date: ${dueDateStr} (Overdue)\n• Late Fee Term: ${deal.lateFeePercent}% per month\n• Pay Online & View Invoice: ${brandPortalUrl}\n\n${paymentDetails ? `Remittance Instructions:\n${paymentDetails}\n\n` : ''}${customNote ? `Note: ${customNote}\n\n` : ''}We kindly request you confirm the remittance timeline at your earliest convenience.\n\nThank you,\n${creator.name}`;
  } else if (templateType === 'sign_contract') {
    subject = `[Signature Request] Sponsorship Agreement for ${deal.title} - ${deal.brandName}`;
    body = `Hi ${deal.brandName} Team,\n\nI’ve finalized the Content Creation Agreement and deliverables schedule for "${deal.title}".\n\n• Campaign Scope: ${deal.deliverables.length} Deliverables\n• Agreed Budget: ${formattedTotal} ${currency}\n• Sign & Review: ${brandPortalUrl}\n\n${customNote ? `Note: ${customNote}\n\n` : ''}Please countersign through the secure portal so we can initiate production on schedule.\n\nBest,\n${creator.name}`;
  } else {
    subject = `[Deliverables Review] Assets Ready for Review - ${deal.title}`;
    body = `Hi ${deal.brandName} Team,\n\nThe campaign deliverables for "${deal.title}" have been submitted and are ready for your review!\n\n• Campaign: ${deal.title}\n• Invoice Ref: ${deal.invoiceNumber}\n• Review & Approve: ${brandPortalUrl}\n\n${customNote ? `Note: ${customNote}\n\n` : ''}Looking forward to your feedback!\n\nBest regards,\n${creator.name}`;
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const encTo = encodeURIComponent(deal.clientEmail);
    const encSub = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);
    window.location.href = `mailto:${encTo}?subject=${encSub}&body=${encBody}`;

    if (onLogReminder) {
      const updatedDeal: Deal = {
        ...deal,
        messages: [
          ...deal.messages,
          {
            id: 'msg-rem-' + Date.now(),
            sender: 'system',
            senderName: 'Madeal Reminder Engine',
            text: `Reminder notice sent to ${deal.clientEmail} ("${subject}")`,
            timestamp: 'Just now',
          },
        ],
      };
      onLogReminder(updatedDeal);
    }
  };

  const handleWhatsApp = () => {
    const encText = encodeURIComponent(`Hi ${deal.brandName}!\n\n${body}`);
    window.open(`https://wa.me/?text=${encText}`, '_blank');

    if (onLogReminder) {
      const updatedDeal: Deal = {
        ...deal,
        messages: [
          ...deal.messages,
          {
            id: 'msg-rem-wa-' + Date.now(),
            sender: 'system',
            senderName: 'Madeal Reminder Engine',
            text: `WhatsApp reminder dispatched for invoice ${deal.invoiceNumber}`,
            timestamp: 'Just now',
          },
        ],
      };
      onLogReminder(updatedDeal);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF3EC] rounded-3xl max-w-xl w-full border-2 border-[#59171B]/20 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150 text-[#230B0D]">
        
        {/* Header */}
        <div className="bg-[#59171B] text-[#FED7B8] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#FED7B8]" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-white leading-tight">
                1-Click Brand Reminders
              </h2>
              <span className="text-[11px] text-[#FED7B8]/80">
                {deal.brandName} • Ref: {deal.invoiceNumber}
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
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Template Selection Chips */}
          <div>
            <label className="text-[11px] font-bold text-[#7E635F] block mb-1.5 uppercase tracking-wider">
              SELECT NOTICE TEMPLATE
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('due_soon')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  templateType === 'due_soon'
                    ? 'bg-white border-[#59171B] text-[#59171B] shadow-payno-sm'
                    : 'bg-white/50 border-[#ECD9CB] text-[#7E635F] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Payment Due Soon</span>
                </div>
                <span className="text-[10px] text-[#7E635F] block mt-0.5">
                  Friendly pre-due date reminder
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('overdue')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  templateType === 'overdue'
                    ? 'bg-white border-[#A63A24] text-[#A63A24] shadow-payno-sm'
                    : 'bg-white/50 border-[#ECD9CB] text-[#7E635F] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Overdue Notice</span>
                </div>
                <span className="text-[10px] text-[#7E635F] block mt-0.5">
                  Formal notice + late fee clause
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('sign_contract')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  templateType === 'sign_contract'
                    ? 'bg-white border-[#59171B] text-[#59171B] shadow-payno-sm'
                    : 'bg-white/50 border-[#ECD9CB] text-[#7E635F] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Countersign Request</span>
                </div>
                <span className="text-[10px] text-[#7E635F] block mt-0.5">
                  Nudge brand to sign deed
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('review_deliverables')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  templateType === 'review_deliverables'
                    ? 'bg-white border-[#59171B] text-[#59171B] shadow-payno-sm'
                    : 'bg-white/50 border-[#ECD9CB] text-[#7E635F] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Deliverable Review</span>
                </div>
                <span className="text-[10px] text-[#7E635F] block mt-0.5">
                  Review & approve submitted assets
                </span>
              </button>
            </div>
          </div>

          {/* Optional custom note */}
          <div>
            <label className="text-[11px] font-bold text-[#7E635F] block mb-1 uppercase tracking-wider">
              OPTIONAL NOTE / ADDITION
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Please note our team will be out of office Friday."
              className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] bg-white text-xs text-[#230B0D] focus:outline-none focus:ring-2 focus:ring-[#59171B]/30"
            />
          </div>

          {/* Email Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                GENERATED MESSAGE PREVIEW
              </label>
              <span className="text-[10px] text-[#7E635F] font-mono">
                To: {deal.clientEmail}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-[#ECD9CB] shadow-payno-sm space-y-2">
              <div className="text-xs font-bold text-[#59171B] border-b border-[#ECD9CB] pb-2">
                Subject: {subject}
              </div>
              <div className="text-xs text-[#230B0D] font-mono whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                {body}
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={handleSendEmail}
              className="py-2.5 px-3 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
