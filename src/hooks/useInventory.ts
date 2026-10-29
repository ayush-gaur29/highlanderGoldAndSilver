import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryItem } from '../types';
import { InventoryService } from '../services/inventoryService';

export function useInventory() {
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentSort, setCurrentSort] = useState<string>('lot-asc');

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await InventoryService.getInventory();
      setAllItems(items);
    } catch (err: any) {
      console.error('[useInventory] Error fetching Supabase inventory:', err);
      setError(err?.message || 'Failed to load inventory from Supabase database.');
      setAllItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    // Subscribe to live database updates via Supabase Realtime
    const unsubscribe = InventoryService.subscribeToInventory(() => {
      fetchItems();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchItems]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(allItems.map((i) => i.category).filter(Boolean))
    );
    return ['all', ...unique];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let result = allItems.filter((item) => {
      if (activeCategory !== 'all' && item.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const haystack = [
          item.lotNumber,
          item.sku || '',
          item.title,
          item.lead || '',
          item.description,
          item.category,
          item.metal,
          item.grade || '',
          item.purity || '',
          item.coin_type || '',
          item.denomination || '',
          item.year || '',
          item.cert_company || '',
          item.cert_number || '',
          item.priceFormatted
        ].join(' ').toLowerCase();

        return haystack.includes(q);
      });
    }

    result.sort((a, b) => {
      switch (currentSort) {
        case 'lot-asc': {
          const numA = parseFloat(a.lotNumber);
          const numB = parseFloat(b.lotNumber);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return a.lotNumber.localeCompare(b.lotNumber, undefined, { numeric: true });
        }
        case 'lot-desc': {
          const numA = parseFloat(a.lotNumber);
          const numB = parseFloat(b.lotNumber);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numB - numA;
          }
          return b.lotNumber.localeCompare(a.lotNumber, undefined, { numeric: true });
        }
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [allItems, activeCategory, searchQuery, currentSort]);

  const resetFilters = useCallback(() => {
    setActiveCategory('all');
    setSearchQuery('');
    setCurrentSort('lot-asc');
  }, []);

  const hasActiveFilters = activeCategory !== 'all' || searchQuery.trim().length > 0;

  return {
    allItems,
    filteredItems,
    categories,
    isLoading,
    error,
    refetch: fetchItems,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    currentSort,
    setCurrentSort,
    resetFilters,
    hasActiveFilters
  };
}
