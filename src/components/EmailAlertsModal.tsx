import React, { useState } from 'react';
import { Deal, CreatorProfile, EmailAlertItem, EmailAlertPreferences } from '../types';
import {
  X,
  Bell,
  Mail,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  ExternalLink,
  Sliders,
  AlertCircle,
  FileCheck,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { buildMailtoUrl, createOverdueReminderAlert } from '../lib/emailAlerts';

interface EmailAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: CreatorProfile;
  deals: Deal[];
  alerts: EmailAlertItem[];
  onUpdateAlerts: (alerts: EmailAlertItem[]) => void;
  onUpdateCreatorProfile: (profile: CreatorProfile) => void;
  onSelectDeal?: (deal: Deal) => void;
}

export const EmailAlertsModal: React.FC<EmailAlertsModalProps> = ({
  isOpen,
  onClose,
  creator,
  deals,
  alerts,
  onUpdateAlerts,
  onUpdateCreatorProfile,
  onSelectDeal,
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'compose' | 'settings'>('activity');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDealForCompose, setSelectedDealForCompose] = useState<Deal | null>(
    deals.find((d) => d.status !== 'paid') || deals[0] || null
  );

  // Email Alert Settings State
  const defaultPrefs: EmailAlertPreferences = creator.emailAlerts || {
    onCountersign: true,
    onPaymentReceived: true,
    onDeliverableSubmitted: true,
    onOverdueReminder: true,
    notificationEmail: creator.email,
  };

  const [emailAlertPrefs, setEmailAlertPrefs] = useState<EmailAlertPreferences>(defaultPrefs);
  const [settingsSaved, setSettingsSaved] = useState(false);

  if (!isOpen) return null;

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleMarkAsRead = (id: string) => {
    const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    onUpdateAlerts(updated);
  };

  const handleMarkAllRead = () => {
    const updated = alerts.map((a) => ({ ...a, read: true }));
    onUpdateAlerts(updated);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: CreatorProfile = {
      ...creator,
      emailAlerts: emailAlertPrefs,
    };
    onUpdateCreatorProfile(updatedProfile);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const getAlertIcon = (type: EmailAlertItem['type']) => {
    switch (type) {
      case 'countersign':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shrink-0 shadow-payno-sm">
            <FileCheck className="w-4 h-4" />
          </div>
        );
      case 'payment_received':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#EAF6EE] text-[#2D8A68] border border-[#C2E7D1] flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        );
      case 'overdue_reminder':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#FFF2E6] text-[#A63A24] border border-[#FED7B8] flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      case 'deliverable_submitted':
        return (
          <div className="w-8 h-8 rounded-xl bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB] flex items-center justify-center shrink-0">
            <Send className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-[#FAF3EC] text-[#59171B] flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  // Compose Payment Notice Data
  const composeData = selectedDealForCompose
    ? createOverdueReminderAlert(selectedDealForCompose, creator)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full border border-[#ECD9CB] shadow-payno-lg space-y-4 text-[#230B0D] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#230B0D]">
                  Email Alerts & Notices
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#59171B] text-[#FED7B8]">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7E635F]">
                Automated event triggers for contracts, settlements & payment reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7E635F] hover:text-[#230B0D] rounded-xl hover:bg-[#FAF3EC] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-[#FAF3EC] p-1 rounded-2xl border border-[#ECD9CB] text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts ({alerts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'compose'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Payment Reminders</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>

        {/* Tab 1: Alerts Activity Stream */}
        {activeTab === 'activity' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-[#7E635F]">
                Critical Milestone Events
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-semibold text-[#59171B] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-10 bg-[#FAF3EC] rounded-2xl border border-[#ECD9CB] space-y-2">
                <Bell className="w-8 h-8 text-[#7E635F] mx-auto opacity-50" />
                <p className="text-xs font-medium text-[#7E635F]">No email alerts recorded yet.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                    alert.read
                      ? 'bg-white border-[#ECD9CB]'
                      : 'bg-[#FAF3EC] border-[#59171B]/30 shadow-payno-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {getAlertIcon(alert.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#230B0D] leading-tight">
                            {alert.title}
                          </h4>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-[#59171B] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#7E635F] mt-0.5 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8C726D] font-mono shrink-0">
                      {new Date(alert.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Expandable Email Template Preview / Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F5E8DC] text-xs">
                    <span className="text-[10px] text-[#8C726D] font-mono">
                      Ref: {alert.invoiceNumber}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Copy Email Body */}
                      <button
                        type="button"
                        onClick={() => handleCopyText(alert.emailBody, alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F5E8DC] border border-[#ECD9CB] text-[11px] font-semibold text-[#59171B] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy formatted email text"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === alert.id ? 'Copied!' : 'Copy Draft'}</span>
                      </button>

                      {/* Open in Email Client */}
                      <a
                        href={buildMailtoUrl(alert.recipientEmail, alert.emailSubject, alert.emailBody)}
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-payno-sm"
                        title="Open in your default email client (Gmail, Apple Mail, Outlook)"
                      >
                        <Send className="w-3 h-3" />
                        <span>Open Mail</span>
                      </a>

                      {!alert.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="px-2 py-1 text-[11px] text-[#7E635F] hover:text-[#230B0D] cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Compose / Dispatch Payment Notice */}
        {activeTab === 'compose' && (
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                Select Sponsorship Deal / Invoice:
              </label>
              <select
                value={selectedDealForCompose?.id || ''}
                onChange={(e) => {
                  const d = deals.find((item) => item.id === e.target.value);
                  if (d) setSelectedDealForCompose(d);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3EC] border border-[#ECD9CB] text-xs font-semibold text-[#230B0D] focus:outline-none focus:border-[#59171B]"
              >
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.brandName} — {deal.title} (${deal.totalAmount.toLocaleString()} • {deal.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {composeData && selectedDealForCompose && (
              <div className="space-y-3 bg-[#FAF3EC] p-4 rounded-2xl border border-[#ECD9CB]">
                <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-2">
                  <div>
                    <span className="text-[11px] font-semibold text-[#7E635F] block">Recipient:</span>
                    <span className="text-xs font-bold text-[#59171B]">
                      {selectedDealForCompose.clientEmail} ({selectedDealForCompose.brandName})
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#230B0D]">
                    ${selectedDealForCompose.totalAmount.toLocaleString()} USD
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#7E635F] block">Subject:</span>
                  <span className="text-xs font-bold text-[#230B0D]">
                    {composeData.brandEmailSubject}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#7E635F] block mb-1">
                    Email Body Preview:
                  </span>
                  <textarea
                    readOnly
                    value={composeData.brandEmailBody}
                    rows={6}
                    className="w-full p-3 rounded-xl bg-white border border-[#ECD9CB] text-xs font-mono text-[#230B0D] leading-relaxed resize-none focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-[#7E635F]">
                    Late fee clause ({selectedDealForCompose.lateFeePercent}%/mo) is automatically calculated.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(composeData.brandEmailBody, 'compose-draft')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5E8DC] border border-[#ECD9CB] text-xs font-semibold text-[#59171B] flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedId === 'compose-draft' ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    <a
                      href={buildMailtoUrl(
                        selectedDealForCompose.clientEmail,
                        composeData.brandEmailSubject,
                        composeData.brandEmailBody
                      )}
                      className="px-3.5 py-1.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send via Mail Client</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Alert Trigger Preferences */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                Notification Email Address:
              </label>
              <input
                type="email"
                required
                value={emailAlertPrefs.notificationEmail}
                onChange={(e) =>
                  setEmailAlertPrefs({ ...emailAlertPrefs, notificationEmail: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3EC] border border-[#ECD9CB] text-xs font-semibold text-[#230B0D] focus:outline-none focus:border-[#59171B]"
                placeholder="creator@yourdomain.com"
              />
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#7E635F] uppercase tracking-wider block">
                Trigger Alerts For:
              </span>

              {/* Event 1: Countersign */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={emailAlertPrefs.onCountersign}
                  onChange={(e) =>
                    setEmailAlertPrefs({ ...emailAlertPrefs, onCountersign: e.target.checked })
                  }
                  className="mt-0.5 accent-[#59171B] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#230B0D] block">
                    Brand Countersignatures
                  </span>
                  <span className="text-[11px] text-[#7E635F]">
                    Notify immediately when a brand partner signs and executes a sponsorship deed.
                  </span>
                </div>
              </label>

              {/* Event 2: Payment Received */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={emailAlertPrefs.onPaymentReceived}
                  onChange={(e) =>
                    setEmailAlertPrefs({ ...emailAlertPrefs, onPaymentReceived: e.target.checked })
                  }
                  className="mt-0.5 accent-[#59171B] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#230B0D] block">
                    Payment Settlements & Remittances
                  </span>
                  <span className="text-[11px] text-[#7E635F]">
                    Notify when payment is received, remittance confirmed, or invoice settled.
                  </span>
                </div>
              </label>

              {/* Event 3: Due Date / Overdue Notice */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={emailAlertPrefs.onOverdueReminder}
                  onChange={(e) =>
                    setEmailAlertPrefs({ ...emailAlertPrefs, onOverdueReminder: e.target.checked })
                  }
                  className="mt-0.5 accent-[#59171B] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#230B0D] block">
                    Upcoming & Overdue Payment Notices
                  </span>
                  <span className="text-[11px] text-[#7E635F]">
                    Generate timely draft notices with late fee calculations when invoices reach due date.
                  </span>
                </div>
              </label>

              {/* Event 4: Deliverable Submitted */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] cursor-pointer hover:bg-white transition-colors">
                <input
                  type="checkbox"
                  checked={emailAlertPrefs.onDeliverableSubmitted}
                  onChange={(e) =>
                    setEmailAlertPrefs({
                      ...emailAlertPrefs,
                      onDeliverableSubmitted: e.target.checked,
                    })
                  }
                  className="mt-0.5 accent-[#59171B] w-4 h-4 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[#230B0D] block">
                    Deliverable Submissions
                  </span>
                  <span className="text-[11px] text-[#7E635F]">
                    Draft automatic delivery confirmation emails when marking deliverables live.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {settingsSaved ? (
                <span className="text-xs font-semibold text-[#2D8A68] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Preferences Saved!
                </span>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold shadow-payno-sm cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
