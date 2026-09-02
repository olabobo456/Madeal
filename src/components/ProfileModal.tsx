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
  const [email, setEmail] = useState(creator.email || '');
  const [niche, setNiche] = useState(creator.niche);
  const [bio, setBio] = useState(creator.bio || '');
  const [location, setLocation] = useState(creator.location || '');
  const [defaultCurrency, setDefaultCurrency] = useState(creator.defaultCurrency || 'USD');
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(creator.defaultTaxRate || 0);
  const [taxId, setTaxId] = useState(creator.taxId || '');

  // Dynamic Rate Cards State
  const initialRateCards: RateCardItem[] =
    creator.rateCards && creator.rateCards.length > 0
      ? creator.rateCards
      : [
          {
            id: 'rate-1',
            platform: 'TikTok',
            format: '60s Dedicated Video',
            rate: creator.rates?.tiktokVideo || 1500,
            description: 'Full 60s product feature with link-in-bio anchor',
          },
          {
            id: 'rate-2',
            platform: 'Instagram',
            format: 'Reel + 3x Story Frame',
            rate: creator.rates?.instagramReel || 1200,
            description: 'High-production 9:16 vertical video & swipe-up stickers',
          },
          {
            id: 'rate-3',
            platform: 'YouTube',
            format: '60s Mid-Roll Integration',
            rate: creator.rates?.youtubeIntegration || 2500,
            description: 'Dedicated branded segment in long-form video',
          },
          {
            id: 'rate-4',
            platform: 'Instagram',
            format: 'Story Set (3 Frames)',
            rate: creator.rates?.storySet || 600,
            description: 'Interactive poll/link story sequence',
          },
          {
            id: 'rate-5',
            platform: 'UGC Content',
            format: 'Ad Creative (No Post)',
            rate: creator.rates?.ugcAsset || 800,
            description: 'Raw high-res asset for brand paid acquisition channels',
          },
        ];

  const [rateCards, setRateCards] = useState<RateCardItem[]>(initialRateCards);

  // New Rate Card Form in Rate Tab
  const [showAddRateForm, setShowAddRateForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState('TikTok');
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

  const initials = (creator.name || 'C')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const planLabel =
    creator.plan === 'agency'
      ? 'Agency Studio ($19/mo)'
      : creator.plan === 'starter'
      ? 'Creator Pro ($7/mo)'
      : 'Free Plan ($0/mo)';

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

    // Map top rates back to traditional rates object for backwards compatibility
    const tiktokCard = rateCards.find((c) => c.platform.toLowerCase().includes('tiktok'));
    const igCard = rateCards.find(
      (c) =>
        c.platform.toLowerCase().includes('instagram') &&
        !c.format.toLowerCase().includes('story')
    );
    const ytCard = rateCards.find((c) => c.platform.toLowerCase().includes('youtube'));
    const storyCard = rateCards.find((c) => c.format.toLowerCase().includes('story'));
    const ugcCard = rateCards.find(
      (c) => c.platform.toLowerCase().includes('ugc') || c.format.toLowerCase().includes('ugc')
    );

    const updatedProfile: CreatorProfile = {
      ...creator,
      name,
      handle,
      email,
      niche,
      bio,
      location,
      defaultCurrency,
      defaultTaxRate: Number(defaultTaxRate) || 0,
      taxId,
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
        paymentLink,
        bankName,
        accountName,
        accountNumber,
        routingNumber,
        swiftBic,
        paypalEmail,
        customInstructions,
      },
    };

    onSave(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-[#ECD9CB] shadow-payno-lg space-y-5 text-[#230B0D] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5E8DC] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Monogram Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-[#59171B] text-[#FED7B8] font-heading font-bold text-lg flex items-center justify-center shadow-payno-sm border-2 border-white">
              {initials}
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-[#230B0D]">Creator Profile</h3>
              <p className="text-xs text-[#7E635F]">Manage identity, rates, & payment accounts</p>
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
            <span>Profile</span>
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
            <span>Rates ({rateCards.length})</span>
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
            <span>Payout Details</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Membership Plan Banner */}
              <div className="p-3.5 rounded-2xl bg-[#FAF3EC] border border-[#ECD9CB] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center">
                    <Building className="w-4 h-4" />
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
                    Upgrade / Manage
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                      Creator / Business Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                      Social Handle
                    </label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                    Contact & Invoicing Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@business.com"
                    className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                      Primary Niche
                    </label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Tech, Fashion, Gaming..."
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Los Angeles, CA"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                    Bio / Pitch Statement
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short bio for your public media kit..."
                    className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none resize-none"
                  />
                </div>

                {/* Currency & Tax Defaults */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Default Currency
                    </label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-3 py-2.5 text-xs text-[#230B0D] font-semibold outline-none cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (CA$)</option>
                      <option value="AUD">AUD (AU$)</option>
                      <option value="NGN">NGN (₦)</option>
                      <option value="ZAR">ZAR (R)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={defaultTaxRate}
                      onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-3.5 py-2.5 text-xs text-[#230B0D] outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                      Tax ID / VAT (Opt)
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="VAT Number"
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-3.5 py-2.5 text-xs text-[#230B0D] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Rate Cards & Platforms */}
          {activeTab === 'rates' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#230B0D]">Platform Deliverable Rates</h4>
                  <p className="text-[11px] text-[#7E635F]">
                    Define default sponsor pricing per deliverable format.
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
                <div className="bg-[#FAF3EC] p-4 rounded-2xl border border-[#ECD9CB] space-y-3 animate-in fade-in duration-150">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <option value="Podcast">Podcast Shoutout</option>
                        <option value="Newsletter">Newsletter Feature</option>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-[#7E635F] uppercase tracking-wider">
                        Rate ({defaultCurrency})
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
              <div className="space-y-2.5">
                {rateCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] flex items-center justify-between gap-3 group"
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
                        <span className="text-xs font-bold text-[#7E635F]">{defaultCurrency}</span>
                        <input
                          type="number"
                          value={card.rate}
                          onChange={(e) =>
                            handleUpdateRateCardPrice(card.id, Number(e.target.value))
                          }
                          className="w-20 bg-white border border-[#ECD9CB] focus:border-[#59171B] rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-[#230B0D] outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveRateCard(card.id)}
                        className="p-1.5 text-[#7E635F] hover:text-[#B82C3A] rounded-lg transition-colors cursor-pointer"
                        title="Remove rate card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Invoice Payment Preferences & Instructions */}
          {activeTab === 'payments' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-[#FAF3EC] p-3.5 rounded-2xl border border-[#ECD9CB] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#59171B]">
                  <Building className="w-4 h-4" />
                  <span>Invoice Remittance Routing</span>
                </div>
                <p className="text-[11px] text-[#7E635F]">
                  Specify how sponsor partners should remit invoice payments directly to you.
                </p>
              </div>

              {/* Preferred Method Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                  Payment Remittance Method
                </label>
                <select
                  value={preferredMethod}
                  onChange={(e) =>
                    setPreferredMethod(
                      e.target.value as 'payment_link' | 'bank_transfer' | 'wise' | 'paypal' | 'custom'
                    )
                  }
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] font-semibold outline-none cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                    Payment URL Link
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-[#7E635F]" />
                    <input
                      type="url"
                      value={paymentLink}
                      onChange={(e) => setPaymentLink(e.target.value)}
                      placeholder="https://buy.stripe.com/..."
                      className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#230B0D] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Bank Details Inputs */}
              {(preferredMethod === 'bank_transfer' || preferredMethod === 'custom') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. Chase, Standard Chartered, Barclays"
                        className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                        Beneficiary Account Name
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins Studio"
                        className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                        Account Number / IBAN
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="••••••••4892"
                        className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] font-mono outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                        Routing / SWIFT / Sort Code
                      </label>
                      <input
                        type="text"
                        value={routingNumber || swiftBic}
                        onChange={(e) => {
                          setRoutingNumber(e.target.value);
                          setSwiftBic(e.target.value);
                        }}
                        placeholder="121000358"
                        className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal */}
              {preferredMethod === 'paypal' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                    PayPal Address
                  </label>
                  <input
                    type="text"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="payments@sarahcreates.com"
                    className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none"
                  />
                </div>
              )}

              {/* Custom Instructions */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#7E635F] uppercase tracking-wider">
                  Remittance Notes on Invoices
                </label>
                <textarea
                  rows={2}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Quote invoice number on bank transfer. Settlement terms: 30 days."
                  className="w-full bg-[#FAF3EC] border border-[#ECD9CB] focus:border-[#59171B] rounded-2xl px-4 py-2.5 text-xs text-[#230B0D] outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#F5E8DC] shrink-0">
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="py-2.5 px-4 border border-[#ECD9CB] text-rose-700 hover:bg-rose-50 rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 border border-[#ECD9CB] text-[#7E635F] hover:text-[#230B0D] rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-payno-sm flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
