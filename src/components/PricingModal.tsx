import React, { useState, useEffect } from 'react';
import { CreatorProfile, SubscriptionPlan } from '../types';
import {
  X,
  Check,
  Lock,
  ArrowRight,
  ExternalLink,
  Star,
  Settings,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import {
  getBillingConfig,
  saveBillingConfig,
  BillingConfig,
} from '../lib/stripeConfig';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: CreatorProfile;
  onUpdateCreatorProfile: (profile: CreatorProfile) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  creator,
  onUpdateCreatorProfile,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [billingConfig, setBillingConfig] = useState<BillingConfig>(getBillingConfig());
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    // Check if user returned from Paystack or Stripe Checkout
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('subscribed_plan') || urlParams.get('plan');
    const hasPaystackRef = urlParams.get('reference') || urlParams.get('trxref');
    const isSuccess = urlParams.get('status') === 'success' || !!hasPaystackRef;

    if (planParam === 'starter' || planParam === 'agency' || (isSuccess && selectedPlanForCheckout)) {
      const targetPlan = (planParam === 'starter' || planParam === 'agency') ? planParam : (selectedPlanForCheckout || 'starter');
      const updated: CreatorProfile = {
        ...creator,
        plan: targetPlan,
      };
      onUpdateCreatorProfile(updated);
      // Clean query params without full page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  if (!isOpen) return null;

  const currentPlan: SubscriptionPlan = creator.plan || 'free';

  // Admin Check: Only you (olaitanopeyemi21@gmail.com) or logged in admin can see the configuration drawer
  const isAdmin =
    creator.email?.toLowerCase().includes('olaitanopeyemi21@gmail.com') ||
    creator.email?.toLowerCase().includes('admin') ||
    localStorage.getItem('madeal_is_admin') === 'true';

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;

    if (plan === 'free') {
      const updated: CreatorProfile = {
        ...creator,
        plan: 'free',
      };
      onUpdateCreatorProfile(updated);
      return;
    }

    setSelectedPlanForCheckout(plan);
  };

  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    let checkoutUrl = '';
    if (plan === 'starter') {
      checkoutUrl =
        billingCycle === 'monthly'
          ? billingConfig.creatorProMonthlyLink
          : billingConfig.creatorProAnnualLink;
    } else if (plan === 'agency') {
      checkoutUrl =
        billingCycle === 'monthly'
          ? billingConfig.agencyMonthlyLink
          : billingConfig.agencyAnnualLink;
    }

    if (!checkoutUrl) {
      alert('Please configure your payment link in settings.');
      return;
    }

    // If using the default demo placeholder link, simulate instant activation
    if (checkoutUrl.includes('test_') || checkoutUrl.includes('madeal-pro-') || checkoutUrl.includes('madeal-agency-')) {
      const updated: CreatorProfile = {
        ...creator,
        plan: plan,
      };
      onUpdateCreatorProfile(updated);
      setSelectedPlanForCheckout(null);
      alert(`🎉 Successfully upgraded to ${plan === 'starter' ? 'Creator Pro' : 'Agency Studio'}! (Demo Mode — Link your Paystack Payment Page in Settings to collect real money)`);
      return;
    }

    // Prefill creator email into Paystack / Stripe link
    const separator = checkoutUrl.includes('?') ? '&' : '?';
    const prefilledUrl = `${checkoutUrl}${separator}email=${encodeURIComponent(creator.email || '')}&metadata={"creator_handle":"${encodeURIComponent(creator.handle || '')}","plan":"${plan}"}`;
    
    // Redirect to Paystack secure checkout page
    window.location.href = prefilledUrl;
  };

  const handleSaveConfig = () => {
    saveBillingConfig(billingConfig);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-[#ECD9CB] shadow-payno-lg space-y-5 text-[#230B0D] animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F5E8DC] pb-4">
          <div className="space-y-1">
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#230B0D]">
              Choose Your Creator Plan
            </h3>
            <p className="text-xs text-[#7E635F]">
              Scale your sponsorship revenue, binding deed contracts & automated payment reminders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-payno-sm"
                title="Admin only: Click here to paste your Paystack payment links"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Setup Links</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#7E635F] hover:text-[#230B0D] rounded-xl hover:bg-[#FAF3EC] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paystack Setup Drawer - Admin only */}
        {isAdmin && showConfigDrawer && (
          <div className="p-4.5 rounded-2xl bg-[#FAF3EC] border-2 border-[#59171B]/30 space-y-3.5 animate-in fade-in shadow-payno-sm">
            <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#59171B]">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Paystack Payment Links Configuration (Admin Only)</span>
              </div>
              <span className="text-[10px] bg-[#EAF6EE] text-[#2D8A68] px-2.5 py-0.5 rounded-full font-bold">
                Nigeria & Global Payouts
              </span>
            </div>

            <div className="text-[11px] text-[#7E635F] leading-relaxed space-y-1.5 bg-white/70 p-3 rounded-xl border border-[#ECD9CB]">
              <p className="font-bold text-[#230B0D]">
                How to get your Paystack payment links in 2 minutes:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Log in to your <a href="https://dashboard.paystack.com/#/pages" target="_blank" rel="noreferrer" className="text-[#59171B] font-bold underline inline-flex items-center gap-0.5">Paystack Dashboard → Payment Pages <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                <li>Click <strong>New Page</strong> → choose <strong>Subscription Payment</strong> or <strong>One-time</strong>.</li>
                <li>Set the amount (e.g., $7 or ₦10,000 for Pro, $19 or ₦28,000 for Agency) and copy your link.</li>
                <li>Paste your URLs into the fields below and click <strong>Save Payment Links</strong>.</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">
                  Creator Pro ($7/mo or ₦10,000) Link:
                </label>
                <input
                  type="text"
                  value={billingConfig.creatorProMonthlyLink}
                  onChange={(e) => setBillingConfig({ ...billingConfig, creatorProMonthlyLink: e.target.value })}
                  placeholder="https://paystack.com/pay/your-pro-page"
                  className="w-full bg-white border border-[#ECD9CB] rounded-xl px-3 py-2 text-xs font-mono text-[#230B0D] focus:outline-hidden focus:border-[#59171B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#7E635F] uppercase block mb-1">
                  Agency Studio ($19/mo or ₦28,000) Link:
                </label>
                <input
                  type="text"
                  value={billingConfig.agencyMonthlyLink}
                  onChange={(e) => setBillingConfig({ ...billingConfig, agencyMonthlyLink: e.target.value })}
                  placeholder="https://paystack.com/pay/your-agency-page"
                  className="w-full bg-white border border-[#ECD9CB] rounded-xl px-3 py-2 text-xs font-mono text-[#230B0D] focus:outline-hidden focus:border-[#59171B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-[#7E635F]">
                {configSaved ? (
                  <span className="text-[#2D8A68] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Links saved successfully!
                  </span>
                ) : (
                  'Direct settlements go straight to your Nigerian bank account'
                )}
              </span>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-1.5 bg-[#59171B] text-[#FED7B8] rounded-xl text-xs font-bold shadow-payno-sm cursor-pointer hover:bg-[#451014] transition-all"
              >
                Save Payment Links
              </button>
            </div>
          </div>
        )}

        {/* Billing Toggle (Monthly / Annual) */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex items-center bg-[#FAF3EC] p-1 rounded-2xl border border-[#ECD9CB] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                  : 'text-[#7E635F] hover:text-[#230B0D]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                  : 'text-[#7E635F] hover:text-[#230B0D]'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#EAF6EE] text-[#2D8A68] text-[9px] font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Plan 1: Free Starter */}
          <div
            className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between space-y-4 ${
              currentPlan === 'free'
                ? 'bg-[#FAF3EC] border-[#59171B] shadow-payno-sm ring-2 ring-[#59171B]/20'
                : 'bg-white border-[#ECD9CB] hover:border-[#DFCCBE]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                  Free Starter
                </span>
                {currentPlan === 'free' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB]">
                    Current Plan
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-[#230B0D]">$0</span>
                  <span className="text-xs text-[#7E635F]">/ month</span>
                </div>
                <p className="text-[11px] text-[#7E635F] mt-1">
                  For creators just starting out with sponsorships.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#F5E8DC] text-xs">
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Up to 10 Active Sponsorship Deals</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Official PDF Invoices & Deeds</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Brand Countersign Portal</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Dynamic Rate Cards & Invoicing</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0 stroke-[2.5]" />
                  <span>0% Platform Transaction Cut</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={currentPlan === 'free'}
              onClick={() => handleSelectPlan('free')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPlan === 'free'
                  ? 'bg-[#ECD9CB] text-[#7E635F] cursor-default'
                  : 'bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB]'
              }`}
            >
              {currentPlan === 'free' ? 'Active Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* Plan 2: Creator Pro ($7/month) - Highlighted */}
          <div
            className={`rounded-2xl p-4.5 border-2 transition-all flex flex-col justify-between space-y-4 relative ${
              currentPlan === 'starter'
                ? 'bg-[#FAF3EC] border-[#59171B] shadow-payno-md ring-2 ring-[#59171B]/20'
                : 'bg-white border-[#59171B] shadow-payno-sm'
            }`}
          >
            {/* Best Value Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#59171B] text-[#FED7B8] text-[10px] font-bold tracking-wider uppercase shadow-payno-sm flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span>Most Popular</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">
                  Creator Pro
                </span>
                {currentPlan === 'starter' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#59171B] text-[#FED7B8]">
                    Active Plan
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-[#230B0D]">
                    ${billingCycle === 'monthly' ? '7' : '6'}
                  </span>
                  <span className="text-xs text-[#7E635F]">
                    / month {billingCycle === 'annual' && '(billed $70/yr)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7E635F] mt-1">
                  Everything an active creator needs to close & get paid on time.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#F5E8DC] text-xs">
                <div className="flex items-center gap-2 text-[#230B0D] font-medium">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Unlimited Deals & Invoices</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Official PDF Invoices & Deeds</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Email Notice & Alert Triggers</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0 stroke-[2.5]" />
                  <span>Brand Countersign Portal</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0 stroke-[2.5]" />
                  <span>0% Platform Transaction Cut</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={currentPlan === 'starter'}
              onClick={() => handleSelectPlan('starter')}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPlan === 'starter'
                  ? 'bg-[#FAF3EC] text-[#59171B] border border-[#59171B] cursor-default'
                  : 'bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] shadow-payno-sm'
              }`}
            >
              {currentPlan === 'starter' ? 'Current Active Plan' : 'Subscribe to Plan'}
            </button>
          </div>

          {/* Plan 3: Agency & Management ($19/month) */}
          <div
            className={`rounded-2xl p-4.5 border transition-all flex flex-col justify-between space-y-4 ${
              currentPlan === 'agency'
                ? 'bg-[#FAF3EC] border-[#59171B] shadow-payno-sm ring-2 ring-[#59171B]/20'
                : 'bg-white border-[#ECD9CB] hover:border-[#DFCCBE]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                  Agency Studio
                </span>
                {currentPlan === 'agency' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#59171B] text-[#FED7B8]">
                    Active Plan
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-[#230B0D]">
                    ${billingCycle === 'monthly' ? '19' : '16'}
                  </span>
                  <span className="text-xs text-[#7E635F]">
                    / month {billingCycle === 'annual' && '(billed $190/yr)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7E635F] mt-1">
                  For creator collectives, talent managers & agencies.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#F5E8DC] text-xs">
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0" />
                  <span>Everything in Creator Pro</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0" />
                  <span>Multi-Brand Client Portals</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0" />
                  <span>Automated Overdue Late-Fee System</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D]">
                  <Check className="w-3.5 h-3.5 text-[#59171B] shrink-0" />
                  <span>Custom Legal Clauses & Rights</span>
                </div>
                <div className="flex items-center gap-2 text-[#230B0D] font-medium">
                  <Check className="w-3.5 h-3.5 text-[#2D8A68] shrink-0" />
                  <span>0% Platform Transaction Cut</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={currentPlan === 'agency'}
              onClick={() => handleSelectPlan('agency')}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentPlan === 'agency'
                  ? 'bg-[#FAF3EC] text-[#59171B] border border-[#59171B] cursor-default'
                  : 'bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] shadow-payno-sm'
              }`}
            >
              {currentPlan === 'agency' ? 'Current Active Plan' : 'Subscribe to Plan'}
            </button>
          </div>
        </div>

        {/* Footer info & admin-only setup link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB]">
          <div className="flex items-center gap-2.5 text-[11px] text-[#7E635F]">
            <Lock className="w-4 h-4 text-[#59171B] shrink-0" />
            <span>Bank-grade encryption powered by Paystack & Stripe.</span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="text-xs text-[#59171B] font-bold underline hover:text-[#451014] cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>{showConfigDrawer ? 'Hide Payment Links Setup' : '⚙️ Setup / Edit Paystack Links'}</span>
            </button>
          )}
        </div>

        {/* Checkout Modal Confirmation Overlay */}
        {selectedPlanForCheckout && (
          <div className="p-4 rounded-2xl bg-white border-2 border-[#59171B] shadow-payno-lg space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-2">
              <span className="text-xs font-bold text-[#59171B]">
                PROCEED TO CHECKOUT: {selectedPlanForCheckout.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-[#230B0D]">
                ${selectedPlanForCheckout === 'starter' ? (billingCycle === 'monthly' ? '7' : '70/yr') : (billingCycle === 'monthly' ? '19' : '190/yr')}.00 USD
              </span>
            </div>

            <p className="text-xs text-[#7E635F]">
              You will be redirected to the secure payment page to complete your {selectedPlanForCheckout === 'starter' ? 'Creator Pro' : 'Agency Studio'} subscription with international card, Apple Pay, or bank transfer.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanForCheckout(null)}
                className="px-3 py-1.5 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:text-[#230B0D]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleOpenCheckout(selectedPlanForCheckout)}
                className="px-4 py-1.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold shadow-payno-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
