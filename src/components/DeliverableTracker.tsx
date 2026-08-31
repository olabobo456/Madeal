import React, { useState } from 'react';
import { DeliverableItem } from '../types';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Link2,
  Plus,
  Clock,
  Check,
  X,
  ListChecks
} from 'lucide-react';

interface DeliverableTrackerProps {
  dealId: string;
  brandName: string;
  deliverables: DeliverableItem[];
  onToggleDeliverable: (dealId: string, deliverableId: string, deliveredUrl?: string) => void;
  compact?: boolean;
}

export const DeliverableTracker: React.FC<DeliverableTrackerProps> = ({
  dealId,
  brandName,
  deliverables,
  onToggleDeliverable,
  compact = false,
}) => {
  const [editingUrlForId, setEditingUrlForId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const completedCount = deliverables.filter((d) => d.completed).length;
  const totalCount = deliverables.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  const handleStartAddUrl = (e: React.MouseEvent, item: DeliverableItem) => {
    e.stopPropagation();
    setEditingUrlForId(item.id);
    setUrlInput(item.deliveredUrl || '');
  };

  const handleSaveUrl = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanUrl = urlInput.trim();
    onToggleDeliverable(dealId, itemId, cleanUrl || undefined);
    setEditingUrlForId(null);
    setUrlInput('');
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact Progress Bar */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#7E635F] flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isAllCompleted ? 'bg-[#2D8A68]' : 'bg-[#59171B]'}`} />
            Fulfillment Progress
          </span>
          <span className={`font-bold ${isAllCompleted ? 'text-[#2D8A68]' : 'text-[#59171B]'}`}>
            {completedCount} of {totalCount} Delivered ({progressPercent}%)
          </span>
        </div>

        <div className="w-full bg-[#FAF3EC] h-1.5 rounded-full overflow-hidden border border-[#ECD9CB]/60">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isAllCompleted ? 'bg-[#2D8A68]' : 'bg-[#59171B]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Deliverable Check-off Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {deliverables.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleDeliverable(dealId, item.id, item.deliveredUrl);
              }}
              title={item.completed ? 'Click to mark as In Progress' : 'Click to mark as Delivered'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-all cursor-pointer border ${
                item.completed
                  ? 'bg-[#EAF6EE] text-[#2D8A68] border-[#C2E7D1] font-semibold'
                  : 'bg-[#FAF3EC] text-[#230B0D] border-[#ECD9CB] hover:border-[#59171B]/50 hover:bg-white'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2D8A68] shrink-0 stroke-[2.5]" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-[#7E635F] shrink-0" />
              )}
              <span className={item.completed ? 'line-through opacity-90' : ''}>
                {item.quantity}x {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Full Rich View for Contract and Deal Details
  return (
    <div className="space-y-4">
      {/* Header Progress Card */}
      <div className="bg-[#FAF3EC] rounded-2xl p-4 sm:p-5 border border-[#ECD9CB] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                isAllCompleted ? 'bg-[#2D8A68] text-white' : 'bg-[#59171B] text-[#FED7B8]'
              }`}
            >
              {isAllCompleted ? <Check className="w-4 h-4" /> : <ListChecks className="w-3.5 h-3.5" />}
            </div>
            <div>
              <h3 className="font-heading text-xs sm:text-sm font-bold text-[#230B0D]">
                Deliverable Completion Tracker
              </h3>
              <p className="text-[11px] text-[#7E635F]">
                Check off items as you publish and deliver them to {brandName}.
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isAllCompleted
                ? 'bg-[#EAF6EE] text-[#2D8A68] border-[#C2E7D1]'
                : 'bg-white text-[#59171B] border-[#ECD9CB]'
            }`}
          >
            {completedCount} / {totalCount} Completed ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#ECD9CB]/80">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isAllCompleted ? 'bg-[#2D8A68]' : 'bg-[#59171B]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Deliverables List with Interactive Checkbox & Link input */}
      <div className="space-y-2.5">
        {deliverables.map((item) => {
          const isEditingThisUrl = editingUrlForId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.completed
                  ? 'bg-[#FAFDFB] border-[#C2E7D1] shadow-payno-sm'
                  : 'bg-white border-[#ECD9CB] hover:border-[#DFCCBE]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Checkbox + Title & Rate */}
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => onToggleDeliverable(dealId, item.id, item.deliveredUrl)}
                    aria-label={item.completed ? 'Mark deliverable as in progress' : 'Mark deliverable as done'}
                    className={`mt-0.5 w-6 h-6 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      item.completed
                        ? 'bg-[#2D8A68] text-white shadow-payno-sm'
                        : 'border-2 border-[#ECD9CB] hover:border-[#59171B] bg-[#FAF3EC] text-transparent hover:text-[#59171B]/40'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          item.completed ? 'text-[#2D8A68] line-through decoration-[#2D8A68]/60' : 'text-[#230B0D]'
                        }`}
                      >
                        {item.quantity}x {item.title}
                      </h4>
                      <span className="font-mono text-xs font-semibold text-[#7E635F]">
                        ${(item.baseRate * item.quantity).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#7E635F]">{item.description}</p>

                    {/* Completion Tag & Timestamp */}
                    {item.completed && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2D8A68] bg-[#EAF6EE] px-2 py-0.5 rounded-md border border-[#C2E7D1]">
                          <CheckCircle2 className="w-3 h-3" />
                          Delivered {item.completedAt ? `• ${new Date(item.completedAt).toLocaleDateString()}` : ''}
                        </span>

                        {item.deliveredUrl && (
                          <a
                            href={item.deliveredUrl.startsWith('http') ? item.deliveredUrl : `https://${item.deliveredUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#59171B] bg-[#FAF3EC] px-2 py-0.5 rounded-md border border-[#ECD9CB] hover:bg-[#F5E8DC] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Published Link
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleDeliverable(dealId, item.id, item.deliveredUrl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      item.completed
                        ? 'bg-[#FAF3EC] text-[#7E635F] hover:bg-[#F5E8DC] border border-[#ECD9CB]'
                        : 'bg-[#59171B] text-[#FED7B8] hover:bg-[#451014] shadow-payno-sm'
                    }`}
                  >
                    {item.completed ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-[#7E635F]" />
                        <span>Reopen</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Delivered</span>
                      </>
                    )}
                  </button>

                  {/* Add / Edit Proof Link */}
                  {item.completed && (
                    <button
                      type="button"
                      onClick={(e) => handleStartAddUrl(e, item)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#7E635F] hover:text-[#59171B] bg-[#FAF3EC] border border-[#ECD9CB] hover:bg-white transition-colors cursor-pointer flex items-center gap-1"
                      title={item.deliveredUrl ? 'Edit Link' : 'Add Published Link'}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{item.deliveredUrl ? 'Edit Link' : 'Add Link'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline URL Form for adding post proof link */}
              {isEditingThisUrl && (
                <form
                  onSubmit={(e) => handleSaveUrl(e, item.id)}
                  className="mt-3 pt-3 border-t border-[#ECD9CB]/60 flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 absolute left-3 top-3 text-[#7E635F]" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Paste live post or draft URL (e.g. TikTok, IG, Drive link)..."
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl pl-8 pr-3 py-2 text-xs text-[#230B0D] outline-none"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#59171B] text-[#FED7B8] text-xs font-semibold rounded-xl hover:bg-[#451014] transition-colors cursor-pointer shrink-0 shadow-payno-sm"
                  >
                    Save Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUrlForId(null)}
                    className="p-2 text-[#7E635F] hover:text-[#230B0D] rounded-xl hover:bg-[#FAF3EC] transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
