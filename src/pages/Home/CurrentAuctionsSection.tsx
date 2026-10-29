import React from 'react';
import { InventoryItem } from '../../types';
import { SectionHeading } from '../../components/common/SectionHeading';
import { CollectionSearchBar } from '../../components/collection/CollectionSearchBar';
import { CollectionSortSelect } from '../../components/collection/CollectionSortSelect';
import { CategoryPills } from '../../components/collection/CategoryPills';
import { ItemCard } from '../../components/collection/ItemCard';
import { Icons } from '../../utils/icons';

export interface CurrentAuctionsSectionProps {
  allItems: InventoryItem[];
  filteredItems: InventoryItem[];
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onInspectItem: (item: InventoryItem) => void;
}

export const CurrentAuctionsSection: React.FC<CurrentAuctionsSectionProps> = ({
  allItems,
  filteredItems,
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  currentSort,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
  onInspectItem
}) => {
  return (
    <section className="section section-light" id="collection">
      <div className="container">
        {/* Collection Heading */}
        <SectionHeading
          align="split"
          eyebrow="Available Inventory"
          title="Precious Metals Collection"
          subtitle="Click any piece to inspect verified high-resolution photographs, technical grading, and instant settlement."
          metaRight={
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--text-tertiary)'
              }}
            >
              BIGFORK, MT REGISTER · REVISED 2026
            </div>
          }
        />

        {/* Toolbar: Search, Filters, and Sorting */}
        <div className="collection-toolbar reveal-on-scroll">
          <div className="toolbar-top-row">
            {/* Search Bar */}
            <CollectionSearchBar
              value={searchQuery}
              onChange={onSearchChange}
              onClear={() => onSearchChange('')}
            />

            {/* Sort Selector */}
            <CollectionSortSelect
              value={currentSort}
              onChange={onSortChange}
            />
          </div>

          {/* Category Pill Filter Row */}
          <CategoryPills
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
            allItems={allItems}
          />

          {/* Filter Feedback Row */}
          <div className="filter-feedback-row">
            <div>
              Showing <span className="active-count-highlight" id="itemsInViewCount">{filteredItems.length}</span> of{' '}
              <span id="totalArchiveCount">{allItems.length}</span> pieces
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="reset-filters-btn"
                id="resetFiltersBtn"
                onClick={onResetFilters}
              >
                <Icons.Refresh size={13} strokeWidth={2} />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* The Collection Grid Container */}
        <div className="item-grid" id="collectionGrid" aria-live="polite">
          {filteredItems.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                border: '1px solid var(--color-silver-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(58, 15, 52, 0.05)',
                  border: '1px solid var(--color-silver)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-aubergine)',
                  marginBottom: '1rem'
                }}
              >
                <Icons.Search size={24} />
              </div>
              <h3
                style={{
                  color: 'var(--color-aubergine)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.4rem',
                  marginBottom: '0.5rem'
                }}
              >
                No Matching Precious Metals Found
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  maxWidth: '440px',
                  margin: '0 auto 1.5rem auto',
                  fontSize: '0.9rem'
                }}
              >
                We couldn't find any inventory matching your search criteria. Try modifying your search term or clearing active filters.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                id="emptyStateResetBtn"
                onClick={onResetFilters}
              >
                <Icons.Refresh size={15} />
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={onInspectItem}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};
