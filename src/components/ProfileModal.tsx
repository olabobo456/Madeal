import React, { useState } from 'react';
import { CreatorProfile, RateCardItem } from '../types';
import {
  X,
  Check,
  DollarSign,
  Building,
  Link2,
  User,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ProfileModalProps {
  creator: CreatorProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: CreatorProfile) => void;
  onOpenPricing?: () => void;
  onSignOut?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  creator,
  isOpen,
  onClose,
  onSave,
  onOpenPricing,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'rates' | 'payments'>('profile');

  // Basic Info State
  const [name, setName] = useState(creator.name);
  const [handle, setHandle] = useState(creator.handle);
  const [email, setEmail] = useState(creator.email);
  const [niche, setNiche] = useState(creator.niche);

  // Dynamic Rate Cards State
  const initialRateCards: RateCardItem[] =
    creator.rateCards && creator.rateCards.length > 0
      ? creator.rateCards
      : [
          {
            id: 'rate-1',
            platform: 'TikTok',
            format: 'Dedicated Video',
            rate: creator.rates?.tiktokVideo || 1500,
            description: '60s organic video with product showcase',
          },
          {
            id: 'rate-2',
            platform: 'Instagram',
            format: 'Reel & Carousel Post',
            rate: creator.rates?.instagramReel || 1200,
            description: 'In-feed Reel with caption tag & link in bio',
          },
          {
            id: 'rate-3',
            platform: 'YouTube',
            format: 'Sponsored Integration',
            rate: creator.rates?.youtubeIntegration || 2500,
            description: '60-90s dedicated segment with link in description',
          },
          {
            id: 'rate-4',
            platform: 'Facebook',
            format: 'Video & Post Integration',
            rate: 950,
            description: 'Cross-posted branded video with tracking link',
          },
          {
            id: 'rate-5',
            platform: 'Instagram',
            format: 'Story Set (3 Frames)',
            rate: creator.rates?.storySet || 600,
            description: '3 sequence story frames with interactive link',
          },
        ];

  const [rateCards, setRateCards] = useState<RateCardItem[]>(initialRateCards);

  // New Rate Card Form in Rate Tab
  const [showAddRateForm, setShowAddRateForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState('Facebook');
  const [newCustomPlatform, setNewCustomPlatform] = useState('');
  const [newFormat, setNewFormat] = useState('');
  const [newRate, setNewRate] = useState<number>(750);
  const [newDescription, setNewDescription] = useState('');

  // Payment Preferences State
  const currentPayPrefs = creator.paymentPreferences || {
    preferredMethod: 'bank_transfer',
    paymentLink: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    swiftBic: '',
    paypalEmail: '',
    customInstructions: '',
  };

  const [preferredMethod, setPreferredMethod] = useState<
    'payment_link' | 'bank_transfer' | 'wise' | 'paypal' | 'custom'
  >(currentPayPrefs.preferredMethod || 'bank_transfer');
  const [paymentLink, setPaymentLink] = useState(currentPayPrefs.paymentLink || '');
  const [bankName, setBankName] = useState(currentPayPrefs.bankName || '');
  const [accountName, setAccountName] = useState(currentPayPrefs.accountName || '');
  const [accountNumber, setAccountNumber] = useState(currentPayPrefs.accountNumber || '');
  const [routingNumber, setRoutingNumber] = useState(currentPayPrefs.routingNumber || '');
  const [swiftBic, setSwiftBic] = useState(currentPayPrefs.swiftBic || '');
  const [paypalEmail, setPaypalEmail] = useState(currentPayPrefs.paypalEmail || '');
  const [customInstructions, setCustomInstructions] = useState(
    currentPayPrefs.customInstructions || ''
  );

  if (!isOpen) return null;

  const initials = (name || creator.name)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const planLabel =
    creator.plan === 'agency'
      ? 'Agency Studio ($19/mo)'
      : creator.plan === 'free'
      ? 'Free Starter ($0/mo)'
      : 'Creator Pro ($7/mo)';

  const handleAddRateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPlatform =
      newPlatform === 'Other' ? newCustomPlatform.trim() || 'Custom Platform' : newPlatform;
    const finalFormat = newFormat.trim() || 'Standard Deliverable';

    const newCard: RateCardItem = {
      id: 'rate-' + Date.now(),
      platform: finalPlatform,
      format: finalFormat,
      rate: Number(newRate) || 500,
      description: newDescription.trim() || `${finalPlatform} branded content delivery`,
    };

    setRateCards([...rateCards, newCard]);
    setNewFormat('');
    setNewRate(750);
    setNewDescription('');
    setNewCustomPlatform('');
    setShowAddRateForm(false);
  };

  const handleRemoveRateCard = (id: string) => {
    setRateCards(rateCards.filter((card) => card.id !== id));
  };

  const handleUpdateRateCardPrice = (id: string, newPrice: number) => {
    setRateCards(
      rateCards.map((card) => (card.id === id ? { ...card, rate: newPrice } : card))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const tiktokCard = rateCards.find((c) => c.platform.toLowerCase().includes('tiktok'));
    const igCard = rateCards.find(
      (c) => c.platform.toLowerCase().includes('instagram') && !c.format.toLowerCase().includes('story')
    );
    const ytCard = rateCards.find((c) => c.platform.toLowerCase().includes('youtube'));
    const storyCard = rateCards.find((c) => c.format.toLowerCase().includes('story'));
    const ugcCard = rateCards.find(
      (c) => c.platform.toLowerCase().includes('ugc') || c.format.toLowerCase().includes('ugc')
    );

    const updatedProfile: CreatorProfile = {
      ...creator,
      name: name.trim() || creator.name,
      handle: handle.trim() || creator.handle,
      email: email.trim() || creator.email,
      niche: niche.trim() || creator.niche,
      rateCards,
      rates: {
        tiktokVideo: tiktokCard ? tiktokCard.rate : creator.rates?.tiktokVideo || 1500,
        instagramReel: igCard ? igCard.rate : creator.rates?.instagramReel || 1200,
        youtubeIntegration: ytCard ? ytCard.rate : creator.rates?.youtubeIntegration || 2500,
        storySet: storyCard ? storyCard.rate : creator.rates?.storySet || 600,
        ugcAsset: ugcCard ? ugcCard.rate : creator.rates?.ugcAsset || 800,
      },
      paymentPreferences: {
        preferredMethod,
        paymentLink: paymentLink.trim(),
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        routingNumber: routingNumber.trim(),
        swiftBic: swiftBic.trim(),
        paypalEmail: paypalEmail.trim(),
        customInstructions: customInstructions.trim(),
      },
    };

    onSave(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full border border-[#ECD9CB] shadow-payno-lg space-y-4 text-[#230B0D] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            {/* Typographic Monogram Avatar */}
            <div className="w-11 h-11 rounded-2xl bg-[#59171B] text-[#FED7B8] font-heading font-bold text-base flex items-center justify-center shadow-payno-sm border-2 border-white">
              {initials}
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#230B0D]">
                Creator Settings
              </h3>
              <p className="text-xs text-[#7E635F]">
                Manage rate cards, platform prices & invoice payout details
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-[#FAF3EC] p-1 rounded-2xl border border-[#ECD9CB] text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Plan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'rates'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Rate Cards ({rateCards.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'payments'
                ? 'bg-[#59171B] text-[#FED7B8] shadow-payno-sm'
                : 'text-[#7E635F] hover:text-[#230B0D]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Payout Options</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* TAB 1: Profile & Plan */}
          {activeTab === 'profile' && (
            <div className="space-y-3.5 animate-in fade-in duration-100">
              {/* Membership Plan Banner */}
              <div className="p-3.5 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center shadow-payno-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase tracking-wider block">
                      Active Creator Tier
                    </span>
                    <span className="text-xs font-bold text-[#230B0D]">{planLabel}</span>
                  </div>
                </div>

                {onOpenPricing && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPricing();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5E8DC] border border-[#ECD9CB] text-xs font-bold text-[#59171B] shadow-payno-sm transition-colors cursor-pointer"
                  >
                    Change Plan
                  </button>
                )}
              </div>

              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="w-full text-center px-3 py-2 rounded-xl bg-white hover:bg-[#F5E8DC] border border-[#ECD9CB] text-xs font-bold text-[#7E635F] shadow-payno-sm transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Full Name / Legal Entity Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins Creative Studio"
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Public Social Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. @sarahcreates"
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Contact / Invoicing Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@sarahcreates.com"
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] font-medium outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Creator Niche / Focus
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Beauty, Lifestyle, Tech & Wellness"
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3.5 py-2 text-xs text-[#230B0D] font-medium outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Rate Cards & Platforms */}
          {activeTab === 'rates' && (
            <div className="space-y-3.5 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#230B0D] flex items-center gap-1.5">
                    <span>Platform Deliverable Rates</span>
                  </h4>
                  <p className="text-[11px] text-[#7E635F]">
                    Define default sponsor pricing per platform format.
                  </p>
                </div>
                {!showAddRateForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddRateForm(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Rate Card</span>
                  </button>
                )}
              </div>

              {/* Add New Rate Card Form */}
              {showAddRateForm && (
                <div className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-2">
                    <span className="text-xs font-bold text-[#59171B] flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      Add New Platform Deliverable
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddRateForm(false)}
                      className="text-xs text-[#7E635F] hover:text-[#230B0D] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                        Platform *
                      </label>
                      <select
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] font-medium outline-none cursor-pointer"
                      >
                        <option value="TikTok">TikTok</option>
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Twitter / X">Twitter / X</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="UGC Content">UGC Ad Package</option>
                        <option value="Other">Other / Custom</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                        Deliverable Format *
                      </label>
                      <input
                        type="text"
                        required
                        value={newFormat}
                        onChange={(e) => setNewFormat(e.target.value)}
                        placeholder="e.g. Dedicated Reel, 60s Video..."
                        className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                        Rate ($ USD)
                      </label>
                      <input
                        type="number"
                        required
                        value={newRate}
                        onChange={(e) => setNewRate(Number(e.target.value))}
                        className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#230B0D] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="e.g. 1x in-feed post with tracking link"
                        className="w-full bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddRateForm(false)}
                      className="px-3 py-1.5 border border-[#ECD9CB] text-[#7E635F] text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddRateCard}
                      className="px-4 py-1.5 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold rounded-xl shadow-payno-sm cursor-pointer"
                    >
                      Save Rate Card
                    </button>
                  </div>
                </div>
              )}

              {/* Rate Cards List */}
              <div className="space-y-2">
                {rateCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#FAF3EC] p-3 rounded-2xl border border-[#ECD9CB] flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-[#59171B] px-2 py-0.5 rounded-md border border-[#ECD9CB]">
                          {card.platform}
                        </span>
                        <h5 className="font-heading text-xs font-bold text-[#230B0D]">
                          {card.format}
                        </h5>
                      </div>
                      {card.description && (
                        <p className="text-[10px] text-[#7E635F]">{card.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-[#7E635F]">$</span>
                        <input
                          type="number"
                          value={card.rate}
                          onChange={(e) =>
                            handleUpdateRateCardPrice(card.id, Number(e.target.value))
                          }
                          className="w-20 bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-2 py-1 text-xs font-mono font-bold text-[#230B0D] outline-none"
                        />
                      </div>

                      {rateCards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRateCard(card.id)}
                          className="p-1.5 text-[#7E635F] hover:text-[#B82C3A] rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Invoice Payment Preferences & Instructions */}
          {activeTab === 'payments' && (
            <div className="space-y-3.5 animate-in fade-in duration-100">
              <div className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#59171B]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Invoice Remittance Routing</span>
                </div>
                <p className="text-[11px] text-[#7E635F]">
                  Specify how sponsor partners should remit invoice payments directly to you.
                </p>
              </div>

              {/* Preferred Method Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Payment Remittance Method
                </label>
                <select
                  value={preferredMethod}
                  onChange={(e) =>
                    setPreferredMethod(
                      e.target.value as 'payment_link' | 'bank_transfer' | 'wise' | 'paypal' | 'custom'
                    )
                  }
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] font-semibold outline-none cursor-pointer"
                >
                  <option value="bank_transfer">Direct Bank Wire / ACH Transfer</option>
                  <option value="payment_link">Payment Link (Stripe Payment Link, Wise)</option>
                  <option value="paypal">PayPal Business</option>
                  <option value="custom">Custom Instructions</option>
                </select>
              </div>

              {/* Payment Link Input */}
              {(preferredMethod === 'payment_link' || preferredMethod === 'wise') && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                    Payment URL Link
                  </label>
                  <div className="relative">
                    <Link2 className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7E635F]" />
                    <input
                      type="url"
                      value={paymentLink}
                      onChange={(e) => setPaymentLink(e.target.value)}
                      placeholder="https://buy.stripe.com/..."
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl pl-8 pr-3 py-2 text-xs text-[#230B0D] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Bank Details Inputs */}
              {(preferredMethod === 'bank_transfer' || preferredMethod === 'custom') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Standard Chartered Bank"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Beneficiary Account Name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins Studio"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Account / IBAN
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="••••••••4892"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Routing / SWIFT
                    </label>
                    <input
                      type="text"
                      value={routingNumber || swiftBic}
                      onChange={(e) => {
                        setRoutingNumber(e.target.value);
                        setSwiftBic(e.target.value);
                      }}
                      placeholder="121000358"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] font-mono outline-none"
                    />
                  </div>
                </div>
              )}

              {/* PayPal */}
              {preferredMethod === 'paypal' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                    PayPal Address
                  </label>
                  <input
                    type="text"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="payments@sarahcreates.com"
                    className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none"
                  />
                </div>
              )}

              {/* Custom Instructions */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                  Remittance Notes on Invoices
                </label>
                <textarea
                  rows={2}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Quote invoice number on bank transfer. Settlement terms: 30 days."
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-3 py-2 text-xs text-[#230B0D] outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#F5E8DC] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-[#ECD9CB] text-[#7E635F] hover:text-[#230B0D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-payno-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
