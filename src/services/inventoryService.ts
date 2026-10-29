import { InventoryItem, PastAuctionItem } from '../types';
import { INVENTORY_ITEMS } from '../data/inventory';
import { PAST_AUCTIONS } from '../data/pastAuctions';

/**
 * Highlander Gold & Silver — Inventory & Auction Data Service
 * 
 * Provides an asynchronous abstraction layer over static and database sources.
 * Prepared for plug-and-play integration with Supabase client (e.g. supabase.from('inventory').select('*')).
 */
export class InventoryService {
  /**
   * Fetches all active inventory items
   */
  static async getInventory(): Promise<InventoryItem[]> {
    // Simulated async fetch to ensure architecture accommodates async network/Supabase queries
    return Promise.resolve([...INVENTORY_ITEMS]);
  }

  /**
   * Fetches a single item by id or lot number
   */
  static async getItemById(idOrLot: string): Promise<InventoryItem | null> {
    const item = INVENTORY_ITEMS.find(
      i => i.id === idOrLot || i.lotNumber === idOrLot
    );
    return Promise.resolve(item ? { ...item } : null);
  }

  /**
   * Fetches past closed/realized auctions
   */
  static async getPastAuctions(): Promise<PastAuctionItem[]> {
    return Promise.resolve([...PAST_AUCTIONS]);
  }

  /**
   * Returns list of unique metal / collection categories
   */
  static async getCategories(): Promise<string[]> {
    const categories = Array.from(new Set(INVENTORY_ITEMS.map(i => i.category)));
    return Promise.resolve(['all', ...categories]);
  }
}
