/**
 * Highlander Gold & Silver — Type Definitions
 * Structured for scalability and clean future Supabase integration.
 */

export type MetalCategory = 'all' | 'Gold' | 'Morgan Dollars' | 'Silver Bullion' | 'Commemorative' | 'Ancient';

export interface InventoryItem {
  id: string;
  lotNumber: string;
  title: string;
  lead?: string;
  description: string;
  category: string;
  metal: string;
  purity?: string;
  grade?: string;
  mintage?: string;
  price: number;
  priceFormatted: string;
  estimateRange?: string;
  paymentNote?: string;
  featuredImage: string;
  additionalImages?: string[];
  isFeatured?: boolean;
  status: 'Available' | 'Unavailable' | 'Pending' | 'Closed';
  statusNote?: string;
}

export interface CartItem {
  item: InventoryItem;
  quantity: number;
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
