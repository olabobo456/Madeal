import { Deal, CreatorProfile } from '../types';

export const initialCreatorProfile: CreatorProfile = {
  name: 'Creator',
  handle: 'creator',
  email: '',
  bio: '',
  location: '',
  niche: 'Content Creator',
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
    notificationEmail: '',
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
  rateCards: [],
};

export const initialDeals: Deal[] = [];
