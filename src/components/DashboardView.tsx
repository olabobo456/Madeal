import React, { useState } from 'react';
import { Deal, CreatorProfile } from '../types';
import { formatMoney } from '../utils/currency';
import {
  Plus,
  Eye,
  EyeOff,
  Receipt,
  MessageSquare,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowUpRight,
  Send,
  Wallet,
  Globe,
  Share2,
} from 'lucide-react';

interface DashboardViewProps {
  creator: CreatorProfile;
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onCreateNewContract: () => void;
  onViewAllDeals: () => void;
  onOpenCommunications: (brandName?: string) => void;
  onOpenMediaKit?: () => void;
  onToggleDeliverable?: (dealId: string, deliverableId: string, deliveredUrl?: string) => void;
  onOpenBrandPreview?: (deal: Deal) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  creator,
  deals,
  onSelectDeal,
  onCreateNewContract,
  onViewAllDeals,
  onOpenCommunications,
  onOpenMediaKit,
  onToggleDeliverable,
  onOpenBrandPreview,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // Compute stats dynamically from deals
  const totalEarnings = deals
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + d.totalAmount, 0) || creator.totalEarnings;

  const pendingSignatureSum = deals
    .filter((d) => d.status === 'pending_signature')
    .reduce((sum, d) => sum + d.totalAmount, 0);

  const recentDeals = deals.slice(0, 4);

  const getStatusBadge = (status: Deal['status']) => {
    switch (status) {
      case 'pending_signature':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF2E6] text-[#A63A24] border border-[#FED7B8]">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F5EFEA] text-[#7E635F] border border-[#ECD9CB]">
            Draft
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF6EE] text-[#2D8A68] border border-[#C2E7D1]">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF4FB] text-[#2764A5] border border-[#CDE0F5]">
            <Briefcase className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FCECEE] text-[#B82C3A] border border-[#F8C8CE]">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Payno Style Available Balance Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ECD9CB] shadow-payno-md relative overflow-hidden bg-beige-silk-glow">
        <div className="relative z-10 space-y-5">
          {/* Top Row: Available Balance label & Diagonal Arrow Pill Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#7E635F]">
              <div className="w-7 h-7 rounded-xl bg-[#F5E8DC] flex items-center justify-center text-[#59171B]">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide">
                Available Balance
              </span>
            </div>

            {/* Payno style circular top-right action button in deep Burgundy */}
            <button
              onClick={onCreateNewContract}
              className="w-8 h-8 rounded-full bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] flex items-center justify-center shadow-payno-sm transition-transform active:scale-95 cursor-pointer"
              title="Create New Deal"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Large Numerical Currency Display + Inline Eye Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-0.5">
              <span className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-[#230B0D]">
                {showBalance
                  ? `$${Math.floor(totalEarnings).toLocaleString('en-US')}`
                  : '••••••'}
              </span>
              {showBalance && (
                <span className="font-heading text-2xl sm:text-3xl text-[#59171B] font-semibold">
                  .{(totalEarnings % 1).toFixed(2).substring(2)}
                </span>
              )}
            </div>

            {/* Eye Hide/Show Button */}
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-xl text-[#7E635F] hover:text-[#59171B] hover:bg-[#F5E8DC] transition-colors cursor-pointer"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Payno Style Info Pill: Pending / Limit / Growth */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onViewAllDeals}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EC] hover:bg-[#F5E8DC] border border-[#ECD9CB] text-xs font-medium text-[#7E635F] transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#59171B]" />
              <span>Pending Deals • ${pendingSignatureSum.toLocaleString()}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#59171B]" />
            </button>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF6EE] border border-[#C2E7D1] text-[11px] font-semibold text-[#2D8A68]">
              <span>+{creator.monthlyGrowthPercent}% growth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (Payno Style 4-Button Row) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7E635F] px-1">
          Quick Actions
        </h2>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Action 1: Send / New Contract */}
          <button
            onClick={onCreateNewContract}
            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] shadow-payno-sm transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#230B0D] tracking-tight">
              New Deal
            </span>
          </button>

          {/* Action 2: Invoices / Add Funds */}
          <button
            onClick={onViewAllDeals}
            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] shadow-payno-sm transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#230B0D] tracking-tight">
              Invoices
            </span>
          </button>

          {/* Action 3: Brand Chat */}
          <button
            onClick={() => onOpenCommunications()}
            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] shadow-payno-sm transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB] flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#230B0D] tracking-tight">
              Brand Chat
            </span>
          </button>

          {/* Action 4: All Deals */}
          <button
            onClick={onViewAllDeals}
            className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] shadow-payno-sm transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#230B0D] tracking-tight">
              All Deals
            </span>
          </button>
        </div>
      </div>

      {/* Media Kit & Rate Card Feature Banner */}
      {onOpenMediaKit && (
        <div
          onClick={onOpenMediaKit}
          className="bg-white rounded-3xl p-5 border border-[#ECD9CB] hover:border-[#59171B]/50 hover:shadow-payno-md transition-all cursor-pointer shadow-payno-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] flex items-center justify-center text-[#59171B] shrink-0 group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#59171B]">
                  Creator Rate Card & Media Kit
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready to Share
                </span>
              </div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-[#230B0D] group-hover:text-[#59171B] transition-colors mt-0.5">
                Shareable Packages, Stats & Rate Card
              </h3>
              <p className="text-xs text-[#7E635F]">
                Send verified sponsorship rates, audience metrics & packages directly to prospective brands.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMediaKit();
            }}
            className="px-3.5 py-2 rounded-xl bg-[#FAF3EC] group-hover:bg-[#59171B] text-[#59171B] group-hover:text-[#FED7B8] border border-[#ECD9CB] text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-payno-xs"
          >
            <span>View Media Kit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recent Transactions / Active Deals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading text-lg font-bold tracking-tight text-[#230B0D]">
            Recent Transactions
          </h2>
          <button
            onClick={onViewAllDeals}
            className="text-xs font-semibold text-[#59171B] hover:text-[#451014] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All ({deals.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Deals list cards in Payno rounded luxury styling */}
        <div className="space-y-3">
          {recentDeals.map((deal) => {
            // Pick initial for avatar badge
            const initial = deal.brandName.charAt(0).toUpperCase();

            return (
              <div
                key={deal.id}
                onClick={() => onSelectDeal(deal)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECD9CB] hover:border-[#59171B]/50 hover:shadow-payno-md transition-all cursor-pointer space-y-3 shadow-payno-sm group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Brand avatar circular badge */}
                    <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] font-bold text-sm flex items-center justify-center shrink-0 shadow-payno-sm group-hover:scale-105 transition-transform">
                      {initial}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-base font-bold text-[#230B0D] group-hover:text-[#59171B] transition-colors">
                          {deal.brandName}
                        </h3>
                        {getStatusBadge(deal.status)}
                      </div>
                      <p className="text-xs text-[#7E635F]">
                        {deal.title}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-heading text-lg font-bold text-[#230B0D] block">
                      {formatMoney(deal.totalAmount, deal.currency || creator.defaultCurrency || 'USD')}
                    </span>
                    <span className="text-[10px] text-[#8C726D] font-mono">
                      {deal.invoiceNumber}
                    </span>
                  </div>
                </div>

                {/* Deliverables tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {deal.deliverables.map((del) => (
                    <button
                      key={del.id}
                      type="button"
                      onClick={(e) => {
                        if (onToggleDeliverable) {
                          e.stopPropagation();
                          onToggleDeliverable(deal.id, del.id, del.deliveredUrl);
                        }
                      }}
                      title={del.completed ? 'Delivered (Click to reopen)' : 'Click to mark as Delivered'}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        del.completed
                          ? 'bg-[#EAF6EE] text-[#2D8A68] border-[#C2E7D1]'
                          : 'bg-[#FAF3EC] text-[#59171B] border-[#ECD9CB] hover:bg-white'
                      }`}
                    >
                      {del.completed && <CheckCircle2 className="w-3 h-3 text-[#2D8A68]" />}
                      <span className={del.completed ? 'line-through opacity-85' : ''}>
                        {del.quantity}x {del.title}
                      </span>
                    </button>
                  ))}
                  <span className="text-[11px] text-[#8C726D] ml-auto">
                    Due {new Date(deal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F5E8DC] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8C726D] text-[11px]">
                      {deal.usageTerm}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenBrandPreview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBrandPreview(deal);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#59171B] bg-[#FAF3EC] hover:bg-[#F5E8DC] border border-[#ECD9CB] transition-colors cursor-pointer flex items-center gap-1"
                        title={`Preview what ${deal.brandName} sees in their private portal`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Brand Preview</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCommunications(deal.brandName);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#7E635F] hover:text-[#59171B] hover:bg-[#FAF3EC] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#59171B]" />
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDeal(deal);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] transition-colors cursor-pointer flex items-center gap-1 shadow-payno-sm"
                    >
                      <span>{deal.clientSigned ? 'View Deed' : 'Sign & Review'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

