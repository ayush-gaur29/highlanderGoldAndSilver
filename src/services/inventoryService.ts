import { InventoryItem, PastAuctionItem } from '../types';
import { PAST_AUCTIONS } from '../data/pastAuctions';
import { supabase, resolveImageUrl } from './supabase';

/**
 * Formats a numeric price into a USD currency string.
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined || isNaN(Number(price))) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(price));
}

/**
 * Maps a raw Supabase inventory database row to the frontend InventoryItem interface.
 * Handles both snake_case database columns and camelCase UI fields accurately.
 */
export function mapDbRowToInventoryItem(row: any): InventoryItem {
  if (!row) {
    throw new Error('Cannot map empty row to InventoryItem');
  }

  const rawLot = row.lot_number ?? row.lotNumber ?? row.sku ?? row.id ?? '';
  const lot = String(rawLot).trim();
  const rawPrice = typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0;

  const featuredImage = resolveImageUrl(row.featured_image ?? row.featuredImage);
  const rawAdditional = row.additional_images ?? row.additionalImages;
  let parsedAdditional: string[] = [];

  if (Array.isArray(rawAdditional)) {
    parsedAdditional = rawAdditional;
  } else if (typeof rawAdditional === 'string' && rawAdditional.trim().startsWith('[')) {
    try {
      parsedAdditional = JSON.parse(rawAdditional);
    } catch {
      parsedAdditional = [rawAdditional];
    }
  } else if (typeof rawAdditional === 'string' && rawAdditional.trim()) {
    parsedAdditional = rawAdditional.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const resolvedAdditional = parsedAdditional
    .map((img: any) => (typeof img === 'string' ? resolveImageUrl(img) : ''))
    .filter(Boolean);

  // Combine featuredImage and additional images ensuring unique, ordered list
  const combinedImages = [featuredImage, ...resolvedAdditional].filter(
    (img, idx, arr) => img && arr.indexOf(img) === idx
  );

  const additionalImages = combinedImages.length > 0 ? combinedImages : [featuredImage];

  const status = row.status || 'Available';
  const isUnavailable =
    status === 'Unavailable' ||
    status === 'Closed' ||
    row.stock_status === 'Out of Stock' ||
    (typeof row.stock_quantity === 'number' && row.stock_quantity <= 0);

  return {
    id: String(row.id || `item-${lot}`),
    lotNumber: lot,
    lot_number: lot,
    sku: row.sku || undefined,
    title: row.title || 'Untitled Coin / Specimen',
    lead: row.lead || undefined,
    description: row.description || '',
    category: row.category || 'Precious Metals',
    category_id: row.category_id || null,
    metal: row.metal || 'Precious Metal',
    coin_type: row.coin_type || undefined,
    year: row.year ? String(row.year) : undefined,
    country_mint: row.country_mint || undefined,
    denomination: row.denomination || undefined,
    weight: row.weight || undefined,
    weight_troy_oz: typeof row.weight_troy_oz === 'number' ? row.weight_troy_oz : undefined,
    purity: row.purity || undefined,
    fineness: typeof row.fineness === 'number' ? row.fineness : undefined,
    grade: row.grade || undefined,
    cert_company: row.cert_company || undefined,
    cert_number: row.cert_number || undefined,
    special_features: row.special_features || undefined,
    mintage: row.mintage || undefined,
    price: rawPrice,
    priceFormatted: formatPrice(rawPrice),
    inventory: typeof row.inventory === 'number' ? row.inventory : undefined,
    stock_quantity: typeof row.stock_quantity === 'number' ? row.stock_quantity : undefined,
    stock_status: row.stock_status || (isUnavailable ? 'Out of Stock' : 'In Stock'),
    storefront_status: row.storefront_status || 'Active',
    status: isUnavailable ? 'Unavailable' : status,
    statusNote: row.statusNote || (isUnavailable ? 'Out of Stock' : undefined),
    show_on_storefront: row.show_on_storefront !== false,
    estimateRange: row.estimate_range || row.estimateRange || undefined,
    estimate_range: row.estimate_range || row.estimateRange || undefined,
    paymentNote: row.payment_note || row.paymentNote || undefined,
    payment_note: row.payment_note || row.paymentNote || undefined,
    featuredImage,
    featured_image: featuredImage,
    additionalImages,
    additional_images: additionalImages,
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    is_featured: Boolean(row.is_featured ?? row.isFeatured),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Highlander Gold & Silver — Supabase Live Inventory Service
 *
 * Exclusively driven by the Supabase database.
 * No hardcoded, mock, or fake inventory records are used.
 */
export class InventoryService {
  /**
   * Fetches all inventory records directly from Supabase.
   */
  static async getInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('lot_number', { ascending: true });

    if (error) {
      console.error('[InventoryService] Supabase fetch error:', error);
      throw new Error(`Failed to fetch inventory from Supabase: ${error.message}`);
    }

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(mapDbRowToInventoryItem);
  }

  /**
   * Fetches a single item by id, lot number, or SKU from Supabase.
   */
  static async getItemById(idOrLot: string): Promise<InventoryItem | null> {
    const normalized = idOrLot.trim();

    // First try querying directly by exact ID, lot_number, or sku
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .or(`id.eq."${normalized}",lot_number.eq."${normalized}",sku.eq."${normalized}"`)
      .limit(1);

    if (!error && data && data.length > 0) {
      return mapDbRowToInventoryItem(data[0]);
    }

    // Fallback: fetch all active inventory and match via slug / loose match
    const all = await this.getInventory();
    const found = all.find((item) => {
      const slug = item.title
        .toLowerCase()
        .replace(/[™®©]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      return (
        item.id === normalized ||
        item.lotNumber === normalized ||
        item.sku === normalized ||
        slug === normalized.toLowerCase()
      );
    });

    return found || null;
  }

  /**
   * Fetches distinct categories dynamically from the inventory table.
   */
  static async getCategories(): Promise<string[]> {
    const items = await this.getInventory();
    const distinct = Array.from(
      new Set(items.map((i) => i.category).filter(Boolean))
    );
    return ['all', ...distinct];
  }

  /**
   * Subscribes to real-time changes on the inventory table.
   */
  static subscribeToInventory(onChange: () => void): () => void {
    const channel = supabase
      .channel('public:inventory:collection_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Fetches past closed/realized auctions
   */
  static async getPastAuctions(): Promise<PastAuctionItem[]> {
    return Promise.resolve([...PAST_AUCTIONS]);
  }
}
