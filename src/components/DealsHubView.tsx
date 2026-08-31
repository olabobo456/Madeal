import React, { useState } from 'react';
import { Deal, DealStatus } from '../types';
import {
  Search,
  Plus,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  Check,
  Eye,
} from 'lucide-react';
import { DeliverableTracker } from './DeliverableTracker';

interface DealsHubViewProps {
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onCreateNewContract: () => void;
  onOpenCommunications: (brandName: string) => void;
  onToggleDeliverable: (dealId: string, deliverableId: string, deliveredUrl?: string) => void;
  onOpenBrandPreview?: (deal: Deal) => void;
}

export const DealsHubView: React.FC<DealsHubViewProps> = ({
  deals,
  onSelectDeal,
  onCreateNewContract,
  onOpenCommunications,
  onToggleDeliverable,
  onOpenBrandPreview,
}) => {
  const [filter, setFilter] = useState<DealStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeals = deals.filter((deal) => {
    const matchesFilter = filter === 'all' || deal.status === filter;
    const matchesSearch =
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
    <div className="space-y-6 pb-32">
      {/* Header & New Contract Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
            PARTNERSHIP REPOSITORY
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[#230B0D] mt-0.5">
            Deals & Contracts
          </h1>
          <p className="text-[#7E635F] text-xs mt-0.5">
            Active brand sponsorships, digital agreements, and deliverables.
          </p>
        </div>

        <button
          onClick={onCreateNewContract}
          className="bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold text-xs py-2.5 px-4 rounded-xl shadow-payno-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7E635F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by brand name, campaign, or invoice #..."
            className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#230B0D] outline-none transition-all placeholder:text-[#8C726D] shadow-payno-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'bg-white border border-[#ECD9CB] text-[#7E635F] hover:border-[#DFCCBE]'
            }`}
          >
            All Deals ({deals.length})
          </button>
          <button
            onClick={() => setFilter('pending_signature')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'pending_signature'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'bg-white border border-[#ECD9CB] text-[#7E635F] hover:border-[#DFCCBE]'
            }`}
          >
            Pending ({deals.filter((d) => d.status === 'pending_signature').length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'active'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'bg-white border border-[#ECD9CB] text-[#7E635F] hover:border-[#DFCCBE]'
            }`}
          >
            In Progress ({deals.filter((d) => d.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
              filter === 'paid'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'bg-white border border-[#ECD9CB] text-[#7E635F] hover:border-[#DFCCBE]'
            }`}
          >
            Paid ({deals.filter((d) => d.status === 'paid').length})
          </button>
        </div>
      </div>

      {/* Deals List */}
      <div className="space-y-3">
        {filteredDeals.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#ECD9CB] shadow-payno-sm space-y-3">
            <p className="text-sm text-[#7E635F]">No deals found matching your filter criteria.</p>
            <button
              onClick={onCreateNewContract}
              className="px-4 py-2 bg-[#59171B] text-[#FED7B8] text-xs font-semibold rounded-xl shadow-payno-sm cursor-pointer"
            >
              Draft New Deal
            </button>
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onSelectDeal(deal)}
              className="bg-white rounded-2xl p-5 border border-[#ECD9CB] hover:border-[#59171B]/60 hover:shadow-payno-md transition-all cursor-pointer space-y-3 shadow-payno-sm group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] font-bold text-sm flex items-center justify-center shrink-0 shadow-payno-sm group-hover:scale-105 transition-transform">
                    {deal.brandName.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-lg font-bold text-[#230B0D] group-hover:text-[#59171B] transition-colors">
                        {deal.brandName}
                      </h3>
                      {getStatusBadge(deal.status)}
                    </div>
                    <p className="text-xs text-[#7E635F]">{deal.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading text-xl font-bold text-[#230B0D] block">
                    ${deal.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#8C726D] font-mono">
                    {deal.invoiceNumber}
                  </span>
                </div>
              </div>

              {/* Deliverable Check-off & Fulfillment Tracker */}
              <div className="pt-1">
                <DeliverableTracker
                  dealId={deal.id}
                  brandName={deal.brandName}
                  deliverables={deal.deliverables}
                  onToggleDeliverable={onToggleDeliverable}
                  compact={true}
                />
              </div>

              {/* Rights Chips */}
              {(deal.usageTerm || (deal.exclusivity && deal.exclusivity !== 'None (Non-Exclusive)')) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {deal.usageTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB]/80">
                      <span>Ad:</span>
                      <span>{deal.usageTerm}</span>
                    </span>
                  )}

                  {deal.exclusivity && deal.exclusivity !== 'None (Non-Exclusive)' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#FFF2E6] text-[#A63A24] border border-[#FED7B8]">
                      <span>Exclusivity:</span>
                      <span>{deal.exclusivity}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Bottom metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F5E8DC] text-xs">
                <span className="text-[#8C726D] text-[11px]">
                  Created {new Date(deal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • Due {new Date(deal.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>

                <div className="flex items-center gap-1.5">
                  {onOpenBrandPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBrandPreview(deal);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#59171B] bg-[#FAF3EC] hover:bg-[#F5E8DC] border border-[#ECD9CB] transition-colors cursor-pointer flex items-center gap-1"
                      title={`Preview what ${deal.brandName} sees in their portal`}
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
          ))
        )}
      </div>
    </div>
  );
};

