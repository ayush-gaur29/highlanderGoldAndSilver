/**
 * Highlander Gold & Silver — Utility Formatters
 */

/**
 * Formats a numeric value into USD currency format ($#,##0.00)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a number with commas and two decimals (e.g., "1,450.00")
 */
export function formatAmountNumber(amount: number): string {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Generates an inquiry mailto link with pre-populated subject and body
 */
export function generateEmailInquiryUrl(
  businessEmail: string,
  item: { lotNumber: string; title: string; priceFormatted: string }
): string {
  const subject = encodeURIComponent(`Inquiry on Lot #${item.lotNumber}: ${item.title}`);
  const body = encodeURIComponent(
    `Hello Highlander Gold & Silver,\n\nI am interested in acquiring Lot #${item.lotNumber} (${item.title}) listed at ${item.priceFormatted}.\n\nPlease let me know availability and settlement arrangements.\n\nThank you!`
  );
  return `mailto:${businessEmail}?subject=${subject}&body=${body}`;
}
