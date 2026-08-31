import React, { useState } from 'react';
import { Deal, DeliverableItem, CreatorProfile } from '../types';
import {
  Check,
  ChevronDown,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Video,
  Instagram,
  Youtube,
  Clock,
  DollarSign,
  ShieldCheck,
  FileCheck,
  Sparkles,
  HelpCircle,
  Info,
  Globe,
} from 'lucide-react';
import { TermInfoTooltip } from './TermInfoTooltip';
import {
  USAGE_TERMS_MAP,
  EXCLUSIVITY_TERMS_MAP,
  OTHER_LEGAL_TERMS,
} from '../utils/legalTerms';
import { SUPPORTED_CURRENCIES, TAX_RATE_PRESETS, formatMoney, calculateDealTotals } from '../utils/currency';
import { generateSecureId } from '../utils/id';

interface ContractWizardProps {
  creator: CreatorProfile;
  creatorId: string;
  onSaveDeal: (deal: Deal) => void;
  onCancel: () => void;
  initialDeal?: Partial<Deal>;
}

export const ContractWizard: React.FC<ContractWizardProps> = ({
  creator,
  creatorId,
  onSaveDeal,
  onCancel,
  initialDeal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State - Step 1: Parties
  const [creatorHandle, setCreatorHandle] = useState(initialDeal?.creatorHandle || creator.handle);
  const [brandName, setBrandName] = useState(initialDeal?.brandName || '');
  const [projectTitle, setProjectTitle] = useState(initialDeal?.title || '');
  const [creatorEmail, setCreatorEmail] = useState(initialDeal?.creatorEmail || creator.email);
  const [clientEmail, setClientEmail] = useState(initialDeal?.clientEmail || '');
  const [currency, setCurrency] = useState(initialDeal?.currency || creator.defaultCurrency || 'USD');
  const [taxRate, setTaxRate] = useState(initialDeal?.taxRate ?? creator.defaultTaxRate ?? 0);

  // Form State - Step 2: Deliverables
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>(
    initialDeal?.deliverables || [
      {
        id: 'del-init-1',
        type: 'tiktok',
        title: 'TikTok Dedicated Video',
        description: '1x Dedicated Video, 60s max, 1 revision included',
        baseRate: 1500,
        quantity: 1,
      },
    ]
  );

  // Form State - Step 3: Usage Rights
  const [exclusivity, setExclusivity] = useState(initialDeal?.exclusivity || '90 Days');
  const [usageTerm, setUsageTerm] = useState(initialDeal?.usageTerm || '90 Days Paid Ads');
  const [revisions, setRevisions] = useState(initialDeal?.revisions || 2);
  const [lateFeePercent, setLateFeePercent] = useState(initialDeal?.lateFeePercent || 1.5);
  const [notes, setNotes] = useState(initialDeal?.notes || '');

  // Calculate total amount & tax
  const subtotal = deliverables.reduce(
    (sum, item) => sum + (Number(item.baseRate) || 0) * (item.quantity || 1),
    0
  );
  const { taxAmount, total: totalAmount } = calculateDealTotals(subtotal, taxRate);

  // Deliverable presets utilizing creator's custom rate cards across all configured platforms
  const deliverablePresets = creator.rateCards && creator.rateCards.length > 0
    ? creator.rateCards.map((rc) => ({
        type: 'custom' as const,
        title: `${rc.platform} ${rc.format}`,
        defaultRate: rc.rate,
        desc: rc.description || `${rc.platform} branded content deliverable`,
      }))
    : [
        {
          type: 'tiktok' as const,
          title: 'TikTok Video',
          defaultRate: creator.rates?.tiktokVideo || 1500,
          desc: '60s organic TikTok integration',
        },
        {
          type: 'instagram' as const,
          title: 'IG Reel / Carousel',
          defaultRate: creator.rates?.instagramReel || 1200,
          desc: 'In-feed Reel with link in bio',
        },
        {
          type: 'facebook' as const,
          title: 'Facebook Video Post',
          defaultRate: 950,
          desc: 'Branded video post with tracking link',
        },
        {
          type: 'youtube' as const,
          title: 'YouTube Sponsor',
          defaultRate: creator.rates?.youtubeIntegration || 2500,
          desc: '60-90s integrated sponsor segment',
        },
        {
          type: 'story' as const,
          title: 'IG Story Set',
          defaultRate: creator.rates?.storySet || 600,
          desc: '3x Story frames with swipe-up link',
        },
        {
          type: 'ugc' as const,
          title: 'UGC Raw Assets',
          defaultRate: creator.rates?.ugcAsset || 800,
          desc: 'Ad-ready vertical assets without posting',
        },
      ];

  const handleAddPreset = (preset: typeof deliverablePresets[0]) => {
    const newItem: DeliverableItem = {
      id: 'del-' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: preset.type,
      title: preset.title,
      description: preset.desc,
      baseRate: preset.defaultRate,
      quantity: 1,
    };
    setDeliverables([...deliverables, newItem]);
  };

  const handleUpdateDeliverable = (id: string, updates: Partial<DeliverableItem>) => {
    setDeliverables(deliverables.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  const handleRemoveDeliverable = (id: string) => {
    if (deliverables.length === 1) return;
    setDeliverables(deliverables.filter((item) => item.id !== id));
  };

  const handleQuickAutofillBrand = (presetBrand: string, title: string) => {
    setBrandName(presetBrand);
    setProjectTitle(title);
    setClientEmail(`partnerships@${presetBrand.toLowerCase().replace(/\s+/g, '')}.com`);
  };

  const handleFinalize = () => {
    const newDeal: Deal = {
      id: initialDeal?.id || generateSecureId('deal'),
      creatorId: initialDeal?.creatorId || creatorId,
      title: projectTitle.trim() || `${brandName || 'Brand'} Collaboration`,
      brandName: brandName.trim() || 'Partner Brand',
      creatorHandle: creatorHandle.trim() || creator.handle,
      creatorEmail: creatorEmail.trim() || creator.email,
      clientEmail: clientEmail.trim() || 'client@brand.com',
      currency,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'pending_signature',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      deliverables,
      exclusivity,
      usageTerm,
      revisions,
      lateFeePercent,
      invoiceNumber: initialDeal?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      clientSigned: false,
      notes,
      messages: [
        {
          id: 'msg-init-1',
          sender: 'system',
          senderName: 'Madeal Protocol',
          text: `Agreement drafted for ${brandName || 'Partner'} (${formatMoney(totalAmount, currency)})`,
          timestamp: 'Just now',
        },
        {
          id: 'msg-init-2',
          sender: 'creator',
          senderName: creator.name.split(' ')[0],
          text: `Hi ${brandName || 'team'}! I’ve drafted our Content Creation Agreement. Please review the deliverables, pricing, and usage rights.`,
          timestamp: 'Just now',
          attachment: {
            type: 'contract',
            title: `Agreement - ${projectTitle || 'Campaign'}`,
          },
        },
      ],
    };

    onSaveDeal(newDeal);
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Wizard Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
            CONTRACT GENERATOR
          </span>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[#230B0D] mt-0.5">
            Create Agreement
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-[#7E635F] hover:text-[#230B0D] font-semibold transition-colors px-3 py-1.5 rounded-xl border border-[#ECD9CB] bg-white cursor-pointer shadow-payno-sm"
        >
          Cancel
        </button>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#ECD9CB] shadow-payno-sm">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setStep(1)}
            className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
              step === 1
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : step > 1
                ? 'bg-[#FAF3EC] text-[#59171B]'
                : 'text-[#7E635F] hover:bg-[#FAF3EC]'
            }`}
          >
            1. Parties
          </button>
          <button
            onClick={() => setStep(2)}
            className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
              step === 2
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : step > 2
                ? 'bg-[#FAF3EC] text-[#59171B]'
                : 'text-[#7E635F] hover:bg-[#FAF3EC]'
            }`}
          >
            2. Deliverables
          </button>
          <button
            onClick={() => setStep(3)}
            className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
              step === 3
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:bg-[#FAF3EC]'
            }`}
          >
            3. Terms & Rights
          </button>
        </div>
      </div>

      {/* STEP 1: Parties & Campaign Overview */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECD9CB] shadow-payno-sm space-y-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#230B0D]">
              Step 1: Parties & Campaign
            </h2>
            <p className="text-xs text-[#7E635F] mt-1">
              Identify the creator and brand entering this agreement.
            </p>
          </div>

          {/* Quick autofill sample brands */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#7E635F] uppercase tracking-wider block">
              Quick Brand Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { brand: 'Glossier', title: 'Spring Glow Campaign' },
                { brand: 'Gymshark', title: 'Athletic Wear Feature' },
                { brand: 'Notion', title: 'Productivity Vlog Sponsorship' },
                { brand: 'Bloom Nutrition', title: 'Daily Greens Story Set' },
              ].map((item) => (
                <button
                  key={item.brand}
                  type="button"
                  onClick={() => handleQuickAutofillBrand(item.brand, item.title)}
                  className="px-3 py-1.5 rounded-xl text-xs bg-[#FAF3EC] hover:bg-[#F5E8DC] text-[#59171B] border border-[#ECD9CB] transition-all cursor-pointer font-medium"
                >
                  + {item.brand}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                Brand / Client Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Lumina Skincare Inc."
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-sm text-[#230B0D] outline-none transition-all placeholder:text-[#8C726D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                Campaign / Project Title *
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Autumn Product Launch"
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-sm text-[#230B0D] outline-none transition-all placeholder:text-[#8C726D]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                Creator Legal Handle / Name
              </label>
              <input
                type="text"
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-sm text-[#230B0D] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                Brand Partnerships Contact Email *
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="partnerships@brand.com"
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-sm text-[#230B0D] outline-none transition-all placeholder:text-[#8C726D]"
              />
            </div>

            {/* Currency Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                Invoice Settlement Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] font-medium outline-none cursor-pointer"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.flag} {curr.code} - {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Tax Rate / VAT Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                Tax / VAT / GST Rate
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] font-medium outline-none cursor-pointer"
              >
                {TAX_RATE_PRESETS.map((t) => (
                  <option key={t.label} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#F5E8DC]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-payno-sm active:scale-95"
            >
              <span>Continue to Deliverables</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Deliverables & Rates */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECD9CB] shadow-payno-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-xl font-bold text-[#230B0D]">
                Step 2: Deliverables & Rates
              </h2>
              <p className="text-xs text-[#7E635F] mt-0.5">
                Add content formats, quantities, and pricing in {currency}.
              </p>
            </div>
            <div className="text-left sm:text-right bg-[#FAF3EC] px-3.5 py-2 rounded-2xl border border-[#ECD9CB]">
              <span className="text-[10px] uppercase font-bold text-[#7E635F] block">
                Total Deal Value ({currency})
              </span>
              <span className="font-heading text-xl font-bold text-[#59171B]">
                {formatMoney(totalAmount, currency)}
              </span>
              {taxRate > 0 && (
                <span className="text-[10px] text-[#7E635F] block">
                  Incl. {taxRate}% tax ({formatMoney(taxAmount, currency)})
                </span>
              )}
            </div>
          </div>

          {/* Quick Deliverable Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#7E635F] uppercase tracking-wider block">
              Add Content Format
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {deliverablePresets.map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="bg-[#FAF3EC] hover:bg-[#F5E8DC] border border-[#ECD9CB] hover:border-[#59171B]/60 p-3 rounded-2xl text-left transition-all cursor-pointer group shadow-payno-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#230B0D] group-hover:text-[#59171B]">
                      + {preset.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7E635F] block mt-1">
                    ${preset.defaultRate} base
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Deliverables List Table / Items */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-[#7E635F] uppercase tracking-wider block">
              Selected Deliverable Items ({deliverables.length})
            </span>

            {deliverables.map((item, idx) => (
              <div
                key={item.id}
                className="bg-[#FAF3EC] rounded-2xl p-4 border border-[#ECD9CB] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#59171B]">
                    Deliverable #{idx + 1}
                  </span>
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(item.id)}
                      className="text-[#7E635F] hover:text-[#B82C3A] p-1 transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] font-bold text-[#7E635F] uppercase">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateDeliverable(item.id, { title: e.target.value })}
                      className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-[#7E635F] uppercase">
                      Rate ($ USD)
                    </label>
                    <input
                      type="number"
                      value={item.baseRate}
                      onChange={(e) => handleUpdateDeliverable(item.id, { baseRate: Number(e.target.value) })}
                      className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-[#7E635F] uppercase">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleUpdateDeliverable(item.id, { quantity: Number(e.target.value) })}
                      className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-[#7E635F] uppercase">
                      Subtotal
                    </label>
                    <div className="bg-white border border-[#ECD9CB] rounded-xl px-3 py-2 text-xs text-[#59171B] font-bold">
                      ${(item.baseRate * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7E635F] uppercase">
                    Description & Specifications
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateDeliverable(item.id, { description: e.target.value })}
                    placeholder="Specific talking points, framing guidelines, or duration..."
                    className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F5E8DC]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:text-[#230B0D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-payno-sm active:scale-95"
            >
              <span>Continue to Terms & Rights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Terms, Exclusivity & Rights */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ECD9CB] shadow-payno-sm space-y-6">
          <div>
            <h2 className="font-heading text-xl font-bold text-[#230B0D]">
              Step 3: Usage Rights & Protections
            </h2>
            <p className="text-xs text-[#7E635F] mt-0.5">
              Specify licensing duration, paid media usage, and revision parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Usage Rights / Whitelisting */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Ad Usage & Whitelisting Rights
                </label>
                <TermInfoTooltip
                  info={
                    USAGE_TERMS_MAP[usageTerm] ||
                    USAGE_TERMS_MAP['90 Days Paid Ads / Whitelisting'] ||
                    OTHER_LEGAL_TERMS.whitelisting
                  }
                />
              </div>
              <select
                value={usageTerm}
                onChange={(e) => setUsageTerm(e.target.value)}
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] font-medium outline-none cursor-pointer"
              >
                <option value="Organic Only (No Paid Ads)">
                  Organic Only (No Paid Ads)
                </option>
                <option value="30 Days Paid Ads / Whitelisting">
                  30 Days Paid Ads / Whitelisting
                </option>
                <option value="90 Days Paid Ads / Whitelisting">
                  90 Days Paid Ads / Whitelisting
                </option>
                <option value="180 Days Global Paid Usage">
                  180 Days Global Paid Usage
                </option>
                <option value="Perpetual Digital Rights">
                  Perpetual Digital Rights
                </option>
              </select>
            </div>

            {/* Exclusivity Category Window */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Competitor Exclusivity Window
                </label>
                <TermInfoTooltip
                  info={
                    EXCLUSIVITY_TERMS_MAP[exclusivity] ||
                    EXCLUSIVITY_TERMS_MAP['None (Non-Exclusive)']
                  }
                />
              </div>
              <select
                value={exclusivity}
                onChange={(e) => setExclusivity(e.target.value)}
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] font-medium outline-none cursor-pointer"
              >
                <option value="None (Non-Exclusive)">None (Non-Exclusive)</option>
                <option value="30 Days Direct Competitor Exclusivity">
                  30 Days Direct Competitor Exclusivity
                </option>
                <option value="60 Days Direct Competitor Exclusivity">
                  60 Days Direct Competitor Exclusivity
                </option>
                <option value="90 Days Direct Competitor Exclusivity">
                  90 Days Direct Competitor Exclusivity
                </option>
              </select>
            </div>

            {/* Included Revisions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Included Revisions
                </label>
                <TermInfoTooltip info={OTHER_LEGAL_TERMS.revisions} />
              </div>
              <select
                value={revisions}
                onChange={(e) => setRevisions(Number(e.target.value))}
                className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] font-medium outline-none cursor-pointer"
              >
                <option value={1}>1 Revision Round</option>
                <option value={2}>2 Revision Rounds (Standard)</option>
                <option value={3}>3 Revision Rounds</option>
              </select>
            </div>

            {/* Late Payment Surcharge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Late Payment Surcharge (% per month)
                </label>
                <TermInfoTooltip info={OTHER_LEGAL_TERMS.lateFee} />
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={lateFeePercent}
                  onChange={(e) => setLateFeePercent(Number(e.target.value))}
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] font-medium outline-none"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#7E635F]">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#7E635F] uppercase tracking-wider">
              Special Stipulations & Brief Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Products must be received 14 days prior to filming. Creator retains copyright ownership..."
              className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2.5 text-xs text-[#230B0D] outline-none"
            />
          </div>

          {/* Agreement summary box */}
          <div className="bg-[#FAF3EC] rounded-2xl p-4 border border-[#ECD9CB] flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#230B0D] block">Agreement Ready for Dispatch</span>
              <span className="text-[#7E635F]">
                {formatMoney(totalAmount, currency)} total {taxRate > 0 ? `(incl. ${taxRate}% tax)` : ''} • {deliverables.length} deliverable items • Net 30 terms
              </span>
            </div>
            <span className="text-[#59171B] font-bold">Stripe Connect Ready</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F5E8DC]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="py-2.5 px-4 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:text-[#230B0D] transition-colors flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleFinalize}
              className="bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-payno-sm active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Generate Contract & Sign</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
