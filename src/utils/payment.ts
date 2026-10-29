/**
 * Highlander Gold & Silver — Payment & Settlement Utilities
 */

export interface SettlementBreakdown {
  baseAmount: number;
  buyersPremium: number;
  totalSettlement: number;
}

/**
 * Calculates settlement amounts with the standard 15% Buyer's Premium
 */
export function calculateSettlement(baseAmount: number, bpRate: number = 0.15): SettlementBreakdown {
  const safeBase = Math.max(0, isNaN(baseAmount) ? 0 : baseAmount);
  const buyersPremium = safeBase * bpRate;
  const totalSettlement = safeBase + buyersPremium;

  return {
    baseAmount: safeBase,
    buyersPremium,
    totalSettlement
  };
}

/**
 * Generates an official PayPal payment URL, optionally appended with the total amount
 */
export function generatePayPalPaymentUrl(basePayPalUrl: string, totalAmount?: number): string {
  if (totalAmount && totalAmount > 0) {
    return `${basePayPalUrl}/${totalAmount.toFixed(2)}`;
  }
  return basePayPalUrl;
}
