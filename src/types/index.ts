/**
 * Highlander Gold & Silver — Type Definitions
 * Structured for scalability and clean future Supabase integration.
 */

export type MetalCategory = 'all' | 'Gold' | 'Morgan Dollars' | 'Silver Bullion' | 'Commemorative' | 'Ancient';

export interface InventoryItem {
  id: string;
  lotNumber: string;
  lot_number?: string;
  sku?: string;
  title: string;
  lead?: string;
  description: string;
  category: string;
  category_id?: string | null;
  metal: string;
  coin_type?: string;
  year?: string;
  country_mint?: string;
  denomination?: string;
  weight?: string;
  weight_troy_oz?: number;
  purity?: string;
  fineness?: number;
  grade?: string;
  cert_company?: string;
  cert_number?: string;
  special_features?: string;
  mintage?: string;
  price: number;
  priceFormatted: string;
  inventory?: number;
  stock_quantity?: number;
  stock_status?: string;
  storefront_status?: string;
  status: 'Available' | 'Unavailable' | 'Pending' | 'Closed' | string;
  statusNote?: string;
  show_on_storefront?: boolean;
  estimateRange?: string;
  estimate_range?: string;
  paymentNote?: string;
  payment_note?: string;
  featuredImage: string;
  featured_image?: string;
  additionalImages?: string[];
  additional_images?: string[];
  isFeatured?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
}

export interface PastAuctionItem {
  id: string;
  lotNumber: string;
  title: string;
  specs: string[];
  realizedPrice: number;
  realizedPriceFormatted: string;
  statusText: string;
  image: string;
}

export interface BusinessInfo {
  name: string;
  shortName: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneFormatted: string;
  email: string;
  payPalUrl: string;
  coordinates: string;
  terms: {
    buyersPremium: string;
    buyersPremiumPercent: number;
    shipping: string;
    salesTax: string;
    closeTrigger: string;
    hours: string;
  };
}

export interface NavLink {
  label: string;
  href: string;
  sublabel?: string;
  isSecondary?: boolean;
}

export interface StoreHighlight {
  title: string;
  description: string;
  iconName: 'clock' | 'shieldCheck' | 'package' | 'creditCard';
}

export interface PolicyItemData {
  title: string;
  description: string;
  iconName: 'package' | 'creditCard' | 'clock';
}

export interface ContactCardData {
  label: string;
  title: string;
  text: string;
  actionText: string;
  actionHref: string;
  isExternal?: boolean;
  iconName: 'mapPin' | 'phone' | 'mail' | 'creditCard';
  subtext?: string;
}
