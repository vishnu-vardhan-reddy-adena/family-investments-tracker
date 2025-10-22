/**
 * Format number as Indian currency (₹)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number as Indian currency without symbol
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Calculate profit/loss
 */
export function calculateProfitLoss(
  quantity: number,
  purchasePrice: number,
  currentPrice: number
): { amount: number; percentage: number } {
  const invested = quantity * purchasePrice;
  const current = quantity * currentPrice;
  const amount = current - invested;
  const percentage = (amount / invested) * 100 || 0;

  return { amount, percentage };
}

/**
 * Format date to Indian locale
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Get color class based on value (positive/negative)
 */
export function getChangeColorClass(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}
