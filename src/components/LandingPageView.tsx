import React, { useState, useEffect } from 'react';
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
  Check,
  Eye,
  BookOpen,
  Clock,
  Smartphone,
  XCircle,
  Zap,
  Sliders,
  Star,
  RefreshCw,
  ExternalLink,
  Layers,
  Send,
  HelpCircle,
  Receipt,
  Users,
} from 'lucide-react';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  // Live Contract Simulator State
  const [simulatorBrand, setSimulatorBrand] = useState('Gymshark');
  const [simulatorDeliverable, setSimulatorDeliverable] = useState('1x TikTok + 1x Instagram Reel');
  const [simulatorFee, setSimulatorFee] = useState(3500);
  const [simulatorKillFeePct] = useState(20);
  const [simulatorPaidAds, setSimulatorPaidAds] = useState<'none' | '30days' | '60days'>('30days');

  // Pricing Toggle (Monthly vs Annual)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Activity Pill Rotator with plain English descriptions
  const activityList = [
    { creator: '@sarahfilms', brand: 'Notion', amount: '$4,200', tag: '20% Cancellation Protection Locked', time: '2m ago' },
    { creator: '@techwithleo', brand: 'NordVPN', amount: '$6,500', tag: 'Paid Within 15 Days Direct to Bank', time: '8m ago' },
    { creator: '@emilyglows', brand: 'Glossier', amount: '$2,800', tag: 'Paid Ad Rights Capped at 30 Days', time: '14m ago' },
    { creator: '@fitcoachmike', brand: 'Gymshark', amount: '$5,000', tag: 'Signed on Mobile in 30 Seconds', time: '21m ago' },
  ];
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveActivityIndex((prev) => (prev + 1) % activityList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activityList.length]);

  // Brand logos for infinite marquee
  const brandList = [
    'Nike',
    'Notion',
    'Gymshark',
    'Glossier',
    'NordVPN',
    'Spotify',
    'Adobe',
    'Duolingo',
    'Sephora',
    'Athletic Greens',
    'Casetify',
    'Squarespace',
  ];

  // Calculated values for simulator
  const paidAdsSurcharge = simulatorPaidAds === '30days' ? 0.2 : simulatorPaidAds === '60days' ? 0.35 : 0;
  const effectiveTotalFee = Math.round(simulatorFee * (1 + paidAdsSurcharge));
  const guaranteedKillFee = Math.round(effectiveTotalFee * (simulatorKillFeePct / 100));

  const faqs = [
    {
      q: 'What does "All-in-One Platform" mean? What tools do I get?',
      a: 'Everything you need to run your deals with brands and clients in one place: (1) A shareable Media Kit & Rate Card to showcase your stats, portfolio, and pricing, (2) Fast Contracts with built-in 20% cancellation protection, (3) A mobile Signing Link so brands and clients can sign on their phone in 30 seconds with no login, (4) Matching Invoice PDFs, and (5) A Deal Pipeline to track every sponsor and client from pitch to payout.',
    },
    {
      q: 'What is a "Cancellation Fee", and why do I need one?',
      a: 'Brands and clients frequently change their marketing plans or cancel campaigns after you have already spent hours brainstorming, scripting, or reserving dates on your calendar. Without cancellation protection, you get paid $0. With Madeal, if a brand or client cancels after signing, they are legally required to pay you 20% of the deal for your reserved time.',
    },
    {
      q: 'What are "Paid Ad Rights" (Whitelisting / Spark Ads)?',
      a: '"Paid Ad Rights" (sometimes called whitelisting, boosting, or Spark Ads) is when a brand puts their own advertising budget behind your video to show it to millions of people on TikTok, Instagram, or YouTube. Without a contract, brands often run your face in ads forever without paying you extra. Madeal contracts automatically charge them an extra fee and set a strict time limit (like 30 or 60 days) so they cannot use your face perpetually.',
    },
    {
      q: 'Does Madeal take a cut of my earnings?',
      a: 'Never! Madeal takes 0% commission. When a brand or client pays you, 100% of the money goes straight to your bank account, Stripe, PayPal, or Wise. We only charge a small flat monthly subscription with a completely free starter tier.',
    },
    {
      q: 'Do brands and clients have to download an app or create an account to sign?',
      a: 'No! You simply send the brand manager or client your unique deal link. They can open it on their phone or laptop, review your deliverables and clear contract terms, and sign with their finger in under 30 seconds. Both of you instantly get signed PDF copies.',
    },
    {
      q: 'What happens if a brand or client pays me late?',
      a: 'Every contract sets a clear payment deadline (like 15 or 30 days after posting). If the brand or client is late, Madeal generates ready-to-send polite reminder emails that you can send directly to their accounts payable department with one click.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF3EC] text-[#230B0D] flex flex-col selection:bg-[#59171B]/20 selection:text-[#59171B] overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* TOP NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#FAF3EC]/90 backdrop-blur-md border-b border-[#ECD9CB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center font-heading font-black text-base shadow-payno-sm">
              M
            </div>
            <span className="font-heading font-black text-xl tracking-tight text-[#59171B]">MADEAL</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#7E635F]">
            <a href="#how-it-works" className="hover:text-[#59171B] transition-colors">
              How It Works
            </a>
            <a href="#simulator" className="hover:text-[#59171B] transition-colors">
              Deal Simulator
            </a>
            <a href="#features" className="hover:text-[#59171B] transition-colors">
              All-in-One Tools
            </a>
            <a href="#comparison" className="hover:text-[#59171B] transition-colors">
              Why Creators Choose Us
            </a>
            <a href="#pricing" className="hover:text-[#59171B] transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[#59171B] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              id="landing-getstarted-btn"
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-bold bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] px-4 sm:px-5 py-2.5 rounded-2xl shadow-payno-sm transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-payno-md"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION: ALL-IN-ONE BUSINESS PLATFORM */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-[#ECD9CB]">
        {/* Subtle Radial Glow Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
          <div className="w-[800px] h-[500px] bg-radial from-[#FED7B8]/40 via-transparent to-transparent blur-3xl -top-24 opacity-60"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          {/* Floating Live Activity Ticker */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-[#ECD9CB] text-xs shadow-payno-sm transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-bold text-[#59171B]">
              {activityList[activeActivityIndex].creator}
            </span>
            <span className="text-[#7E635F]">secured</span>
            <span className="font-bold text-[#230B0D]">
              {activityList[activeActivityIndex].amount}
            </span>
            <span className="hidden sm:inline text-[#7E635F]">from</span>
            <span className="hidden sm:inline font-bold text-[#59171B]">
              {activityList[activeActivityIndex].brand}
            </span>
            <span className="hidden md:inline px-2 py-0.5 rounded-md bg-[#FAF3EC] text-[10px] font-semibold text-[#59171B] border border-[#ECD9CB]">
              {activityList[activeActivityIndex].tag}
            </span>
            <span className="text-[10px] text-[#7E635F]/80">
              • {activityList[activeActivityIndex].time}
            </span>
          </div>

          {/* Main Headline - All Creator Services */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FED7B8]/50 border border-[#ECD9CB] text-xs font-bold text-[#59171B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#59171B]" />
              <span>The All-in-One Business Platform for Creators</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[#230B0D] tracking-tight leading-[1.12]">
              The Professional Way Creators Close Deals with{' '}
              <span className="text-[#59171B] underline decoration-[#FED7B8] decoration-4 underline-offset-6">
                Brands & Clients.
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-[#7E635F] max-w-2xl mx-auto leading-relaxed font-normal">
              From sponsorships and UGC to video production and consulting: share your rates, send contracts with cancellation protection, and invoice with 0% commission.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              id="hero-create-account-btn"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-heading font-bold text-sm sm:text-base shadow-payno-md transition-all flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.01]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#simulator"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-[#230B0D] font-bold text-xs sm:text-sm shadow-payno-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4 text-[#59171B]" />
              <span>Try Deal Simulator</span>
            </a>
          </div>

          {/* Plain English Value Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-[#7E635F]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>0% Platform Commission (Keep 100%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cancellation Pay (Never Work for Free)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Bank, Stripe & PayPal Payouts</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* ALL-IN-ONE VISUAL STEP WORKFLOW (Plain English) */}
        {/* ----------------------------------------------------------- */}
        <div id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">
              Your Entire Deal in 4 Simple Steps
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#230B0D]">
              How Madeal Replaces Your Spreadsheets, DMs, and Word Docs for Brands & Clients
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Step 1: Media Kit */}
            <div className="bg-white p-5 rounded-2xl border border-[#ECD9CB] shadow-payno-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#FAF3EC] text-[#59171B] flex items-center justify-center font-black text-sm border border-[#ECD9CB]">
                1
              </div>
              <div className="space-y-1">
                <span className="font-heading font-bold text-sm text-[#230B0D] block">
                  Media Kit & Rates
                </span>
                <p className="text-xs text-[#7E635F] leading-relaxed">
                  Send brands & clients a clean link showing your audience demographics, portfolio, and clear package pricing.
                </p>
              </div>
            </div>

            {/* Step 2: Contract */}
            <div className="bg-white p-5 rounded-2xl border border-[#ECD9CB] shadow-payno-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center font-black text-sm">
                2
              </div>
              <div className="space-y-1">
                <span className="font-heading font-bold text-sm text-[#230B0D] block">
                  60-Second Contract
                </span>
                <p className="text-xs text-[#7E635F] leading-relaxed">
                  Lock in guaranteed 20% cancellation pay, max 2 revisions, and time limits on paid ad usage so you are never taken advantage of.
                </p>
              </div>
            </div>

            {/* Step 3: Fast Sign */}
            <div className="bg-white p-5 rounded-2xl border border-[#ECD9CB] shadow-payno-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-[#FAF3EC] text-[#59171B] flex items-center justify-center font-black text-sm border border-[#ECD9CB]">
                3
              </div>
              <div className="space-y-1">
                <span className="font-heading font-bold text-sm text-[#230B0D] block">
                  One-Link Brand & Client Signing
                </span>
                <p className="text-xs text-[#7E635F] leading-relaxed">
                  Brand managers and clients sign directly on their smartphone in 30 seconds. No apps, no accounts, and no legal intimidation.
                </p>
              </div>
            </div>

            {/* Step 4: Get Paid */}
            <div className="bg-white p-5 rounded-2xl border border-[#ECD9CB] shadow-payno-sm space-y-3 relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                4
              </div>
              <div className="space-y-1">
                <span className="font-heading font-bold text-sm text-[#230B0D] block">
                  Invoicing & Payouts
                </span>
                <p className="text-xs text-[#7E635F] leading-relaxed">
                  Automatic matching invoice PDFs. Automated polite payment reminders ensure your money lands directly in your bank account on time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* INTERACTIVE CONTRACT & PROTECTION SIMULATOR (Plain English) */}
        {/* ----------------------------------------------------------- */}
        <div id="simulator" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <div className="bg-white rounded-3xl border border-[#ECD9CB] shadow-payno-lg p-5 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECD9CB] pb-4">
              <div className="text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#59171B] uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Interactive Deal Simulator</span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#230B0D]">
                  See How Madeal Protects Your Income on Every Deal
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Plain-English Terms (No Confusing Jargon)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Simulator Controls (Left Column) */}
              <div className="lg:col-span-6 space-y-5 text-left">
                {/* Brand Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#7E635F] uppercase tracking-wider block">
                    1. Brand Sponsor or Client
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Gymshark', 'Notion', 'NordVPN', 'Glossier'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSimulatorBrand(b)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer truncate ${
                          simulatorBrand === b
                            ? 'bg-[#59171B] text-[#FED7B8] border-[#59171B] shadow-payno-sm'
                            : 'bg-[#FAF3EC] text-[#230B0D] border-[#ECD9CB] hover:bg-[#F5E8DC]'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deliverable Options */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#7E635F] uppercase tracking-wider block">
                    2. Content to Create
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      '1x TikTok + 1x Instagram Reel',
                      '60s YouTube Integration',
                      '2x UGC Videos Package',
                      'Dedicated Video Review',
                    ].map((deliv) => (
                      <button
                        key={deliv}
                        type="button"
                        onClick={() => setSimulatorDeliverable(deliv)}
                        className={`p-2.5 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          simulatorDeliverable === deliv
                            ? 'bg-[#59171B] text-[#FED7B8] border-[#59171B] shadow-payno-sm'
                            : 'bg-[#FAF3EC] text-[#230B0D] border-[#ECD9CB] hover:bg-[#F5E8DC]'
                        }`}
                      >
                        {deliv}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deal Fee Slider */}
                <div className="space-y-2 bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                      3. Your Creator Fee
                    </label>
                    <span className="font-heading font-black text-base text-[#59171B] font-mono">
                      ${simulatorFee.toLocaleString()} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={15000}
                    step={500}
                    value={simulatorFee}
                    onChange={(e) => setSimulatorFee(Number(e.target.value))}
                    className="w-full accent-[#59171B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#7E635F]">
                    <span>$1,000</span>
                    <span>$7,500</span>
                    <span>$15,000</span>
                  </div>
                </div>

                {/* Paid Ad Rights (Whitelisting) with Plain English Explanation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-[#7E635F] uppercase tracking-wider block">
                        4. Paid Ad Usage Rights
                      </label>
                      <span className="text-[11px] text-[#7E635F]">
                        Can the brand or client run your video as a paid ad on social media?
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-[#59171B]">
                      {simulatorPaidAds === 'none'
                        ? 'Regular Post Only'
                        : simulatorPaidAds === '30days'
                        ? '+20% Extra Fee'
                        : '+35% Extra Fee'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimulatorPaidAds('none')}
                      className={`p-2 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        simulatorPaidAds === 'none'
                          ? 'bg-[#59171B] text-[#FED7B8] border-[#59171B]'
                          : 'bg-[#FAF3EC] text-[#230B0D] border-[#ECD9CB]'
                      }`}
                    >
                      <span className="block font-bold">No Paid Ads</span>
                      <span className="text-[10px] opacity-80 block font-normal">Standard post</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatorPaidAds('30days')}
                      className={`p-2 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        simulatorPaidAds === '30days'
                          ? 'bg-[#59171B] text-[#FED7B8] border-[#59171B]'
                          : 'bg-[#FAF3EC] text-[#230B0D] border-[#ECD9CB]'
                      }`}
                    >
                      <span className="block font-bold">30-Day Ad Limit</span>
                      <span className="text-[10px] opacity-80 block font-normal">+20% ad fee</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatorPaidAds('60days')}
                      className={`p-2 text-left text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        simulatorPaidAds === '60days'
                          ? 'bg-[#59171B] text-[#FED7B8] border-[#59171B]'
                          : 'bg-[#FAF3EC] text-[#230B0D] border-[#ECD9CB]'
                      }`}
                    >
                      <span className="block font-bold">60-Day Ad Limit</span>
                      <span className="text-[10px] opacity-80 block font-normal">+35% ad fee</span>
                    </button>
                  </div>

                  {/* Beginner-friendly explanation */}
                  <div className="p-2.5 rounded-xl bg-[#FAF3EC] border border-[#ECD9CB] flex items-start gap-2 text-[11px] text-[#7E635F]">
                    <HelpCircle className="w-3.5 h-3.5 text-[#59171B] shrink-0 mt-0.5" />
                    <span>
                      <strong>Why this matters:</strong> Without this limit, brands & clients often put ad budget behind your video and run your face across TikTok & Instagram for months without paying you a dime extra. Madeal protects your face with strict time limits.
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Contract Preview Ticket (Right Column) */}
              <div className="lg:col-span-6 bg-[#FAF3EC] rounded-2xl border-2 border-[#59171B] p-4 sm:p-6 space-y-4 text-left shadow-payno-sm">
                <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#59171B] text-[#FED7B8] flex items-center justify-center font-black text-xs">
                      M
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#7E635F] uppercase tracking-wider block">
                        Live Agreement Preview
                      </span>
                      <span className="font-heading font-bold text-xs text-[#230B0D]">
                        {simulatorBrand} (Client) × You (Creator)
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Guaranteed Protection
                  </span>
                </div>

                {/* Scope Summary Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-[#ECD9CB]">
                    <span className="text-[10px] font-bold text-[#7E635F] block uppercase">What You Deliver</span>
                    <span className="font-bold text-[#230B0D] text-[11px] block mt-0.5 truncate">
                      {simulatorDeliverable}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#ECD9CB]">
                    <span className="text-[10px] font-bold text-[#7E635F] block uppercase">Ad Usage Limit</span>
                    <span className="font-bold text-[#230B0D] text-[11px] block mt-0.5">
                      {simulatorPaidAds === 'none' ? 'No Paid Ads Allowed' : `${simulatorPaidAds === '30days' ? '30 Days' : '60 Days'} (Strict Cap)`}
                    </span>
                  </div>
                </div>

                {/* Plain-English Payment & Cancellation Terms Highlight */}
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#ECD9CB]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7E635F]">Total Brand / Client Pays You:</span>
                    <span className="font-heading font-black text-base text-[#230B0D] font-mono">
                      ${effectiveTotalFee.toLocaleString()} USD
                    </span>
                  </div>

                  {/* 20% Cancellation Fee Guarantee */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#F5E8DC]">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>20% Cancellation Pay Guarantee:</span>
                    </div>
                    <span className="font-bold text-emerald-700 font-mono">
                      ${guaranteedKillFee.toLocaleString()} USD
                    </span>
                  </div>

                  <p className="text-[11px] text-[#7E635F] leading-tight">
                    *If {simulatorBrand} cancels after you start scripting or shooting, you are legally guaranteed <strong>${guaranteedKillFee.toLocaleString()} USD (20%)</strong> for your reserved calendar time.
                  </p>
                </div>

                {/* Additional Standard Protections */}
                <div className="space-y-1 text-xs text-[#230B0D] bg-white p-3 rounded-xl border border-[#ECD9CB]">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Free edits capped at 2 rounds</strong> (extra edits are paid)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Paid within 15 days</strong> of publishing with automated reminders</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>0% platform fee</strong> (you keep every single dollar)</span>
                  </div>
                </div>

                {/* Quick Action Button to take this simulated deal */}
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="w-full py-3 px-4 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs sm:text-sm font-bold rounded-xl shadow-payno-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Generate Free Contract with These Terms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* INFINITE LOGO MARQUEE: SPONSOR BRANDS */}
      {/* ------------------------------------------------------------- */}
      <section className="py-8 bg-white border-b border-[#ECD9CB] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <p className="text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
            Used by creators partnering with global sponsor brands & direct clients
          </p>
        </div>

        {/* Gradient Mask Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* Animated Marquee Row */}
        <div className="animate-marquee flex items-center gap-10">
          {[...brandList, ...brandList, ...brandList].map((brand, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#FAF3EC] border border-[#ECD9CB] shadow-payno-sm shrink-0 hover:border-[#59171B] transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-[#59171B]"></div>
              <span className="font-heading font-black text-xs text-[#230B0D] tracking-wide">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* ASYMMETRIC BENTO GRID: ALL-IN-ONE BUSINESS SUITE (Plain English) */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">
            All-in-One Platform for Creators
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#230B0D]">
            Everything You Need to Work with Brands & Clients Like a Pro.
          </h2>
          <p className="text-xs sm:text-sm text-[#7E635F]">
            No legal degree required. We eliminated confusing legalese so you, your sponsor brands, and your direct clients always know exactly what is agreed upon.
          </p>
        </div>

        {/* Bento Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: Cancellation Protection (8 cols) */}
          <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-5 hover:shadow-payno-md transition-shadow relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start">
                Guaranteed 20% Cancellation Pay
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-xl font-bold text-[#230B0D]">
                Get Paid 20% Even If the Brand or Client Cancels
              </h3>
              <p className="text-xs sm:text-sm text-[#7E635F] leading-relaxed max-w-xl">
                Ever spent days planning a project only for the client to say "our campaign is paused"? Without Madeal, you get $0. With Madeal, if a brand or client pulls out after signing, you automatically keep 20% of the deal fee for your reserved calendar time.
              </p>
            </div>

            {/* Visual Mini Comparison Bar */}
            <div className="bg-[#FAF3EC] p-4 rounded-2xl border border-[#ECD9CB] space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-700 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Without Madeal: $0 (Wasted time)
                </span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> With Madeal: $1,000 Protected (20%)
                </span>
              </div>
              <div className="h-3 w-full bg-rose-200 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-600 rounded-full w-1/5"></div>
              </div>
            </div>
          </div>

          {/* Tile 2: 0% Platform Commission (4 cols) */}
          <div className="md:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-5 hover:shadow-payno-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#230B0D]">
                Keep 100% of What You Earn
              </h3>
              <p className="text-xs text-[#7E635F] leading-relaxed">
                Talent agencies take 20% of your paycheck. Madeal charges 0% commission. Brand & client payments go directly to your bank account or Stripe.
              </p>
            </div>
            <div className="bg-[#FAF3EC] p-3 rounded-xl border border-[#ECD9CB] text-center">
              <span className="text-[10px] font-bold text-[#7E635F] uppercase">Saved on a $5,000 Deal</span>
              <span className="font-heading font-black text-xl text-[#59171B] block">+$1,000 in your pocket</span>
            </div>
          </div>

          {/* Tile 3: Paid Ad Rights Protection (4 cols) */}
          <div className="md:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-4 hover:shadow-payno-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#230B0D]">
              Stop Endless Paid Ad Usage
            </h3>
            <p className="text-xs text-[#7E635F] leading-relaxed">
              Don't let brands or clients run paid ads with your face forever. Set a strict 30 or 60-day expiration date, and charge them extra licensing fees if they want to run ads.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#59171B] bg-[#FAF3EC] p-2.5 rounded-xl border border-[#ECD9CB]">
              <Clock className="w-4 h-4" />
              <span>Strict 30-Day Window Active</span>
            </div>
          </div>

          {/* Tile 4: Instant Brand Mobile Signing (8 cols) */}
          <div className="md:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#ECD9CB] shadow-payno-sm space-y-5 hover:shadow-payno-md transition-shadow relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#59171B] text-[#FED7B8] text-xs font-bold self-start">
                No Login or App Needed for Brands & Clients
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-xl font-bold text-[#230B0D]">
                Brands & Clients Sign on Their Phone in 30 Seconds
              </h3>
              <p className="text-xs sm:text-sm text-[#7E635F] leading-relaxed max-w-xl">
                Brand marketers and creative clients hate printing PDFs or logging into complicated legal portals. Send them a secure Madeal link: they review the deliverables in plain English and sign with one tap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-[#FAF3EC] p-3 rounded-xl border border-[#ECD9CB]">
                <span className="font-bold text-[#230B0D] block">1-Tap Signature</span>
                <span className="text-[11px] text-[#7E635F]">Sign with finger on any phone or laptop</span>
              </div>
              <div className="bg-[#FAF3EC] p-3 rounded-xl border border-[#ECD9CB]">
                <span className="font-bold text-[#230B0D] block">Plain-English Explanations</span>
                <span className="text-[11px] text-[#7E635F]">Both sides understand every term</span>
              </div>
              <div className="bg-[#FAF3EC] p-3 rounded-xl border border-[#ECD9CB]">
                <span className="font-bold text-[#230B0D] block">Automatic Signed PDFs</span>
                <span className="text-[11px] text-[#7E635F]">Sent to both emails immediately</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* COMPARISON TABLE: MESSY DMS VS MADEAL (Plain English) */}
      {/* ------------------------------------------------------------- */}
      <section id="comparison" className="py-16 bg-white border-y border-[#ECD9CB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">
              The Creator Difference
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#230B0D]">
              Why Relying on DMs and Email Promises Costs You Money
            </h2>
          </div>

          <div className="rounded-3xl border border-[#ECD9CB] overflow-hidden shadow-payno-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF3EC] border-b border-[#ECD9CB] text-xs font-bold text-[#7E635F]">
                  <th className="p-4 sm:p-5 w-1/3">Deal Situation</th>
                  <th className="p-4 sm:p-5 w-1/3 text-rose-700 bg-rose-50/40">Informal DMs & Word Docs</th>
                  <th className="p-4 sm:p-5 w-1/3 text-[#59171B] bg-[#FED7B8]/20">Madeal Agreement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECD9CB] text-xs">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#230B0D]">Brand or Client Cancels After You Prep</td>
                  <td className="p-4 sm:p-5 text-rose-700">You get $0 for hours of creative work</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-[#FED7B8]/10">
                    Guaranteed 20% cancellation payout
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#230B0D]">Using Your Video as a Paid Ad</td>
                  <td className="p-4 sm:p-5 text-rose-700">Client runs your face in ads forever for free</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-[#FED7B8]/10">
                    Strict 30/60-day cap + extra licensing fee
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#230B0D]">Client Requests Re-shoots</td>
                  <td className="p-4 sm:p-5 text-rose-700">Endless unpaid revision demands</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-[#FED7B8]/10">
                    Capped at 2 free revisions; extra edits are paid
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#230B0D]">Getting Paid on Time</td>
                  <td className="p-4 sm:p-5 text-rose-700">Awkwardly chasing accounting 60+ days later</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-[#FED7B8]/10">
                    Strict 15-day deadline + automated polite reminders
                  </td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-[#230B0D]">Platform Cut</td>
                  <td className="p-4 sm:p-5 text-rose-700">15% to 20% taken by talent agencies</td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-[#FED7B8]/10">
                    0% commission — you keep 100% of your earnings
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* INTERACTIVE PRICING SWITCHER */}
      {/* ------------------------------------------------------------- */}
      <section id="pricing" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">
            Simple, Transparent Pricing
          </span>
          <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#230B0D]">
            One Saved Deal Pays for Madeal for Years.
          </h2>
          <p className="text-xs sm:text-sm text-[#7E635F]">
            Start free. Upgrade only when your brand & client deals grow.
          </p>

          {/* Interactive Billing Switcher */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-bold ${
                billingPeriod === 'monthly' ? 'text-[#59171B]' : 'text-[#7E635F]'
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 bg-[#59171B] rounded-full p-1 transition-colors cursor-pointer relative"
            >
              <div
                className={`w-4 h-4 bg-[#FED7B8] rounded-full transition-transform ${
                  billingPeriod === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold ${
                  billingPeriod === 'annual' ? 'text-[#59171B]' : 'text-[#7E635F]'
                }`}
              >
                Annual Billed
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
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
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 3 Active Brand & Client Contracts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>20% Cancellation Fee Guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public Media Kit & Rate Card</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
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
              Most Popular for Full-Time Creators
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#FED7B8]/80 uppercase tracking-wider block">Creator Pro</span>
              <div className="space-y-1">
                <div className="font-heading text-3xl font-black text-white">
                  {billingPeriod === 'annual' ? '$5.60' : '$7'}
                  <span className="text-xs font-normal text-[#FED7B8]/70">/month</span>
                </div>
                <p className="text-xs text-[#FED7B8]/70">
                  {billingPeriod === 'annual' ? 'Billed annually ($67/yr)' : 'Billed monthly'}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-white pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8] shrink-0" />
                  <span>Unlimited Brand & Client Contracts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8] shrink-0" />
                  <span>Custom Paid Ad Usage Rights & Expiration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8] shrink-0" />
                  <span>Automated Overdue Payment Reminders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8] shrink-0" />
                  <span>Commercial PDF Invoices (Multi-Currency)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FED7B8] shrink-0" />
                  <span>One-Link Brand & Client Signing Portal</span>
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
                  {billingPeriod === 'annual' ? '$15.20' : '$19'}
                  <span className="text-xs font-normal text-[#7E635F]">/month</span>
                </div>
                <p className="text-xs text-[#7E635F]">
                  {billingPeriod === 'annual' ? 'Billed annually ($182/yr)' : 'Billed monthly'}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-[#230B0D] pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Everything in Creator Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multiple Creator Roster Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Master Agreement Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
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
      {/* FAQ SECTION: PLAIN ENGLISH ANSWERS */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-16 sm:py-20 bg-[#FAF3EC] border-t border-[#ECD9CB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#59171B] uppercase tracking-wider">
              Plain-English FAQ
            </span>
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
                  className="rounded-2xl border border-[#ECD9CB] bg-white shadow-payno-sm hover:border-[#59171B]/30 overflow-hidden transition-all"
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
                    <div className="px-4 pb-4 text-xs text-[#7E635F] leading-relaxed border-t border-[#ECD9CB]/60 pt-3 bg-[#FAF3EC]/30">
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
      {/* FINAL HIGH-CONVERTING CTA BANNER */}
      {/* ------------------------------------------------------------- */}
      <section className="py-16 sm:py-24 bg-[#FAF3EC] border-t border-[#ECD9CB] px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white p-8 sm:p-14 text-center border-2 border-[#ECD9CB] shadow-payno-md space-y-6 relative overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FED7B8]/50 border border-[#ECD9CB] text-xs font-bold text-[#59171B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#59171B]" />
              <span>Built for Every Paid Creator Service</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#230B0D] tracking-tight">
              Stop Leaving Money on the Table for Your Work.
            </h2>
            <p className="text-xs sm:text-base text-[#7E635F] max-w-xl mx-auto leading-relaxed">
              Whether you do sponsorships, UGC, video production, or consulting: protect your time with guaranteed 20% cancellation pay, send one-link contracts, and get paid on time by every brand and client.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-heading font-bold text-sm shadow-payno-sm transition-all inline-flex items-center justify-center gap-2 cursor-pointer hover:shadow-payno-md"
            >
              <span>Get Started Free</span>
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
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#simulator" className="hover:text-white transition-colors">
                Simulator
              </a>
              <a href="#features" className="hover:text-white transition-colors">
                Tools
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#ECD9CB]/60">
            <p>© {new Date().getFullYear()} Madeal Technologies Inc. The all-in-one business platform for creators.</p>
            <div className="flex items-center gap-4">
              <span>Standard Creator Legal Protections</span>
              <span>•</span>
              <span>Direct Bank Remittance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
