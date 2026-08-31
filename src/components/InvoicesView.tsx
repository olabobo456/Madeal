import React, { useState } from 'react';
import { Deal, CreatorProfile } from '../types';
import {
  ChevronRight,
  Plus,
  FileText,
  DollarSign,
  Building,
  Link2,
  CheckCircle2,
  Clock,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Eye,
  BellRing,
  Download,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import { ManualInvoiceModal } from './ManualInvoiceModal';
import { exportInvoicePDF } from '../lib/pdfExport';
import { formatMoney } from '../utils/currency';
import { InvoiceReminderModal } from './InvoiceReminderModal';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

interface InvoicesViewProps {
  deals: Deal[];
  creator: CreatorProfile;
  creatorId: string;
  onSelectDeal: (deal: Deal) => void;
  onOpenCommunications: (brandName: string) => void;
  onSaveDeal: (deal: Deal) => void;
  onOpenProfile: () => void;
  onOpenBrandPreview?: (deal: Deal) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  deals,
  creator,
  creatorId,
  onSelectDeal,
  onSaveDeal,
  onOpenProfile,
  onOpenBrandPreview,
}) => {
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reminderDeal, setReminderDeal] = useState<Deal | null>(null);
  const [checkoutDeal, setCheckoutDeal] = useState<Deal | null>(null);

  const filtered = deals.filter((d) => {
    if (filter === 'paid' && d.status !== 'paid') return false;
    if (filter === 'unpaid' && d.status === 'paid') return false;
    if (
      search &&
      !d.invoiceNumber.toLowerCase().includes(search.toLowerCase()) &&
      !d.brandName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalOutstanding = deals
    .filter((d) => d.status !== 'paid')
    .reduce((sum, d) => sum + d.totalAmount, 0);

  const totalPaid = deals
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + d.totalAmount, 0);

  const handleCreateManualInvoice = (newDeal: Deal) => {
    onSaveDeal(newDeal);
  };

  const payPref = creator.paymentPreferences || {
    preferredMethod: 'bank_transfer',
    paymentLink: '',
    bankName: 'Direct Bank / ACH Routing',
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
            FINANCIAL LEDGER & INVOICING
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[#230B0D] mt-0.5">
            Invoices & Remittance
          </h1>
          <p className="text-[#7E635F] text-xs mt-0.5">
            Generate itemized creator invoices with your custom direct payment details.
          </p>
        </div>

        {/* Generate Manual Invoice Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-payno-sm active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* Creator Payment Remittance Settings Summary Banner */}
      <div className="bg-white rounded-3xl p-5 border border-[#ECD9CB] shadow-payno-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] flex items-center justify-center text-[#59171B] shrink-0">
            {payPref.preferredMethod === 'payment_link' ? (
              <Link2 className="w-5 h-5" />
            ) : (
              <Building className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E635F]">
                Your Configured Invoice Payment Method
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold bg-[#EAF6EE] text-[#2D8A68] px-2 py-0.5 rounded-full border border-[#C2E7D1]">
                Active on all Invoices
              </span>
            </div>

            <p className="text-xs font-bold text-[#230B0D] mt-0.5">
              {payPref.preferredMethod === 'payment_link' && payPref.paymentLink
                ? `Custom Payment Link (${payPref.paymentLink})`
                : payPref.preferredMethod === 'bank_transfer'
                ? `Direct Bank Transfer (${payPref.bankName || 'JPMorgan Chase / SVB'} • ${payPref.accountNumber || '••••4892'})`
                : payPref.preferredMethod === 'paypal'
                ? `PayPal Remittance (${payPref.paypalEmail || creator.email})`
                : 'Direct Bank Wire / ACH Transfer'}
            </p>
            <p className="text-[11px] text-[#7E635F]">
              Payments go directly to you without intermediary platform handling.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          className="px-3.5 py-1.5 rounded-xl border border-[#ECD9CB] hover:bg-[#FAF3EC] text-xs font-semibold text-[#59171B] transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-payno-sm"
        >
          Edit Payout Details
        </button>
      </div>

      {/* Financial Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-[#7E635F]">Pending Invoices</span>
            <span className="font-heading text-2xl font-bold text-[#59171B] block">
              ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#FFF2E6] text-[#A63A24] border border-[#FED7B8] flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-[#7E635F]">Settled & Paid Invoices</span>
            <span className="font-heading text-2xl font-bold text-[#2D8A68] block">
              ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#EAF6EE] text-[#2D8A68] border border-[#C2E7D1] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex gap-1 bg-white p-1 rounded-xl text-xs font-semibold w-full sm:w-auto border border-[#ECD9CB] shadow-payno-sm">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'all' ? 'bg-[#59171B] text-[#FED7B8] shadow-xs' : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            All Invoices ({deals.length})
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'unpaid' ? 'bg-[#59171B] text-[#FED7B8] shadow-xs' : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            Pending ({deals.filter((d) => d.status !== 'paid').length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              filter === 'paid' ? 'bg-[#2D8A68] text-white shadow-xs' : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            Paid ({deals.filter((d) => d.status === 'paid').length})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search invoice or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] outline-none placeholder:text-[#8C726D] shadow-payno-sm"
          />
        </div>
      </div>

      {/* Invoice List Table / Cards */}
      <div className="space-y-3">
        {filtered.map((deal) => (
          <div
            key={deal.id}
            onClick={() => onSelectDeal(deal)}
            className="bg-white rounded-2xl p-5 border border-[#ECD9CB] hover:border-[#59171B]/60 hover:shadow-payno-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-payno-sm group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-[#FAF3EC] border border-[#ECD9CB] px-2 py-0.5 rounded text-[#59171B]">
                  {deal.invoiceNumber}
                </span>
                <h3 className="font-heading text-lg font-bold text-[#230B0D] group-hover:text-[#59171B] transition-colors">
                  {deal.brandName}
                </h3>
              </div>
              <p className="text-xs text-[#7E635F]">{deal.title}</p>
              <div className="text-[11px] text-[#8C726D] flex items-center gap-2">
                <span>Issued {new Date(deal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>Due {new Date(deal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F5E8DC]">
              {/* Send Reminder Button for Unpaid Invoices */}
              {deal.status !== 'paid' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReminderDeal(deal);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#A63A24] bg-[#FFF2E6] hover:bg-[#FED7B8] border border-[#FED7B8] transition-all cursor-pointer flex items-center gap-1 shadow-payno-xs"
                  title="Send Automated Email / WhatsApp Reminder"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Remind Brand</span>
                </button>
              )}

              {/* Instant Checkout Button */}
              {deal.status !== 'paid' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCheckoutDeal(deal);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#FED7B8] bg-[#59171B] hover:bg-[#451014] transition-all cursor-pointer flex items-center gap-1 shadow-payno-xs"
                  title="Process Instant Online Card/Wallet Payment"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Collect Payment</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  exportInvoicePDF(deal, creator);
                }}
                className="p-2 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold text-[#59171B] bg-[#FAF3EC] hover:bg-[#59171B] hover:text-[#FED7B8] border border-[#ECD9CB] transition-all cursor-pointer flex items-center gap-1 shadow-payno-sm"
                title="Download Tax-Compliant PDF Invoice"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              {onOpenBrandPreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBrandPreview(deal);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#59171B] bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] transition-colors cursor-pointer flex items-center gap-1"
                  title="Preview isolated brand portal"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Brand Portal</span>
                </button>
              )}

              <div className="text-right">
                <span className="font-heading text-xl font-bold text-[#230B0D] block">
                  {formatMoney(deal.totalAmount, deal.currency || creator.defaultCurrency || 'USD')}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    deal.status === 'paid'
                      ? 'bg-[#EAF6EE] text-[#2D8A68] border border-[#C2E7D1]'
                      : 'bg-[#FFF2E6] text-[#A63A24] border border-[#FED7B8]'
                  }`}
                >
                  {deal.status === 'paid' ? 'Paid' : 'Pending Remittance'}
                </span>
              </div>

              <ChevronRight className="w-4 h-4 text-[#8C726D] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Manual Invoice Creation Modal */}
      <ManualInvoiceModal
        creator={creator}
        creatorId={creatorId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveInvoice={handleCreateManualInvoice}
      />

      {/* Smart Invoice Reminder Modal */}
      {reminderDeal && (
        <InvoiceReminderModal
          deal={reminderDeal}
          creator={creator}
          isOpen={!!reminderDeal}
          onClose={() => setReminderDeal(null)}
          onReminderSent={(updatedDeal) => {
            onSaveDeal(updatedDeal);
          }}
        />
      )}

      {/* Payment Checkout Modal */}
      {checkoutDeal && (
        <PaymentCheckoutModal
          deal={checkoutDeal}
          creator={creator}
          isOpen={!!checkoutDeal}
          onClose={() => setCheckoutDeal(null)}
          onPaymentSuccess={(updatedDeal) => {
            onSaveDeal(updatedDeal);
          }}
        />
      )}
    </div>
  );
};
