import { Deal, CreatorProfile } from '../types';

export function getStoredDeals(creatorId?: string): Deal[] {
  if (!creatorId) return [];
  try {
    const data = localStorage.getItem(`madeal_deals_${creatorId}`);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveStoredDeals(deals: Deal[], creatorId?: string): void {
  if (!creatorId) return;
  try {
    localStorage.setItem(`madeal_deals_${creatorId}`, JSON.stringify(deals));
  } catch (e) {
    console.error('Failed to save deals to localStorage', e);
  }
}

export function getStoredProfile(
  creatorId?: string,
  fallbackUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null }
): CreatorProfile {
  const defaultBlank: CreatorProfile = {
    name: fallbackUser?.displayName || 'Creator',
    handle: (fallbackUser?.displayName || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '') || 'creator',
    email: fallbackUser?.email || '',
    avatarUrl: fallbackUser?.photoURL || undefined,
    niche: 'Content Creator',
    bio: '',
    location: '',
    totalEarnings: 0,
    monthlyGrowthPercent: 0,
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    plan: 'free',
    emailAlerts: {
      onCountersign: true,
      onPaymentReceived: true,
      onDeliverableSubmitted: true,
      onOverdueReminder: true,
      notificationEmail: fallbackUser?.email || '',
    },
    audienceStats: {
      totalFollowers: '0',
      avgEngagementRate: '0%',
      monthlyImpressions: '0',
      topDemographic: 'General Audience',
      topCountry: 'Global',
      femaleRatio: 50,
    },
    pastBrands: [],
    packages: [],
  };

  if (!creatorId) return defaultBlank;

  try {
    const data = localStorage.getItem(`madeal_profile_${creatorId}`);
    if (!data) return defaultBlank;
    return JSON.parse(data);
  } catch {
    return defaultBlank;
  }
}

export function saveStoredProfile(profile: CreatorProfile, creatorId?: string): void {
  if (!creatorId) return;
  try {
    localStorage.setItem(`madeal_profile_${creatorId}`, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}
