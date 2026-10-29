import React, { useState } from 'react';
import { HeroSection } from './Home/HeroSection';
import { CollectionSection } from './Home/CollectionSection';
import { AboutSection } from './Home/AboutSection';
import { ContactSection } from './Home/ContactSection';
import { ItemModal } from '../components/common/ItemModal';
import { useInventory } from '../hooks/useInventory';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { InventoryItem } from '../types';

export const HomePage: React.FC = () => {
  const {
    allItems,
    filteredItems,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    currentSort,
    setCurrentSort,
    resetFilters,
    hasActiveFilters
  } = useInventory();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Setup smooth scroll reveal observer
  useScrollReveal();

  const handleInspectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main>
      {/* 1. Hero Section (Home) */}
      <HeroSection />

      {/* 2. Collection Section (Collection) */}
      <CollectionSection
        allItems={allItems}
        filteredItems={filteredItems}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentSort={currentSort}
        onSortChange={setCurrentSort}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        onInspectItem={handleInspectItem}
      />

      {/* 3. About Section (About) */}
      <AboutSection />

      {/* 4. Contact Section (Contact) */}
      <ContactSection />

      {/* Item Detail Modal */}
      <ItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
};

export default HomePage;
