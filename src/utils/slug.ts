import { InventoryItem } from '../types';

/**
 * Creates an SEO-friendly URL slug from a product title.
 * e.g. "1876 George T. Morgan Proposed $100 Gold Union™" -> "1876-george-t-morgan-proposed-100-gold-union"
 */
export function createProductSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[™®©]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Gets the full route URL path for a product detail page.
 */
export function getProductPath(item: InventoryItem): string {
  const slug = createProductSlug(item.title);
  return `/collection/${slug}`;
}

/**
 * Finds a product from an inventory list by slug, item ID, lot number, or SKU.
 */
export function findProductBySlug(
  slugOrId: string | undefined,
  items: InventoryItem[] = []
): InventoryItem | undefined {
  if (!slugOrId || !Array.isArray(items)) return undefined;
  const normalized = decodeURIComponent(slugOrId).toLowerCase().trim();

  return items.find((item) => {
    const slug = createProductSlug(item.title);
    return (
      slug === normalized ||
      item.id.toLowerCase() === normalized ||
      item.lotNumber.toLowerCase() === normalized ||
      (item.sku && item.sku.toLowerCase() === normalized) ||
      item.id.toLowerCase() === `item-${normalized}`
    );
  });
}
