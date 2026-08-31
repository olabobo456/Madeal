export type DealStatus = 'draft' | 'pending_signature' | 'active' | 'paid' | 'overdue';

export interface DeliverableItem {
  id: string;
  type: 'tiktok' | 'instagram' | 'youtube' | 'ugc' | 'story' | 'custom' | 'newsletter' | 'podcast';
  title: string;
  description: string;
  baseRate: number;
  quantity: number;
  completed?: boolean;
  completedAt?: string;
  deliveredUrl?: string;
}

export interface CommunicationMessage {
  id: string;
  sender: 'creator' | 'brand' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  attachment?: {
    type: 'contract' | 'invoice' | 'deliverable_link';
    title: string;
    url?: string;
  };
}

export interface Deal {
  id: string;
  creatorId: string;
  title: string;
  brandName: string;
  creatorHandle: string;
  creatorEmail: string;
  clientEmail: string;
  status: DealStatus;
  createdAt: string;
  dueDate: string;
  deliverables: DeliverableItem[];
  exclusivity: string;
  usageTerm: string;
  revisions: number;
  lateFeePercent: number;
  totalAmount: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  currency?: string;
  invoiceNumber: string;
  signature?: string;
  signedAt?: string;
  clientSigned: boolean;
  notes?: string;
  messages: CommunicationMessage[];
  paymentMethodUsed?: string;
  paidAt?: string;
  paymentTransactionId?: string;
}

export interface RateCardItem {
  id: string;
  platform: string; // e.g. 'TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter / X', 'Newsletter', 'Podcast', etc.
  format: string;   // e.g. 'Sponsored Video', 'Reel', 'Dedicated Post', 'Story Set', 'Banner Ad'
  rate: number;
  description?: string;
}

export interface SponsorshipPackage {
  id: string;
  name: string;
  badge?: string;
  description: string;
  price: number;
  currency?: string;
  deliverables: {
    type: DeliverableItem['type'];
    title: string;
    quantity: number;
    baseRate: number;
    description: string;
  }[];
  usageTerm: string;
  exclusivity: string;
  revisions: number;
}

export interface PastBrandShowcase {
  id: string;
  name: string;
  category: string;
  metric: string;
  year?: string;
}

export interface AudienceStats {
  totalFollowers: string;
  avgEngagementRate: string;
  monthlyImpressions: string;
  topDemographic: string;
  topCountry: string;
  femaleRatio: number;
}

export type SubscriptionPlan = 'free' | 'starter' | 'agency';

export interface EmailAlertPreferences {
  onCountersign: boolean;
  onPaymentReceived: boolean;
  onDeliverableSubmitted: boolean;
  onOverdueReminder: boolean;
  notificationEmail: string;
}

export interface EmailAlertItem {
  id: string;
  type: 'countersign' | 'payment_received' | 'overdue_reminder' | 'deliverable_submitted';
  title: string;
  message: string;
  dealId: string;
  brandName: string;
  invoiceNumber: string;
  recipientEmail: string;
  timestamp: string;
  read: boolean;
  emailSubject: string;
  emailBody: string;
}

export interface CreatorProfile {
  name: string;
  handle: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  niche: string;
  totalEarnings: number;
  monthlyGrowthPercent: number;
  defaultCurrency?: string;
  taxId?: string;
  defaultTaxRate?: number;
  plan?: SubscriptionPlan;
  emailAlerts?: EmailAlertPreferences;
  rateCards?: RateCardItem[];
  packages?: SponsorshipPackage[];
  pastBrands?: PastBrandShowcase[];
  audienceStats?: AudienceStats;
  rates?: {
    tiktokVideo?: number;
    instagramReel?: number;
    youtubeIntegration?: number;
    storySet?: number;
    ugcAsset?: number;
  };
  paymentPreferences?: {
    preferredMethod: 'payment_link' | 'bank_transfer' | 'wise' | 'paypal' | 'custom';
    paymentLink?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftBic?: string;
    paypalEmail?: string;
    customInstructions?: string;
  };
}

