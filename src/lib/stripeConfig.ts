// Paystack & Stripe Payment Links & Billing Configuration
// Create your payment page at: https://dashboard.paystack.com/#/pages or https://dashboard.stripe.com/payment-links

export interface BillingConfig {
  provider: 'paystack' | 'stripe' | 'custom';
  creatorProMonthlyLink: string;
  creatorProAnnualLink: string;
  agencyMonthlyLink: string;
  agencyAnnualLink: string;
  customerPortalLink: string;
}

const BILLING_CONFIG_STORAGE_KEY = 'madeal_billing_config_v2';

export const DEFAULT_BILLING_CONFIG: BillingConfig = {
  provider: 'paystack',
  creatorProMonthlyLink: 'https://paystack.com/pay/madeal-pro-monthly',
  creatorProAnnualLink: 'https://paystack.com/pay/madeal-pro-annual',
  agencyMonthlyLink: 'https://paystack.com/pay/madeal-agency-monthly',
  agencyAnnualLink: 'https://paystack.com/pay/madeal-agency-annual',
  customerPortalLink: 'https://paystack.com',
};

export function getBillingConfig(): BillingConfig {
  try {
    const data = localStorage.getItem(BILLING_CONFIG_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(BILLING_CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_BILLING_CONFIG));
      return DEFAULT_BILLING_CONFIG;
    }
    return { ...DEFAULT_BILLING_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_BILLING_CONFIG;
  }
}

export function saveBillingConfig(config: BillingConfig): void {
  try {
    localStorage.setItem(BILLING_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save billing configuration', e);
  }
}

// Backward-compatibility aliases
export type StripeBillingConfig = BillingConfig;
export const DEFAULT_STRIPE_CONFIG = DEFAULT_BILLING_CONFIG;
export const getStripeBillingConfig = getBillingConfig;
export const saveStripeBillingConfig = saveBillingConfig;
