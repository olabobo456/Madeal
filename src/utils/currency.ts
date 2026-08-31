export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
};

export const TAX_RATE_PRESETS = [
  { label: '0% (Tax Exempt / Standard US)', value: 0 },
  { label: '5% (Standard Sales Tax)', value: 5 },
  { label: '7.5% (Nigeria / Standard VAT)', value: 7.5 },
  { label: '10% (Australia GST / Canada)', value: 10 },
  { label: '13% (Canada HST)', value: 13 },
  { label: '15% (New Zealand GST / South Africa)', value: 15 },
  { label: '20% (UK / France / Standard EU VAT)', value: 20 },
  { label: '25% (Nordic VAT / Denmark / Sweden)', value: 25 },
];

export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  const normalized = currencyCode.toUpperCase();
  return SUPPORTED_CURRENCIES[normalized]?.symbol || '$';
}

export function formatMoney(amount: number = 0, currencyCode: string = 'USD'): string {
  const normalized = currencyCode.toUpperCase();
  const info = SUPPORTED_CURRENCIES[normalized] || SUPPORTED_CURRENCIES.USD;
  
  try {
    const formattedNum = Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    });
    return `${info.symbol}${formattedNum}`;
  } catch {
    return `${info.symbol}${(amount || 0).toLocaleString()}`;
  }
}

export function calculateDealTotals(
  subtotal: number,
  taxRatePercent: number = 0
): {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
} {
  const cleanSubtotal = Math.max(0, Number(subtotal) || 0);
  const cleanRate = Math.max(0, Number(taxRatePercent) || 0);
  const taxAmount = Math.round((cleanSubtotal * (cleanRate / 100)) * 100) / 100;
  const total = cleanSubtotal + taxAmount;

  return {
    subtotal: cleanSubtotal,
    taxRate: cleanRate,
    taxAmount,
    total,
  };
}
