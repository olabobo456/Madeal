import React from 'react';
import { Bell, Smartphone, Monitor, Plus } from 'lucide-react';
import { CreatorProfile } from '../types';

interface HeaderProps {
  currentView: string;
  creator: CreatorProfile;
  onOpenProfile: () => void;
  onOpenPricing: () => void;
  onOpenAlerts: () => void;
  onOpenMediaKit?: () => void;
  unreadAlertsCount?: number;
  statusBadge?: string;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  onNewContract: () => void;
  onHomeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  creator,
  onOpenProfile,
  onOpenPricing,
  onOpenAlerts,
  onOpenMediaKit,
  unreadAlertsCount = 0,
  statusBadge,
  isMobilePreview,
  onToggleMobilePreview,
  onNewContract,
  onHomeClick,
}) => {
  // Extract initials for clean typographic monogram
  const initials = creator.name
    ? creator.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'CR';

  return (
    <header className="sticky top-0 z-30 bg-[#FAF3EC]/95 backdrop-blur-md border-b border-[#ECD9CB] px-4 py-3 sm:px-6 transition-colors no-print">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Welcome Greeting & Typographic Monogram */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 p-0.5 rounded-2xl hover:ring-2 hover:ring-[#59171B]/30 transition-all focus:outline-none cursor-pointer group"
            title="Creator Studio Profile"
          >
            <div className="relative">
              {/* Monogram Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] font-heading font-bold text-sm flex items-center justify-center border-2 border-white shadow-payno-sm group-hover:scale-105 transition-transform tracking-tight">
                {initials}
              </div>
            </div>
            <div className="text-left">
              <span className="text-[11px] font-medium text-[#7E635F] block">
                Welcome Back 👋
              </span>
              <h2 className="font-heading text-sm sm:text-base font-bold text-[#230B0D] tracking-tight group-hover:text-[#59171B] transition-colors leading-tight">
                {creator.name}
              </h2>
            </div>
          </button>
        </div>

        {/* Center: Status Badge if viewing draft or agreement */}
        <div className="hidden md:flex items-center gap-2">
          {statusBadge && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white text-[#59171B] border border-[#ECD9CB] shadow-payno-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#59171B] mr-1.5 animate-pulse" />
              {statusBadge}
            </span>
          )}
        </div>

        {/* Right Actions: Quick New Deal, Pricing button, Device toggle, Email Alerts Bell */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* New Contract CTA in rich Burgundy with Beige text */}
          <button
            onClick={onNewContract}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#59171B] hover:bg-[#451014] active:scale-95 text-[#FED7B8] text-xs font-bold px-3.5 py-2 rounded-xl shadow-payno-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Deal</span>
          </button>

          {/* Media Kit Trigger Button */}
          {onOpenMediaKit && (
            <button
              onClick={onOpenMediaKit}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center cursor-pointer shadow-payno-sm ${
                currentView === 'media_kit'
                  ? 'bg-[#59171B] text-[#FED7B8] border-[#59171B]'
                  : 'bg-white border-[#ECD9CB] text-[#59171B] hover:bg-[#FAF3EC]'
              }`}
              title="Public Media Kit & Rate Card"
            >
              <span>Media Kit</span>
            </button>
          )}

          {/* Pricing Plans Trigger Button */}
          <button
            onClick={onOpenPricing}
            className="px-3 py-2 rounded-xl bg-white border border-[#ECD9CB] text-[#59171B] hover:bg-[#FAF3EC] transition-colors flex items-center text-xs font-semibold cursor-pointer shadow-payno-sm"
            title="Creator Plans & Pricing"
          >
            <span>Plans</span>
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={onToggleMobilePreview}
            title={isMobilePreview ? 'Switch to Full Screen' : 'Switch to Mobile Frame'}
            className="p-2 rounded-xl bg-white border border-[#ECD9CB] text-[#7E635F] hover:text-[#230B0D] hover:border-[#DFCCBE] transition-colors hidden md:flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-payno-sm"
          >
            {isMobilePreview ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#59171B]" />
                <span className="hidden lg:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#59171B]" />
                <span className="hidden lg:inline">Phone Frame</span>
              </>
            )}
          </button>

          {/* Email Alerts & Notifications Bell */}
          <button
            onClick={onOpenAlerts}
            className="w-10 h-10 rounded-2xl bg-white border border-[#ECD9CB] text-[#7E635F] hover:text-[#230B0D] hover:border-[#DFCCBE] flex items-center justify-center relative transition-colors cursor-pointer shadow-payno-sm group"
            title="Email Alerts & Notifications"
          >
            <Bell className="w-4 h-4 text-[#59171B] group-hover:scale-110 transition-transform" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#59171B] text-[#FED7B8] text-[9px] font-bold flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


