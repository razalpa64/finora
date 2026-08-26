// Currency formatting and utility service

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateToInr: number;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToInr: 83.5 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToInr: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToInr: 91.2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToInr: 107.8 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToInr: 0.55 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToInr: 61.4 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToInr: 54.8 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToInr: 62.1 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToInr: 22.7 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToInr: 94.5 },
};

export function formatMoney(amount: number | null | undefined, currencyCode = 'USD'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '—';
  }
  
  const curr = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);

  // Format with standard thousand separators
  let formatted = '';
  if (currencyCode === 'INR') {
    // Indian numbering format (lakhs, crores)
    formatted = absVal.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  } else {
    // International standard format (thousands, millions)
    formatted = absVal.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  const sign = isNegative ? '− ' : '';
  return `${sign}${curr.symbol}${formatted}`;
}

export const formatCurrency = formatMoney;

export function formatCompactMoney(amount: number, currencyCode = 'USD'): string {
  const curr = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  
  let formatted = '';
  if (currencyCode === 'INR') {
    if (abs >= 10000000) {
      formatted = (abs / 10000000).toFixed(2) + ' Cr';
    } else if (abs >= 100000) {
      formatted = (abs / 100000).toFixed(2) + ' L';
    } else if (abs >= 1000) {
      formatted = (abs / 1000).toFixed(1) + 'k';
    } else {
      formatted = abs.toFixed(0);
    }
  } else {
    if (abs >= 1000000000) {
      formatted = (abs / 1000000000).toFixed(2) + 'B';
    } else if (abs >= 1000000) {
      formatted = (abs / 1000000).toFixed(2) + 'M';
    } else if (abs >= 1000) {
      formatted = (abs / 1000).toFixed(1) + 'k';
    } else {
      formatted = abs.toFixed(0);
    }
  }

  return `${isNegative ? '− ' : ''}${curr.symbol}${formatted}`;
}
