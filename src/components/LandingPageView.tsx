import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  DollarSign,
  Share2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Lock,
  ChevronDown,
  Building,
  Check,
  Send,
  Eye,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'invoicing' | 'mediakit' | 'crm'>('contracts');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are the contracts legally binding?',
      a: 'Yes. Madeal contracts are drafted following standard entertainment and intellectual property legal templates. Both parties execute agreements with verified digital signatures and timestamped audit logs that comply with standard electronic signature laws (ESIGN & UETA).',
    },
    {
      q: 'Does Madeal take a percentage cut of my sponsorship earnings?',
      a: 'No! Madeal takes 0% commission on your sponsorship earnings. Brands remit payments directly to your bank account, Stripe link, Wise, or PayPal. You keep 100% of what you negotiate.',
    },
    {
      q: 'What makes Madeal contracts different from generic templates?',
      a: 'Generic templates frequently leave creators exposed to perpetual usage rights, unbounded revision rounds, whitelisting without ad budget caps, and no kill fee protections. Madeal includes creator-first clauses like standard 50% kill fees, explicit 30-day whitelisting windows, and late payment penalties.',
    },
    {
      q: 'Can brands sign and review contracts on mobile?',
      a: 'Yes. Every contract generated has a private, mobile-optimized Brand Portal link. Brand marketing managers and legal teams can review deliverables, view Plain-English clause explanations, and execute their signature in one click without creating an account.',
    },
    {
      q: 'Can I customize my rate cards and media kit?',
      a: 'Absolutely. You can customize deliverable formats (TikToks, Instagram Reels, YouTube Integrations, UGC packages, Newsletter slots), set rates in any major currency, and share a verified public media kit link directly with brand partners.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] flex flex-col selection:bg-[#59171B]/20 selection:text-[#59171B]">
      {/* ------------------------------------------------------------- */}
      {/* TOP NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <nav className="sticky top-0 z-40 bg-[#FAF3EC]/90 backdrop-blur-md border-b border-[#ECD9CB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center font-heading font-black text-base shadow-payno-sm">
              M
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-xl tracking-tight text-[#59171B]">MADEAL</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#59171B] text-[#FED7B8] tracking-wider">
                PRO
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-[#7E635F]">
            <a href="#features" className="hover:text-[#59171B] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#59171B] transition-colors">
              How It Works
            </a>
            <a href="#contracts" className="hover:text-[#59171B] transition-colors">
              Legal Protection
            </a>
            <a href="#pricing" className="hover:text-[#59171B] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#59171B] transition-colors">
              FAQ
            </a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="text-xs font-bold text-[#59171B] hover:text-[#451014] px-3 sm:px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-bold bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] px-4 sm:px-5 py-2.5 rounded-2xl shadow-payno-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-[#ECD9CB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Top Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ECD9CB] text-[#59171B] text-xs font-bold shadow-payno-sm">
            <ShieldCheck className="w-4 h-4 text-[#59171B]" />
            <span>The Sponsorship Operating System for Modern Creators</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[#230B0D] tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Close Brand Deals Faster with{' '}
            <span className="text-[#59171B] underline decoration-[#FED7B8] decoration-4 underline-offset-4">
              Ironclad Contracts
            </span>{' '}
            & Instant Invoicing.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-[#7E635F] max-w-2xl mx-auto leading-relaxed font-normal">
            Never lose money to late payments or perpetual licensing traps again. Generate lawyer-grade sponsor agreements,
            enforce kill fees, automate remittance reminders, and get paid 100% of your earnings.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-heading font-bold text-sm sm:text-base shadow-payno-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-[#230B0D] font-bold text-xs sm:text-sm shadow-payno-sm transition-colors cursor-pointer"
            >
              Sign In with Existing Account
            </button>
          </div>

          {/* Hero Trust Micro-copy */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-[#7E635F]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>0% Platform Commission</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Standard 50% Kill Fee Guard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>

        {/* Interactive Feature Demo Showcase */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="bg-white rounded-3xl border border-[#ECD9CB] shadow-payno-lg p-4 sm:p-6 space-y-5">
            {/* Demo Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#FAF3EC] p-1.5 rounded-2xl border border-[#ECD9CB]">
              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'contracts'
                    ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                    : 'text-[#7E635F] hover:text-[#230B0D]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Smart Contracts</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('invoicing')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'invoicing'
                    ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                    : 'text-[#7E635F] hover:text-[#230B0D]'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Instant Invoicing</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('mediakit')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'mediakit'
                    ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                    : 'text-[#7E635F] hover:text-[#230B0D]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Media Kit & Rates</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('crm')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'crm'
                    ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                    : 'text-[#7E635F] hover:text-[#230B0D]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Deal Tracker CRM</span>
              </button>
            </div>

            {/* Showcase Tab Panels */}
            {activeTab === 'contracts' && (
              <div className="bg-[#FAF3EC] rounded-2xl p-4 sm:p-6 border border-[#ECD9CB] space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECD9CB] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Contract Generator Preview
                    </span>
                    <h4 className="font-heading text-base font-bold text-[#230B0D]">
                      Creator-First Sponsorship Agreement
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      50% Kill Fee Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#ECD9CB] space-y-1">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase">Deliverables</span>
                    <p className="text-xs font-bold text-[#230B0D]">1x TikTok Dedicated (60s) + 2x IG Reels</p>
                    <p className="text-[11px] text-[#7E635F]">Includes 2 free revision rounds within 5 days.</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-[#ECD9CB] space-y-1">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase">Usage & Whitelisting</span>
                    <p className="text-xs font-bold text-[#230B0D]">30-Day Paid Ad Spark Rights</p>
                    <p className="text-[11px] text-[#7E635F]">No perpetual rights. Ad spend capped at terms.</p>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-[#ECD9CB] space-y-1">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase">Payment Protection</span>
                    <p className="text-xs font-bold text-[#230B0D] font-mono">$3,500.00 USD (Net 15)</p>
                    <p className="text-[11px] text-[#7E635F]">5% per week late fee on delayed disbursements.</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#ECD9CB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#7E635F]">
                    <BookOpen className="w-4 h-4 text-[#59171B]" />
                    <span>Includes interactive Plain-English clause explainer tooltips for brand legal review.</span>
                  </div>
                  <span className="font-bold text-[#59171B] hidden sm:inline">Countersign Ready</span>
                </div>
              </div>
            )}

            {activeTab === 'invoicing' && (
              <div className="bg-[#FAF3EC] rounded-2xl p-4 sm:p-6 border border-[#ECD9CB] space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECD9CB] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Commercial Invoice Module
                    </span>
                    <h4 className="font-heading text-base font-bold text-[#230B0D]">
                      Automated Net-15 / Net-30 Invoices
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#59171B] text-[#FED7B8] text-[11px] font-bold">
                    Multi-Currency Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-[#ECD9CB] space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#7E635F]">Invoice #INV-2026-089</span>
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Pending Brand Remittance
                      </span>
                    </div>
                    <div className="text-xl font-heading font-black text-[#230B0D]">$4,800.00 USD</div>
                    <p className="text-xs text-[#7E635F]">
                      Direct routing via Bank ACH Transfer / Stripe Link. 0% platform fee deducted.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#ECD9CB] space-y-2">
                    <span className="text-xs font-bold text-[#230B0D] block">Automated Overdue Reminders</span>
                    <p className="text-xs text-[#7E635F]">
                      One-click pre-composed polite email templates to chase finance teams effortlessly:
                    </p>
                    <div className="text-[11px] font-mono bg-[#FAF3EC] p-2 rounded-lg text-[#59171B]">
                      &quot;Friendly reminder regarding Invoice #INV-2026-089 due today for campaign delivery...&quot;
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mediakit' && (
              <div className="bg-[#FAF3EC] rounded-2xl p-4 sm:p-6 border border-[#ECD9CB] space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECD9CB] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Public Creator Media Kit
                    </span>
                    <h4 className="font-heading text-base font-bold text-[#230B0D]">
                      Live Benchmark Metrics & Deliverable Rate Cards
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-[#59171B] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Custom Shareable Link
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB] text-center">
                    <span className="text-[10px] font-bold text-[#7E635F] block">Total Audience</span>
                    <span className="font-heading font-black text-sm text-[#230B0D]">480,000+</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB] text-center">
                    <span className="text-[10px] font-bold text-[#7E635F] block">Avg. Engagement</span>
                    <span className="font-heading font-black text-sm text-emerald-700">5.8%</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB] text-center">
                    <span className="text-[10px] font-bold text-[#7E635F] block">Top Demo</span>
                    <span className="font-heading font-black text-sm text-[#230B0D]">18 - 34 (74%)</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB] text-center">
                    <span className="text-[10px] font-bold text-[#7E635F] block">TikTok Dedicated</span>
                    <span className="font-heading font-black text-sm text-[#59171B]">$1,500</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'crm' && (
              <div className="bg-[#FAF3EC] rounded-2xl p-4 sm:p-6 border border-[#ECD9CB] space-y-4 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ECD9CB] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Sponsorship Pipeline CRM
                    </span>
                    <h4 className="font-heading text-base font-bold text-[#230B0D]">
                      End-to-End Deal Progression
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    4 Active Deals
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]">
                    <span className="text-[10px] font-bold text-[#7E635F] block uppercase">1. Pitching</span>
                    <span className="font-bold text-[#230B0D] block mt-1">NordVPN (Q3 Inbound)</span>
                    <span className="text-[11px] font-mono text-[#59171B]">$2,000</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]">
                    <span className="text-[10px] font-bold text-[#7E635F] block uppercase">2. Contract Out</span>
                    <span className="font-bold text-[#230B0D] block mt-1">Gymshark Apparel</span>
                    <span className="text-[11px] font-mono text-[#59171B]">$3,500</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]">
                    <span className="text-[10px] font-bold text-[#7E635F] block uppercase">3. In Production</span>
                    <span className="font-bold text-[#230B0D] block mt-1">Notion App Feature</span>
                    <span className="text-[11px] font-mono text-[#59171B]">$4,000</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#ECD9CB]">
                    <span className="text-[10px] font-bold text-emerald-700 block uppercase">4. Paid & Closed</span>
                    <span className="font-bold text-[#230B0D] block mt-1">Glossier Beauty</span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">$2,800</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CORE FEATURES GRID */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">Full Creator Protection</span>
          <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#230B0D]">
            Everything You Need to Run Your Creator Business Like a Studio.
          </h2>
          <p className="text-xs sm:text-sm text-[#7E635F]">
            Say goodbye to messy email chains, un-enforceable DMs, and generic contracts that favor big brands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-4 hover:shadow-payno-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#230B0D]">Standard Kill Fee Protection</h3>
            <p className="text-xs text-[#7E635F] leading-relaxed">
              If a brand cancels the campaign after you have filmed or scripted, our standard 50% kill fee ensures you are
              compensated for your creative production time and reserved calendar slot.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-4 hover:shadow-payno-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#230B0D]">Whitelisting & Spark Ad Boundaries</h3>
            <p className="text-xs text-[#7E635F] leading-relaxed">
              Never give away perpetual ad rights for free. Specify exact 30, 60, or 90-day whitelisting windows with clear
              spend thresholds and additional licensing fees.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-4 hover:shadow-payno-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#230B0D]">Direct 0% Cut Invoicing</h3>
            <p className="text-xs text-[#7E635F] leading-relaxed">
              Send clean, professional PDF invoices with your preferred routing (ACH, Stripe link, Wise, PayPal). We don’t
              hold your funds or take any cut of your hard-earned sponsorship revenue.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* HOW IT WORKS (3 STEPS) */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-16 bg-white border-y border-[#ECD9CB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">Simple 3-Step Flow</span>
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#230B0D]">
              From Inbound Pitch to Paid in Days.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAF3EC] p-6 rounded-3xl border border-[#ECD9CB] space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-[#59171B] text-[#FED7B8] text-sm font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-heading text-base font-bold text-[#230B0D]">Send Rate Card & Media Kit</h3>
              <p className="text-xs text-[#7E635F] leading-relaxed">
                Direct brand sponsors to your live verified media kit with your custom deliverable menu, engagement data,
                and previous partnership portfolio.
              </p>
            </div>

            <div className="bg-[#FAF3EC] p-6 rounded-3xl border border-[#ECD9CB] space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-[#59171B] text-[#FED7B8] text-sm font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-heading text-base font-bold text-[#230B0D]">Draft & Countersign in 60s</h3>
              <p className="text-xs text-[#7E635F] leading-relaxed">
                Generate a custom agreement with kill fees, exclusivity windows, and revision caps. The brand executes the
                contract in their private digital portal.
              </p>
            </div>

            <div className="bg-[#FAF3EC] p-6 rounded-3xl border border-[#ECD9CB] space-y-3 relative">
              <div className="w-8 h-8 rounded-xl bg-[#59171B] text-[#FED7B8] text-sm font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-heading text-base font-bold text-[#230B0D]">Automate Invoicing & Payout</h3>
              <p className="text-xs text-[#7E635F] leading-relaxed">
                Generate matching invoice documents upon milestone delivery and deploy polite automated reminder notices
                to accounts payable teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* TRANSPARENT PRICING SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="pricing" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">Simple, Transparent Pricing</span>
          <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#230B0D]">
            Invest in Your Creative Business.
          </h2>
          <p className="text-xs sm:text-sm text-[#7E635F]">
            One avoided contract mistake pays for Madeal for years.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Starter */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#7E635F] uppercase tracking-wider block">Starter</span>
              <div className="space-y-1">
                <div className="font-heading text-3xl font-black text-[#230B0D]">$0</div>
                <p className="text-xs text-[#7E635F]">Free forever for emerging creators</p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#230B0D] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Up to 3 Active Brand Contracts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Standard 50% Kill Fee Clause</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Public Media Kit & Rate Cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>0% Platform Fees on Payouts</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onGetStarted}
              className="w-full py-2.5 bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-payno-sm"
            >
              Start Free
            </button>
          </div>

          {/* Creator Pro (Featured) */}
          <div className="bg-[#59171B] text-[#FED7B8] p-6 sm:p-7 rounded-3xl border-2 border-[#59171B] shadow-payno-lg space-y-6 flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FED7B8] text-[#59171B] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-payno-sm">
              Most Popular for Pro Creators
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#FED7B8]/80 uppercase tracking-wider block">Creator Pro</span>
              <div className="space-y-1">
                <div className="font-heading text-3xl font-black text-white">
                  $7<span className="text-xs font-normal text-[#FED7B8]/70">/month</span>
                </div>
                <p className="text-xs text-[#FED7B8]/70">For active full-time creators</p>
              </div>
              <ul className="space-y-2.5 text-xs text-white pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8]" />
                  <span>Unlimited Brand Contracts & Deals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8]" />
                  <span>Custom Whitelisting & Spark Ad Terms</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8]" />
                  <span>Automated Overdue Reminder Generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8]" />
                  <span>Multi-Currency Invoice PDFs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8]" />
                  <span>Priority Legal Clause Updates</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onGetStarted}
              className="w-full py-3 bg-[#FED7B8] hover:bg-[#ffe5cf] text-[#59171B] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-payno-sm"
            >
              Get Creator Pro
            </button>
          </div>

          {/* Agency Studio */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#7E635F] uppercase tracking-wider block">Agency Studio</span>
              <div className="space-y-1">
                <div className="font-heading text-3xl font-black text-[#230B0D]">
                  $19<span className="text-xs font-normal text-[#7E635F]">/month</span>
                </div>
                <p className="text-xs text-[#7E635F]">For creator rosters & talent managers</p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#230B0D] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Everything in Creator Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Multiple Creator Profiles & Rosters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Custom Brand Agreement Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Dedicated White-Label Invoices</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onGetStarted}
              className="w-full py-2.5 bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-payno-sm"
            >
              Get Agency Studio
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FAQ ACCORDION SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-16 bg-white border-t border-[#ECD9CB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">Questions & Answers</span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#230B0D]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#ECD9CB] bg-[#FAF3EC] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-heading text-sm font-bold text-[#230B0D]">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#59171B] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[#7E635F] leading-relaxed border-t border-[#ECD9CB]/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FINAL CTA BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 bg-[#59171B] text-[#FED7B8] text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-heading text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Protect Your Sponsorships & Get Paid on Time?
          </h2>
          <p className="text-xs sm:text-sm text-[#FED7B8]/80 max-w-xl mx-auto leading-relaxed">
            Join thousands of professional creators executing safe, high-paying brand partnerships today.
          </p>
          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-2xl bg-[#FED7B8] hover:bg-[#ffe5cf] text-[#59171B] font-heading font-bold text-sm shadow-payno-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Create Your Free Account Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-[#230B0D] text-[#ECD9CB] py-12 border-t border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FED7B8] text-[#59171B] flex items-center justify-center font-heading font-black text-sm">
                M
              </div>
              <span className="font-heading font-black text-lg text-[#FED7B8]">MADEAL</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#ECD9CB]/80">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
              <button
                onClick={onSignIn}
                className="hover:text-white transition-colors font-bold cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#ECD9CB]/60">
            <p>© {new Date().getFullYear()} Madeal Technologies Inc. Built for professional creators.</p>
            <div className="flex items-center gap-4">
              <span>Standard Creator Legal Terms</span>
              <span>•</span>
              <span>256-Bit Cloud Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
