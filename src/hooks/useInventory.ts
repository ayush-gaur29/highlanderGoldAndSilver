import { useState, useEffect, useMemo, useCallback } from 'react';
import { InventoryItem } from '../types';
import { InventoryService } from '../services/inventoryService';

export function useInventory() {
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentSort, setCurrentSort] = useState<string>('lot-asc');

  useEffect(() => {
    let isMounted = true;
    InventoryService.getInventory()
      .then(items => {
        if (isMounted) {
          setAllItems(items);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(allItems.map(i => i.category)));
    return ['all', ...unique];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let result = allItems.filter(item => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const haystack = [
          item.lotNumber,
          item.title,
          item.description,
          item.category,
          item.grade || '',
          item.purity || '',
          item.priceFormatted
        ].join(' ').toLowerCase();

        return haystack.includes(q);
      });
    }

    result.sort((a, b) => {
      switch (currentSort) {
        case 'lot-asc':
          return Number(a.lotNumber) - Number(b.lotNumber);
        case 'lot-desc':
          return Number(b.lotNumber) - Number(a.lotNumber);
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
