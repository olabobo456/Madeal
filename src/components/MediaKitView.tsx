import React, { useState } from 'react';
import {
  CreatorProfile,
  SponsorshipPackage,
  RateCardItem,
  PastBrandShowcase,
  AudienceStats,
  DeliverableItem,
} from '../types';
import { formatMoney, getCurrencySymbol } from '../utils/currency';
import {
  Share2,
  Download,
  CheckCircle2,
  Package,
  Users,
  Eye,
  TrendingUp,
  Globe,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Award,
  X,
  PlusCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface MediaKitViewProps {
  creator: CreatorProfile;
  onUpdateCreator: (updated: CreatorProfile) => void;
  onSelectPackageToBook?: (pkg: SponsorshipPackage) => void;
  isPublicView?: boolean;
}

export const MediaKitView: React.FC<MediaKitViewProps> = ({
  creator,
  onUpdateCreator,
  onSelectPackageToBook,
  isPublicView = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [packageModalState, setPackageModalState] = useState<{
    isOpen: boolean;
    pkgToEdit: SponsorshipPackage | null;
  }>({ isOpen: false, pkgToEdit: null });
  const [rateModalState, setRateModalState] = useState<{
    isOpen: boolean;
    rateToEdit: RateCardItem | null;
  }>({ isOpen: false, rateToEdit: null });
  const [brandModalState, setBrandModalState] = useState<{
    isOpen: boolean;
    brandToEdit: PastBrandShowcase | null;
  }>({ isOpen: false, brandToEdit: null });

  // Fallbacks
  const currency = creator.defaultCurrency || 'USD';
  const audience: AudienceStats = creator.audienceStats || {
    totalFollowers: '0',
    avgEngagementRate: '0%',
    monthlyImpressions: '0',
    topDemographic: 'General Audience',
    topCountry: 'Global',
    femaleRatio: 50,
  };

  const packages = creator.packages || [];
  const rateCards = creator.rateCards || [];
  const pastBrands = creator.pastBrands || [];

  // Generate public link
  const mediaKitUrl = `${window.location.origin}${window.location.pathname}?mediakit=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mediaKitUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- STATS EDIT FORM STATE ---
  const [statsForm, setStatsForm] = useState<AudienceStats>(audience);
  const handleOpenStatsModal = () => {
    setStatsForm(creator.audienceStats || {
      totalFollowers: '0',
      avgEngagementRate: '0%',
      monthlyImpressions: '0',
      topDemographic: 'General Audience',
      topCountry: 'Global',
      femaleRatio: 50,
    });
    setIsStatsModalOpen(true);
  };

  const handleSaveStats = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCreator({
      ...creator,
      audienceStats: statsForm,
    });
    setIsStatsModalOpen(false);
  };

  // --- BIO / IDENTITY EDIT FORM STATE ---
  const [bioForm, setBioForm] = useState({
    name: creator.name,
    handle: creator.handle,
    niche: creator.niche,
    location: creator.location || '',
    bio: creator.bio || '',
  });

  const handleOpenBioModal = () => {
    setBioForm({
      name: creator.name,
      handle: creator.handle,
      niche: creator.niche,
      location: creator.location || '',
      bio: creator.bio || '',
    });
    setIsBioModalOpen(true);
  };

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCreator({
      ...creator,
      name: bioForm.name.trim() || 'Creator',
      handle: bioForm.handle.trim() || 'creator',
      niche: bioForm.niche.trim() || 'Content Creator',
      location: bioForm.location.trim(),
      bio: bioForm.bio.trim(),
    });
    setIsBioModalOpen(false);
  };

  // --- PACKAGE CREATE / EDIT FORM STATE ---
  const [packageForm, setPackageForm] = useState<Omit<SponsorshipPackage, 'id'> & { id?: string }>({
    name: '',
    badge: 'Campaign Bundle',
    description: '',
    price: 1500,
    currency: currency,
    usageTerm: '90 Days Paid Ads',
    exclusivity: '30 Days',
    revisions: 2,
    deliverables: [
      {
        type: 'tiktok',
        title: 'Dedicated Video',
        quantity: 1,
        baseRate: 1500,
        description: 'High-res organic integration with bio link',
      },
    ],
  });

  const handleOpenPackageModal = (pkg?: SponsorshipPackage) => {
    if (pkg) {
      setPackageForm(pkg);
      setPackageModalState({ isOpen: true, pkgToEdit: pkg });
    } else {
      setPackageForm({
        name: '',
        badge: 'Most Popular',
        description: '',
        price: 2500,
        currency: currency,
        usageTerm: '90 Days Paid Ads',
        exclusivity: '30 Days',
        revisions: 2,
        deliverables: [
          {
            type: 'tiktok',
            title: '1x Dedicated TikTok Video',
            quantity: 1,
            baseRate: 1500,
            description: 'Organic video integration',
          },
        ],
      });
      setPackageModalState({ isOpen: true, pkgToEdit: null });
    }
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.name.trim()) return;

    let updatedPackages: SponsorshipPackage[];
    if (packageModalState.pkgToEdit) {
      updatedPackages = packages.map((p) =>
        p.id === packageModalState.pkgToEdit?.id
          ? ({ ...packageForm, id: p.id } as SponsorshipPackage)
          : p
      );
    } else {
      const newPkg: SponsorshipPackage = {
        ...packageForm,
        id: 'pkg-' + Date.now(),
      } as SponsorshipPackage;
      updatedPackages = [...packages, newPkg];
    }

    onUpdateCreator({
      ...creator,
      packages: updatedPackages,
    });
    setPackageModalState({ isOpen: false, pkgToEdit: null });
  };

  const handleDeletePackage = (pkgId: string) => {
    const updatedPackages = packages.filter((p) => p.id !== pkgId);
    onUpdateCreator({
      ...creator,
      packages: updatedPackages,
    });
  };

  // --- RATE CARD CREATE / EDIT FORM STATE ---
  const [rateForm, setRateForm] = useState<Omit<RateCardItem, 'id'> & { id?: string }>({
    platform: 'Instagram',
    format: 'Reel & Carousel Post',
    rate: 1000,
    description: 'High-res deliverable with 30-day organic usage',
  });

  const handleOpenRateModal = (rateItem?: RateCardItem) => {
    if (rateItem) {
      setRateForm(rateItem);
      setRateModalState({ isOpen: true, rateToEdit: rateItem });
    } else {
      setRateForm({
        platform: 'TikTok',
        format: 'Dedicated Video (60s)',
        rate: 800,
        description: 'Standard organic deliverable with caption tag',
      });
      setRateModalState({ isOpen: true, rateToEdit: null });
    }
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateForm.format.trim()) return;

    let updatedRates: RateCardItem[];
    if (rateModalState.rateToEdit) {
      updatedRates = rateCards.map((r) =>
        r.id === rateModalState.rateToEdit?.id ? ({ ...rateForm, id: r.id } as RateCardItem) : r
      );
    } else {
      const newRate: RateCardItem = {
        ...rateForm,
        id: 'rate-' + Date.now(),
      } as RateCardItem;
      updatedRates = [...rateCards, newRate];
    }

    onUpdateCreator({
      ...creator,
      rateCards: updatedRates,
    });
    setRateModalState({ isOpen: false, rateToEdit: null });
  };

  const handleDeleteRate = (rateId: string) => {
    const updatedRates = rateCards.filter((r) => r.id !== rateId);
    onUpdateCreator({
      ...creator,
      rateCards: updatedRates,
    });
  };

  // --- PAST BRAND CREATE / EDIT FORM STATE ---
  const [brandForm, setBrandForm] = useState<Omit<PastBrandShowcase, 'id'> & { id?: string }>({
    name: '',
    category: 'Beauty & Lifestyle',
    metric: '500K+ Views • 6.8% CTR',
    year: new Date().getFullYear().toString(),
  });

  const handleOpenBrandModal = (brandItem?: PastBrandShowcase) => {
    if (brandItem) {
      setBrandForm(brandItem);
      setBrandModalState({ isOpen: true, brandToEdit: brandItem });
    } else {
      setBrandForm({
        name: '',
        category: 'Fashion & Retail',
        metric: '350K Views • High Conversion',
        year: new Date().getFullYear().toString(),
      });
      setBrandModalState({ isOpen: true, brandToEdit: null });
    }
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return;

    let updatedBrands: PastBrandShowcase[];
    if (brandModalState.brandToEdit) {
      updatedBrands = pastBrands.map((b) =>
        b.id === brandModalState.brandToEdit?.id
          ? ({ ...brandForm, id: b.id } as PastBrandShowcase)
          : b
      );
    } else {
      const newBrand: PastBrandShowcase = {
        ...brandForm,
        id: 'pb-' + Date.now(),
      } as PastBrandShowcase;
      updatedBrands = [...pastBrands, newBrand];
    }

    onUpdateCreator({
      ...creator,
      pastBrands: updatedBrands,
    });
    setBrandModalState({ isOpen: false, brandToEdit: null });
  };

  const handleDeleteBrand = (brandId: string) => {
    const updatedBrands = pastBrands.filter((b) => b.id !== brandId);
    onUpdateCreator({
      ...creator,
      pastBrands: updatedBrands,
    });
  };

  const handleExportMediaKitPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header Banner
    doc.setFillColor(89, 23, 27); // #59171B
    doc.roundedRect(14, 12, 182, 32, 4, 4, 'F');

    doc.setTextColor(254, 215, 184); // #FED7B8
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(creator.name || 'Creator', 22, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${creator.handle || 'creator'}  •  ${creator.niche || 'Creator'}`, 22, 34);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('OFFICIAL MEDIA KIT & RATE CARD', 186, 26, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Contact: ${creator.email || 'direct'}`, 186, 34, { align: 'right' });

    let y = 52;

    // Audience & Reach Matrix
    doc.setTextColor(89, 23, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. AUDIENCE DEMOGRAPHICS & ENGAGEMENT METRICS', 14, y);

    y += 6;
    doc.setFillColor(250, 243, 236);
    doc.roundedRect(14, y, 182, 22, 3, 3, 'F');

    doc.setTextColor(35, 11, 13);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(audience.totalFollowers || '0', 24, y + 9);
    doc.text(audience.avgEngagementRate || '0%', 74, y + 9);
    doc.text(audience.monthlyImpressions || '0', 124, y + 9);
    doc.text((audience.topDemographic || 'General').split(' ')[0], 164, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(126, 99, 95);
    doc.text('Total Cross-Platform Reach', 24, y + 16);
    doc.text('Avg Engagement Rate', 74, y + 16);
    doc.text('Monthly Impressions', 124, y + 16);
    doc.text('Top Demographic', 164, y + 16);

    y += 30;

    // Packages Section
    if (packages.length > 0) {
      doc.setTextColor(89, 23, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. FEATURED SPONSORSHIP PACKAGES', 14, y);

      y += 6;

      packages.forEach((pkg) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(236, 217, 203);
        doc.roundedRect(14, y, 182, 20, 2, 2, 'FD');

        doc.setTextColor(89, 23, 27);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(pkg.name, 18, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`${formatMoney(pkg.price, pkg.currency || currency)}`, 190, y + 6, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(126, 99, 95);
        doc.text((pkg.description || '').substring(0, 90) + '...', 18, y + 12);
        doc.text(
          `Usage: ${pkg.usageTerm || 'Standard'}  •  Exclusivity: ${pkg.exclusivity || 'None'}  •  Revisions: ${pkg.revisions || 1}`,
          18,
          y + 16
        );

        y += 24;
      });

      y += 4;
    }

    // Deliverable Rates
    if (rateCards.length > 0) {
      doc.setTextColor(89, 23, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('3. ITEMIZED DELIVERABLE RATE CARD', 14, y);

      y += 6;
      doc.setFillColor(250, 243, 236);
      doc.rect(14, y, 182, 7, 'F');
      doc.setTextColor(89, 23, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('PLATFORM & DELIVERABLE FORMAT', 18, y + 4.5);
      doc.text('DESCRIPTION / SCOPE', 80, y + 4.5);
      doc.text(`BASE RATE (${currency})`, 190, y + 4.5, { align: 'right' });

      y += 8;

      rateCards.slice(0, 6).forEach((item) => {
        doc.setTextColor(35, 11, 13);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${item.platform} - ${item.format}`, 18, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(126, 99, 95);
        doc.text((item.description || 'Standard organic deliverable').substring(0, 55), 80, y + 4);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(89, 23, 27);
        doc.text(formatMoney(item.rate, currency), 190, y + 4, { align: 'right' });

        doc.setDrawColor(236, 217, 203);
        doc.line(14, y + 7, 196, y + 7);
        y += 9;
      });
    }

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 114, 109);
    doc.text(
      `Madeal Creator Ecosystem • Official Media Kit for ${creator.name} • Direct Inquiries: ${creator.email || 'Contact Creator'}`,
      105,
      286,
      { align: 'center' }
    );

    doc.save(`MediaKit_${(creator.name || 'Creator').replace(/\s+/g, '_')}_RateCard.pdf`);
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#ECD9CB] shadow-payno-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center font-heading text-2xl font-bold shrink-0 shadow-payno-sm">
            {(creator.name || 'C').charAt(0)}
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
              PUBLIC RATE CARD & MEDIA KIT
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#230B0D] mt-0.5">
              {creator.name || 'Creator Profile'}
            </h1>
            <p className="text-xs text-[#7E635F] mt-0.5">
              {creator.handle} • {creator.niche} {creator.location ? `• ${creator.location}` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          {!isPublicView && (
            <button
              type="button"
              onClick={handleOpenBioModal}
              className="h-10 px-4 rounded-xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-[#59171B] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-payno-sm flex-1 sm:flex-initial"
              title="Edit Profile Bio, Niche & Location"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Bio</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="h-10 px-4 rounded-xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-[#59171B] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-payno-sm flex-1 sm:flex-initial"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMediaKitPDF}
            className="h-10 px-4 sm:px-5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95 flex-1 sm:flex-initial"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Rate Card</span>
          </button>
        </div>
      </div>

      {/* Bio Paragraph */}
      {creator.bio ? (
        <div className="bg-[#FAF3EC] rounded-2xl p-4 border border-[#ECD9CB] text-xs text-[#230B0D] leading-relaxed shadow-payno-xs relative group">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[#59171B] uppercase tracking-wider text-[10px]">
              CREATOR BIO & CONTENT PHILOSOPHY
            </span>
            {!isPublicView && (
              <button
                type="button"
                onClick={handleOpenBioModal}
                className="text-[11px] font-semibold text-[#59171B] hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}
          </div>
          {creator.bio}
        </div>
      ) : (
        !isPublicView && (
          <div
            onClick={handleOpenBioModal}
            className="bg-[#FAF3EC]/60 border border-dashed border-[#ECD9CB] hover:border-[#59171B] rounded-2xl p-4 text-xs text-[#7E635F] text-center cursor-pointer transition-all hover:bg-[#FAF3EC]"
          >
            <span className="font-semibold text-[#59171B]">+ Add Creator Bio & Content Philosophy</span>
            <p className="text-[11px] mt-0.5">Introduce your audience focus, brand voice, and content strengths.</p>
          </div>
        )
      )}

      {/* Audience Statistics Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
            AUDIENCE INSIGHTS & ENGAGEMENT METRICS
          </span>
          {!isPublicView && (
            <button
              type="button"
              onClick={handleOpenStatsModal}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-[#59171B] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Metrics</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Total Reach</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1 flex items-center gap-1">
              <Users className="w-4 h-4 text-[#59171B]" />
              <span>{audience.totalFollowers || '0'}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">Cross-Platform</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Engagement</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{audience.avgEngagementRate || '0%'}</span>
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">Avg Engagement</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Impressions</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1 flex items-center gap-1">
              <Eye className="w-4 h-4 text-[#59171B]" />
              <span>{audience.monthlyImpressions || '0'}</span>
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">Monthly Organic</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Demographics</span>
            <div className="font-heading text-base font-bold text-[#230B0D] mt-1 truncate">
              {audience.topDemographic || 'General Audience'}
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">Core Age Bracket</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Top Territory</span>
            <div className="font-heading text-base font-bold text-[#230B0D] mt-1 flex items-center gap-1 truncate">
              <Globe className="w-4 h-4 text-[#59171B] shrink-0" />
              <span className="truncate">{audience.topCountry || 'Global'}</span>
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">Primary Market</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Gender Split</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1">
              {audience.femaleRatio ?? 50}% Female
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">
              {100 - (audience.femaleRatio ?? 50)}% Male
            </span>
          </div>
        </div>
      </div>

      {/* Featured Sponsorship Packages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
              CURATED PACKAGES & BUNDLES
            </span>
            <h2 className="font-heading text-xl font-bold text-[#230B0D]">
              High-Impact Partnership Bundles
            </h2>
          </div>
          {!isPublicView && (
            <button
              type="button"
              onClick={() => handleOpenPackageModal()}
              className="px-3 py-1.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Package</span>
            </button>
          )}
        </div>

        {packages.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-[#ECD9CB] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EC] text-[#59171B] flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#230B0D]">No Bundled Packages Created Yet</h3>
            <p className="text-xs text-[#7E635F] max-w-md mx-auto">
              Create multi-deliverable partnership bundles (e.g. TikTok + Reel + Story pack) with bundled pricing and clear licensing terms.
            </p>
            {!isPublicView && (
              <button
                type="button"
                onClick={() => handleOpenPackageModal()}
                className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Package</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl p-5 border border-[#ECD9CB] shadow-payno-sm flex flex-col justify-between hover:border-[#59171B]/40 transition-all relative group h-full"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB]">
                      {pkg.badge || 'Campaign Bundle'}
                    </span>
                    <span className="font-heading text-2xl font-bold text-[#59171B]">
                      {formatMoney(pkg.price, pkg.currency || currency)}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-[#230B0D] leading-snug">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#7E635F] mt-1 leading-relaxed">
                    {pkg.description}
                  </p>

                  {/* Deliverables list */}
                  <div className="mt-4 pt-3 border-t border-[#ECD9CB] space-y-2">
                    <span className="text-[10px] font-bold text-[#7E635F] uppercase block">
                      Included Deliverables:
                    </span>
                    {pkg.deliverables?.map((del, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-[#230B0D]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-semibold">{del.quantity}x</strong> {del.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Terms bullets */}
                  <div className="mt-3 bg-[#FAF3EC] rounded-xl p-2.5 text-[11px] text-[#7E635F] space-y-1 mt-auto">
                    <div>• <strong>Licensing:</strong> {pkg.usageTerm || 'Standard'}</div>
                    <div>• <strong>Exclusivity:</strong> {pkg.exclusivity || 'None'}</div>
                    <div>• <strong>Revisions:</strong> {pkg.revisions || 1} rounds</div>
                  </div>
                </div>

                {/* Bottom Actions - Aligned across cards */}
                <div className="pt-4 mt-4 border-t border-[#ECD9CB] space-y-2">
                  {!isPublicView && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPackageModal(pkg)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#59171B] hover:bg-[#FAF3EC] border border-[#ECD9CB] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {onSelectPackageToBook && (
                    <button
                      type="button"
                      onClick={() => onSelectPackageToBook(pkg)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all text-center cursor-pointer shadow-payno-sm active:scale-95"
                    >
                      Draft Agreement with This Package
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Deliverable Rate Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
              INDIVIDUAL DELIVERABLE & SERVICE RATES
            </span>
            <h2 className="font-heading text-xl font-bold text-[#230B0D]">
              Deliverable & Service Rate Card
            </h2>
          </div>
          {!isPublicView && (
            <button
              type="button"
              onClick={() => handleOpenRateModal()}
              className="px-3 py-1.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rate</span>
            </button>
          )}
        </div>

        {rateCards.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-[#ECD9CB] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EC] text-[#59171B] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#230B0D]">No Individual Rates Listed Yet</h3>
            <p className="text-xs text-[#7E635F] max-w-md mx-auto">
              Define standard individual rates for single TikTok videos, Instagram Reels, YouTube sponsorships, video editing, or consultation.
            </p>
            {!isPublicView && (
              <button
                type="button"
                onClick={() => handleOpenRateModal()}
                className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rate Item</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#ECD9CB] shadow-payno-sm overflow-hidden">
            <div className="divide-y divide-[#ECD9CB]">
              {rateCards.map((rate) => (
                <div
                  key={rate.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF3EC]/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF3EC] text-[#59171B] border border-[#ECD9CB]">
                        {rate.platform}
                      </span>
                      <h4 className="font-heading text-sm font-bold text-[#230B0D]">
                        {rate.format}
                      </h4>
                    </div>
                    <p className="text-xs text-[#7E635F]">
                      {rate.description || 'Includes standard production, organic distribution, and audience engagement.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="font-heading text-lg font-bold text-[#59171B]">
                      {formatMoney(rate.rate, currency)}
                    </span>
                    {!isPublicView && (
                      <div className="flex items-center gap-1 pl-2 border-l border-[#ECD9CB]">
                        <button
                          type="button"
                          onClick={() => handleOpenRateModal(rate)}
                          className="p-1 text-[#7E635F] hover:text-[#59171B] rounded-lg transition-colors cursor-pointer"
                          title="Edit Rate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRate(rate.id)}
                          className="p-1 text-[#7E635F] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Rate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Past Collaborations Showcase */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
              PORTFOLIO & TRACK RECORD
            </span>
            <h2 className="font-heading text-xl font-bold text-[#230B0D]">
              Past Collaborations
            </h2>
          </div>
          {!isPublicView && (
            <button
              type="button"
              onClick={() => handleOpenBrandModal()}
              className="px-3 py-1.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Collaboration</span>
            </button>
          )}
        </div>

        {pastBrands.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-[#ECD9CB] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EC] text-[#59171B] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-base font-bold text-[#230B0D]">No Collaborations Listed Yet</h3>
            <p className="text-xs text-[#7E635F] max-w-md mx-auto">
              Highlight reputable clients, brands, or partners you have worked with and key performance metrics (views, CTR, sales conversion).
            </p>
            {!isPublicView && (
              <button
                type="button"
                onClick={() => handleOpenBrandModal()}
                className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Past Collaboration</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pastBrands.map((pb) => (
              <div
                key={pb.id}
                className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#59171B]">
                    <Award className="w-3.5 h-3.5 text-[#59171B]" />
                    <span>{pb.name}</span>
                  </div>
                  {!isPublicView && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenBrandModal(pb)}
                        className="p-1 text-[#7E635F] hover:text-[#59171B] rounded transition-colors cursor-pointer"
                        title="Edit Collaboration"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(pb.id)}
                        className="p-1 text-[#7E635F] hover:text-red-600 rounded transition-colors cursor-pointer"
                        title="Delete Collaboration"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#7E635F]">
                  <span>{pb.category}</span>
                  {pb.year && <span>{pb.year}</span>}
                </div>

                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  {pb.metric}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL: EDIT AUDIENCE STATS ================= */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#ECD9CB] shadow-payno-lg space-y-5">
            <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#59171B] uppercase tracking-wider">Metrics Editor</span>
                <h3 className="font-heading text-lg font-bold text-[#230B0D]">Edit Audience Insights</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStatsModalOpen(false)}
                className="p-2 rounded-xl text-[#7E635F] hover:bg-[#FAF3EC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStats} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Total Reach</label>
                  <input
                    type="text"
                    required
                    value={statsForm.totalFollowers}
                    onChange={(e) => setStatsForm({ ...statsForm, totalFollowers: e.target.value })}
                    placeholder="e.g. 50,000 or 120K+"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Avg Engagement Rate</label>
                  <input
                    type="text"
                    required
                    value={statsForm.avgEngagementRate}
                    onChange={(e) => setStatsForm({ ...statsForm, avgEngagementRate: e.target.value })}
                    placeholder="e.g. 4.8%"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Monthly Impressions</label>
                  <input
                    type="text"
                    required
                    value={statsForm.monthlyImpressions}
                    onChange={(e) => setStatsForm({ ...statsForm, monthlyImpressions: e.target.value })}
                    placeholder="e.g. 850K or 1.2M"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Top Demographic</label>
                  <input
                    type="text"
                    required
                    value={statsForm.topDemographic}
                    onChange={(e) => setStatsForm({ ...statsForm, topDemographic: e.target.value })}
                    placeholder="e.g. Ages 21–34 (70%)"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Top Territory / Country</label>
                  <input
                    type="text"
                    required
                    value={statsForm.topCountry}
                    onChange={(e) => setStatsForm({ ...statsForm, topCountry: e.target.value })}
                    placeholder="e.g. United States & UK"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Female Ratio (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={statsForm.femaleRatio}
                    onChange={(e) => setStatsForm({ ...statsForm, femaleRatio: Number(e.target.value) || 0 })}
                    placeholder="65"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECD9CB]">
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:bg-[#FAF3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold shadow-payno-sm"
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BIO / IDENTITY ================= */}
      {isBioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#ECD9CB] shadow-payno-lg space-y-5">
            <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#59171B] uppercase tracking-wider">Identity & Profile</span>
                <h3 className="font-heading text-lg font-bold text-[#230B0D]">Edit Bio & Creator Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBioModalOpen(false)}
                className="p-2 rounded-xl text-[#7E635F] hover:bg-[#FAF3EC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBio} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Display Name</label>
                  <input
                    type="text"
                    required
                    value={bioForm.name}
                    onChange={(e) => setBioForm({ ...bioForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Social Handle</label>
                  <input
                    type="text"
                    required
                    value={bioForm.handle}
                    onChange={(e) => setBioForm({ ...bioForm, handle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Niche / Category</label>
                  <input
                    type="text"
                    required
                    value={bioForm.niche}
                    onChange={(e) => setBioForm({ ...bioForm, niche: e.target.value })}
                    placeholder="e.g. Beauty, Tech, Gaming, Lifestyle"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Location / Base</label>
                  <input
                    type="text"
                    value={bioForm.location}
                    onChange={(e) => setBioForm({ ...bioForm, location: e.target.value })}
                    placeholder="e.g. London, UK / Los Angeles, CA"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Creator Bio & Content Strengths</label>
                <textarea
                  rows={3}
                  value={bioForm.bio}
                  onChange={(e) => setBioForm({ ...bioForm, bio: e.target.value })}
                  placeholder="Describe your content format, audience trust, conversion history..."
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECD9CB]">
                <button
                  type="button"
                  onClick={() => setIsBioModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:bg-[#FAF3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold shadow-payno-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PACKAGE ================= */}
      {packageModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#ECD9CB] shadow-payno-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#59171B] uppercase tracking-wider">Package Builder</span>
                <h3 className="font-heading text-lg font-bold text-[#230B0D]">
                  {packageModalState.pkgToEdit ? 'Edit Sponsorship Package' : 'Create New Sponsorship Package'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPackageModalState({ isOpen: false, pkgToEdit: null })}
                className="p-2 rounded-xl text-[#7E635F] hover:bg-[#FAF3EC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Package Title</label>
                  <input
                    type="text"
                    required
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    placeholder="e.g. Omnichannel Launch Sprint"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Badge Label</label>
                  <input
                    type="text"
                    value={packageForm.badge}
                    onChange={(e) => setPackageForm({ ...packageForm, badge: e.target.value })}
                    placeholder="e.g. Most Popular, Best Value"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Bundle Price ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Paid Ad Usage Term</label>
                  <input
                    type="text"
                    value={packageForm.usageTerm}
                    onChange={(e) => setPackageForm({ ...packageForm, usageTerm: e.target.value })}
                    placeholder="e.g. 90 Days Paid Ads"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Exclusivity Term</label>
                  <input
                    type="text"
                    value={packageForm.exclusivity}
                    onChange={(e) => setPackageForm({ ...packageForm, exclusivity: e.target.value })}
                    placeholder="e.g. 30 Days Category"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Included Revisions</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={packageForm.revisions}
                    onChange={(e) => setPackageForm({ ...packageForm, revisions: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Package Description</label>
                <textarea
                  rows={2}
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="Full scope explanation and expectations..."
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                />
              </div>

              {/* Deliverable Items in Package */}
              <div className="space-y-2 pt-2 border-t border-[#ECD9CB]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#230B0D]">Included Deliverables</label>
                  <button
                    type="button"
                    onClick={() => {
                      setPackageForm({
                        ...packageForm,
                        deliverables: [
                          ...(packageForm.deliverables || []),
                          {
                            type: 'instagram',
                            title: '1x Instagram Reel',
                            quantity: 1,
                            baseRate: 500,
                            description: 'High-res reel deliverable',
                          },
                        ],
                      });
                    }}
                    className="text-xs font-bold text-[#59171B] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {packageForm.deliverables?.map((del, idx) => (
                    <div key={idx} className="p-2.5 bg-[#FAF3EC] rounded-xl border border-[#ECD9CB] space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={del.title}
                          onChange={(e) => {
                            const copy = [...packageForm.deliverables];
                            copy[idx].title = e.target.value;
                            setPackageForm({ ...packageForm, deliverables: copy });
                          }}
                          placeholder="Deliverable title"
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#ECD9CB] bg-white text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = packageForm.deliverables.filter((_, i) => i !== idx);
                            setPackageForm({ ...packageForm, deliverables: copy });
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECD9CB]">
                <button
                  type="button"
                  onClick={() => setPackageModalState({ isOpen: false, pkgToEdit: null })}
                  className="px-4 py-2 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:bg-[#FAF3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold shadow-payno-sm"
                >
                  {packageModalState.pkgToEdit ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT RATE CARD ================= */}
      {rateModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#ECD9CB] shadow-payno-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#59171B] uppercase tracking-wider">Rate Card Item</span>
                <h3 className="font-heading text-lg font-bold text-[#230B0D]">
                  {rateModalState.rateToEdit ? 'Edit Rate Item' : 'Add Rate Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRateModalState({ isOpen: false, rateToEdit: null })}
                className="p-2 rounded-xl text-[#7E635F] hover:bg-[#FAF3EC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Platform / Category</label>
                <select
                  value={rateForm.platform}
                  onChange={(e) => setRateForm({ ...rateForm, platform: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs bg-white focus:outline-none focus:border-[#59171B]"
                >
                  <option value="Video Editing / Post-Production">Video Editing / Post-Production</option>
                  <option value="Creative Services / Production">Creative Services / Production</option>
                  <option value="Consulting / Strategy">Consulting / Strategy</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X / Twitter">X / Twitter</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="UGC">Raw UGC Asset</option>
                  <option value="Custom Service">Other / Custom Service</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Format / Deliverable Title</label>
                <input
                  type="text"
                  required
                  value={rateForm.format}
                  onChange={(e) => setRateForm({ ...rateForm, format: e.target.value })}
                  placeholder="e.g. 60s Dedicated Video, Story Frame Set"
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Base Rate ({currency})</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={rateForm.rate}
                  onChange={(e) => setRateForm({ ...rateForm, rate: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Description & Scope</label>
                <textarea
                  rows={2}
                  value={rateForm.description}
                  onChange={(e) => setRateForm({ ...rateForm, description: e.target.value })}
                  placeholder="e.g. Includes standard production and 30-day organic usage..."
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECD9CB]">
                <button
                  type="button"
                  onClick={() => setRateModalState({ isOpen: false, rateToEdit: null })}
                  className="px-4 py-2 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:bg-[#FAF3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold shadow-payno-sm"
                >
                  {rateModalState.rateToEdit ? 'Save Rate' : 'Add Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PAST COLLABORATION ================= */}
      {brandModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#ECD9CB] shadow-payno-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#ECD9CB] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#59171B] uppercase tracking-wider">Collaboration Showcase</span>
                <h3 className="font-heading text-lg font-bold text-[#230B0D]">
                  {brandModalState.brandToEdit ? 'Edit Collaboration' : 'Add Collaboration'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBrandModalState({ isOpen: false, brandToEdit: null })}
                className="p-2 rounded-xl text-[#7E635F] hover:bg-[#FAF3EC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Client / Brand Name</label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="e.g. Nike, Sephora, Notion, Creator Studio"
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Category / Niche</label>
                  <input
                    type="text"
                    required
                    value={brandForm.category}
                    onChange={(e) => setBrandForm({ ...brandForm, category: e.target.value })}
                    placeholder="e.g. Beauty & Wellness"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#230B0D]">Year</label>
                  <input
                    type="text"
                    value={brandForm.year}
                    onChange={(e) => setBrandForm({ ...brandForm, year: e.target.value })}
                    placeholder="e.g. 2024"
                    className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#230B0D]">Campaign Metric / Highlight</label>
                <input
                  type="text"
                  required
                  value={brandForm.metric}
                  onChange={(e) => setBrandForm({ ...brandForm, metric: e.target.value })}
                  placeholder="e.g. 450K Views • 8.4% CTR"
                  className="w-full px-3 py-2 rounded-xl border border-[#ECD9CB] text-xs focus:outline-none focus:border-[#59171B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECD9CB]">
                <button
                  type="button"
                  onClick={() => setBrandModalState({ isOpen: false, brandToEdit: null })}
                  className="px-4 py-2 rounded-xl border border-[#ECD9CB] text-xs font-semibold text-[#7E635F] hover:bg-[#FAF3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold shadow-payno-sm"
                >
                  {brandModalState.brandToEdit ? 'Save Collaboration' : 'Add Collaboration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
