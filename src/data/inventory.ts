import { InventoryItem } from '../types';

/**
 * DEPRECATED: Hardcoded inventory items have been removed.
 * All inventory items are now dynamically fetched from the live Supabase `inventory` table
 * via `InventoryService` in `src/services/inventoryService.ts`.
 */
export const INVENTORY_ITEMS: InventoryItem[] = [];
