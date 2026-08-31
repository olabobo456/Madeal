import React, { useState } from 'react';
import { CreatorProfile, SponsorshipPackage, RateCardItem } from '../types';
import { formatMoney, getCurrencySymbol } from '../utils/currency';
import {
  Share2,
  Download,
  CheckCircle2,
  Sparkles,
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
  Award
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
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);

  // Default fallbacks if fields undefined
  const currency = creator.defaultCurrency || 'USD';
  const sym = getCurrencySymbol(currency);
  const audience = creator.audienceStats || {
    totalFollowers: '485,000+',
    avgEngagementRate: '5.8%',
    monthlyImpressions: '2.4M',
    topDemographic: 'Ages 21–34 (72%)',
    topCountry: 'United States (58%) & UK (24%)',
    femaleRatio: 68,
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
    doc.text(creator.name, 22, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${creator.handle}  •  ${creator.niche}`, 22, 34);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('OFFICIAL MEDIA KIT & RATE CARD', 186, 26, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Contact: ${creator.email}`, 186, 34, { align: 'right' });

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
    doc.text(audience.totalFollowers, 24, y + 9);
    doc.text(audience.avgEngagementRate, 74, y + 9);
    doc.text(audience.monthlyImpressions, 124, y + 9);
    doc.text(audience.topDemographic.split(' ')[0], 164, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(126, 99, 95);
    doc.text('Total Cross-Platform Reach', 24, y + 16);
    doc.text('Avg Engagement Rate', 74, y + 16);
    doc.text('Monthly Impressions', 124, y + 16);
    doc.text('Top Demographic', 164, y + 16);

    y += 30;

    // Packages Section
    doc.setTextColor(89, 23, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('2. FEATURED SPONSORSHIP PACKAGES', 14, y);

    y += 6;

    packages.forEach((pkg, index) => {
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
      doc.text(pkg.description.substring(0, 90) + '...', 18, y + 12);
      doc.text(`Usage: ${pkg.usageTerm}  •  Exclusivity: ${pkg.exclusivity}  •  Revisions: ${pkg.revisions}`, 18, y + 16);

      y += 24;
    });

    y += 4;

    // A La Carte Deliverable Rates
    doc.setTextColor(89, 23, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. ITEM-SPECIFIC RATE CARD (A LA CARTE)', 14, y);

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

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 114, 109);
    doc.text(
      `Madeal Creator Ecosystem • Official Media Kit for ${creator.name} • Direct Inquiries: ${creator.email}`,
      105,
      286,
      { align: 'center' }
    );

    doc.save(`MediaKit_${creator.name.replace(/\s+/g, '_')}_RateCard.pdf`);
  };

  return (
    <div className="space-y-6 pb-32">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#ECD9CB] shadow-payno-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#59171B] text-[#FED7B8] flex items-center justify-center font-heading text-2xl font-bold shrink-0 shadow-payno-sm">
            {creator.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase">
                PUBLIC RATE CARD & MEDIA KIT
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Verified Creator
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#230B0D] mt-0.5">
              {creator.name}
            </h1>
            <p className="text-xs text-[#7E635F] mt-0.5">
              {creator.handle} • {creator.niche} {creator.location ? `• ${creator.location}` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF3EC] border border-[#ECD9CB] text-[#59171B] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMediaKitPDF}
            className="px-4 py-2.5 rounded-xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Rate Card PDF</span>
          </button>
        </div>
      </div>

      {/* Bio Paragraph */}
      {creator.bio && (
        <div className="bg-[#FAF3EC] rounded-2xl p-4 border border-[#ECD9CB] text-xs text-[#230B0D] leading-relaxed shadow-payno-xs">
          <span className="font-bold text-[#59171B] block mb-1 uppercase tracking-wider text-[10px]">
            CREATOR BIO & CONTENT PHILOSOPHY
          </span>
          {creator.bio}
        </div>
      )}

      {/* Audience Statistics Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
            AUDIENCE INSIGHTS & ENGAGEMENT METRICS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Total Reach</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1 flex items-center gap-1">
              <Users className="w-4 h-4 text-[#59171B]" />
              <span>{audience.totalFollowers}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">+14% MoM</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Engagement</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{audience.avgEngagementRate}</span>
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">2.4x Niche Avg</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Impressions</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1 flex items-center gap-1">
              <Eye className="w-4 h-4 text-[#59171B]" />
              <span>{audience.monthlyImpressions}</span>
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">Monthly Organic</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Demographics</span>
            <div className="font-heading text-base font-bold text-[#230B0D] mt-1">
              {audience.topDemographic}
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">Prime Purchasing</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Top Territory</span>
            <div className="font-heading text-base font-bold text-[#230B0D] mt-1 flex items-center gap-1">
              <Globe className="w-4 h-4 text-[#59171B]" />
              <span>US & UK</span>
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">82% English Tier-1</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm">
            <span className="text-[10px] font-bold text-[#7E635F] uppercase block">Gender Split</span>
            <div className="font-heading text-xl font-bold text-[#230B0D] mt-1">
              {audience.femaleRatio}% Female
            </div>
            <span className="text-[10px] text-[#7E635F] block mt-1">32% Male Audience</span>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl p-5 border border-[#ECD9CB] shadow-payno-sm flex flex-col justify-between hover:border-[#59171B]/40 transition-all space-y-4"
            >
              <div>
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
                  {pkg.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-[#230B0D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold">{del.quantity}x</strong> {del.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Terms bullets */}
                <div className="mt-3 bg-[#FAF3EC] rounded-xl p-2.5 text-[11px] text-[#7E635F] space-y-1">
                  <div>• <strong>Licensing:</strong> {pkg.usageTerm}</div>
                  <div>• <strong>Exclusivity:</strong> {pkg.exclusivity}</div>
                  <div>• <strong>Revisions:</strong> {pkg.revisions} rounds</div>
                </div>
              </div>

              {onSelectPackageToBook && (
                <button
                  type="button"
                  onClick={() => onSelectPackageToBook(pkg)}
                  className="w-full py-2.5 rounded-2xl bg-[#59171B] hover:bg-[#451014] text-[#FED7B8] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-payno-sm active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Draft Agreement with This Package</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* A La Carte Deliverable Rate Card */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block">
              A LA CARTE PRODUCTION RATES
            </span>
            <h2 className="font-heading text-xl font-bold text-[#230B0D]">
              Individual Deliverable Rate Card
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECD9CB] shadow-payno-sm overflow-hidden">
          <div className="divide-y divide-[#ECD9CB]">
            {rateCards.map((rate) => (
              <div
                key={rate.id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF3EC]/50 transition-colors"
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

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="font-heading text-lg font-bold text-[#59171B]">
                    {formatMoney(rate.rate, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past Brand Partnerships Showcase */}
      {pastBrands.length > 0 && (
        <div>
          <span className="text-[11px] font-bold tracking-[0.18em] text-[#59171B] uppercase block mb-3">
            VERIFIED BRAND TRACK RECORD
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pastBrands.map((pb) => (
              <div
                key={pb.id}
                className="bg-white rounded-2xl p-4 border border-[#ECD9CB] shadow-payno-sm space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#59171B]">
                  <Award className="w-3.5 h-3.5 text-[#59171B]" />
                  <span>{pb.name}</span>
                </div>
                <span className="text-[10px] text-[#7E635F] block">{pb.category}</span>
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 mt-2">
                  {pb.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
