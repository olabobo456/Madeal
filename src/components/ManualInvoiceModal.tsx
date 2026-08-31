import React, { useState } from 'react';
import { Deal, DeliverableItem, CreatorProfile } from '../types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Building,
  Link2,
  FileText,
  Sparkles,
  Check,
} from 'lucide-react';
import { generateSecureId } from '../utils/id';

interface ManualInvoiceModalProps {
  creator: CreatorProfile;
  creatorId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (newDeal: Deal) => void;
}

export const ManualInvoiceModal: React.FC<ManualInvoiceModalProps> = ({
  creator,
  creatorId,
  isOpen,
  onClose,
  onSaveInvoice,
}) => {
  // Brand & Client Info
  const [brandName, setBrandName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [dueDateDays, setDueDateDays] = useState(30);
  const [notes, setNotes] = useState('');

  // Deliverables Line Items
  const firstRate = creator.rateCards && creator.rateCards.length > 0
    ? creator.rateCards[0].rate
    : 1500;

  const [items, setItems] = useState<DeliverableItem[]>([
    {
      id: 'inv-item-1',
      type: 'custom',
      title: 'Creator Deliverables & Commercial Usage',
      description: 'Branded campaign content creation and publishing',
      baseRate: firstRate,
      quantity: 1,
      completed: false,
    },
  ]);

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.baseRate) || 0) * (item.quantity || 1),
    0
  );

  const handleAddItem = () => {
    const newItem: DeliverableItem = {
      id: 'inv-item-' + Date.now(),
      type: 'custom',
      title: 'Additional Deliverable / Scope Add-on',
      description: 'Extended content scope or additional platform publishing',
      baseRate: 500,
      quantity: 1,
      completed: false,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<DeliverableItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleApplyPresetCard = (platform: string, format: string, rate: number) => {
    const newItem: DeliverableItem = {
      id: 'inv-item-' + Date.now(),
      type: 'custom',
      title: `${platform} ${format}`,
      description: `${platform} content asset according to agreed specifications`,
      baseRate: rate,
      quantity: 1,
      completed: false,
    };
    setItems([...items, newItem]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrandName = brandName.trim() || 'Brand Partner';
    const now = new Date();
    const dueDate = new Date(Date.now() + dueDateDays * 24 * 60 * 60 * 1000).toISOString();
    const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newDeal: Deal = {
      id: generateSecureId('deal-inv'),
      creatorId,
      title: invoiceTitle.trim() || `${finalBrandName} Invoice Statement`,
      brandName: finalBrandName,
      creatorHandle: creator.handle,
      creatorEmail: creator.email,
      clientEmail: clientEmail.trim() || 'finance@brand.com',
      status: 'active',
      createdAt: now.toISOString(),
      dueDate,
      deliverables: items,
      exclusivity: 'Non-Exclusive',
      usageTerm: '30 Days Standard Usage',
      revisions: 2,
      lateFeePercent: 1.5,
      totalAmount,
      invoiceNumber,
      clientSigned: false,
      notes: notes.trim() || creator.paymentPreferences?.customInstructions || '',
      messages: [
        {
          id: 'msg-inv-init-' + Date.now(),
          sender: 'system',
          senderName: 'Invoicing System',
          text: `Invoice ${invoiceNumber} generated for ${finalBrandName} ($${totalAmount.toLocaleString()})`,
          timestamp: 'Just now',
          attachment: {
            type: 'invoice',
            title: `${invoiceNumber} Statement`,
          },
        },
      ],
    };

    onSaveInvoice(newDeal);
    onClose();
  };

  const availableRateCards = creator.rateCards || [
    { id: '1', platform: 'TikTok', format: 'Video', rate: 1500 },
    { id: '2', platform: 'Instagram', format: 'Reel', rate: 1200 },
    { id: '3', platform: 'Facebook', format: 'Post / Video', rate: 950 },
    { id: '4', platform: 'YouTube', format: 'Sponsorship', rate: 2500 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#ECD9CB] shadow-payno-lg space-y-6 text-[#230B0D] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center font-bold shadow-payno-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#230B0D]">
                Generate Creator Invoice
              </h3>
              <p className="text-xs text-[#7E635F]">
                Create a customized itemized invoice with direct payment instructions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7E635F] hover:text-[#230B0D] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Brand & Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                Bill To: Client / Brand Name *
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Lumina Skincare, Gymshark, Agency..."
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                Client / Accounts Email
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="finance@brand.com"
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] outline-none"
              />
            </div>
          </div>

          {/* Invoice Subject & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                Invoice Reference / Project Title
              </label>
              <input
                type="text"
                value={invoiceTitle}
                onChange={(e) => setInvoiceTitle(e.target.value)}
                placeholder="e.g. Creator Content & Publishing Campaign"
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                Payment Due Date
              </label>
              <select
                value={dueDateDays}
                onChange={(e) => setDueDateDays(Number(e.target.value))}
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] font-medium outline-none cursor-pointer"
              >
                <option value={7}>Due in 7 Days (7 days from invoice date)</option>
                <option value={14}>Due in 14 Days (14 days from invoice date)</option>
                <option value={30}>Due in 30 Days (Standard 30-day payment term)</option>
                <option value={60}>Due in 60 Days (60-day payment term)</option>
              </select>
            </div>
          </div>

          {/* Quick Rate Card Add-ons */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                Insert From Your Rate Cards
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableRateCards.map((rc) => (
                <button
                  key={rc.id}
                  type="button"
                  onClick={() => handleApplyPresetCard(rc.platform, rc.format, rc.rate)}
                  className="px-2.5 py-1 bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB] rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="font-bold">{rc.platform}</span>
                  <span>{rc.format}</span>
                  <span className="font-mono text-[#59171B]">(${rc.rate})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line Items List */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                Invoice Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] font-bold text-[#59171B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAF3EC] p-3 rounded-2xl border border-[#ECD9CB] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                      placeholder="Item name / platform format..."
                      className="flex-1 bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-1.5 text-xs font-bold text-[#230B0D] outline-none"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-[#7E635F] hover:text-[#B82C3A] rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { description: e.target.value })
                        }
                        placeholder="Description / deliverable details..."
                        className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-1.5 text-xs text-[#7E635F] outline-none"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs font-bold text-[#7E635F]">
                        $
                      </span>
                      <input
                        type="number"
                        value={item.baseRate}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { baseRate: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl pl-6 pr-2 py-1.5 text-xs font-mono font-bold text-[#230B0D] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Notes for Brand */}
          <div className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] space-y-2">
            <span className="text-[11px] font-bold text-[#59171B] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              Payment Notes & Remittance Details
            </span>
            <p className="text-[10px] text-[#7E635F]">
              Your configured payment details ({creator.paymentPreferences?.preferredMethod === 'payment_link' ? 'Direct Payment Link' : 'Bank Transfer Details'}) will be printed on this invoice for direct settlement.
            </p>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please quote the invoice reference number in the payment description. Payment due within 30 days."
              className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none resize-none"
            />
          </div>

          {/* Invoice Summary Total */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#ECD9CB] flex items-center justify-between shadow-payno-sm">
            <span className="text-xs font-bold text-[#7E635F]">Total Invoice Amount:</span>
            <span className="font-heading text-xl font-bold text-[#59171B]">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#F5E8DC] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-[#ECD9CB] text-[#7E635F] hover:text-[#230B0D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-payno-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
