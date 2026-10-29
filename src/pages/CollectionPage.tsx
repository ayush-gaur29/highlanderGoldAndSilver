import React from 'react';
import { Link } from 'react-router-dom';
import { ItemCard } from '../components/collection/ItemCard';
import { CategoryPills } from '../components/collection/CategoryPills';
import { CollectionSearchBar } from '../components/collection/CollectionSearchBar';
import { CollectionSortSelect } from '../components/collection/CollectionSortSelect';
import { useInventory } from '../hooks/useInventory';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Icons } from '../utils/icons';

export const CollectionPage: React.FC = () => {
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

  useScrollReveal();

  return (
    <main className="collection-page-main">
      {/* Page Header Banner with Right-Side Precious Metals Image */}
      <section className="page-header-banner">
        <div className="container">
          <div className="page-banner-grid">
            <div className="page-banner-content">
              <nav className="page-breadcrumbs" aria-label="Breadcrumb">
                <Link to="/" className="breadcrumb-link">Home</Link>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">Collection</span>
              </nav>

              <h1 className="page-banner-title">Precious Metals Collection</h1>
              <p className="page-banner-desc">
                Explore hand-selected numismatic rarities, certified Morgan dollars, sovereign gold, and fine silver bullion. Every piece features verified strike luster, certified grade accuracy, and the Highlander Sold Value Guarantee.
              </p>

              {/* Quick Stats Strip */}
              <div className="collection-stats-strip">
                <div className="stat-pill">
                  <Icons.ShieldCheck size={14} />
                  <span>0% Montana Sales Tax</span>
                </div>
                <div className="stat-pill">
                  <Icons.Package size={14} />
                  <span>In-House Insured Shipping</span>
                </div>
                <div className="stat-pill">
                  <Icons.Check size={14} />
                  <span>Guaranteed Sold Value</span>
                </div>

              </div>
            </div>

            {/* Right-Side Relevant Image Showcase */}
            <div className="page-banner-media">
              <div className="page-banner-media-box">
                <img
                  src="/assets/brand/highlander_hero_precious_metals.jpg"
                  alt="Highlander Precious Metals Reserve and Certified Bullion"
                  className="page-banner-img"
                  width={1376}
                  height={768}
                  loading="eager"
                />
              </div>
              <div className="page-banner-badge">
                <div className="banner-badge-icon">
                  <Icons.ShieldCheck size={16} />
                </div>
                <span className="banner-badge-text">Vault-Certified Sovereign Coinage &amp; Bullion</span>
                <span className="banner-badge-sub">Bigfork, MT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Content Section */}
      <section className="section section-body" id="collection-grid-section">
        <div className="container">
          {/* Controls Bar: Search & Sort */}
          <div className="collection-controls-bar">
            <div className="controls-search-area">
              <CollectionSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div className="controls-sort-area">
              <CollectionSortSelect
                value={currentSort}
                onChange={setCurrentSort}
              />
            </div>
          </div>

          {/* Category Filters Row */}
          <div className="collection-categories-wrapper" style={{ marginTop: '1.25rem' }}>
            <CategoryPills
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              allItems={allItems}
            />
          </div>

          {/* Results Metadata Bar */}
          <div className="collection-meta-bar">
            <div className="meta-results-count">
              Showing <span className="active-count-highlight">{filteredItems.length}</span> of {allItems.length} available pieces
              {activeCategory !== 'All' && (
                <span className="active-filter-indicator">
                  in <strong>{activeCategory}</strong>
                </span>
              )}
              {searchQuery && (
                <span className="active-filter-indicator">
                  matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={resetFilters}
                aria-label="Reset all search and category filters"
              >
                <Icons.Close size={13} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Product Cards Grid */}
          {filteredItems.length > 0 ? (
            <div className="item-grid" style={{ marginTop: '2rem' }}>
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="collection-empty-box">
              <div className="empty-box-icon">
                <Icons.Search size={32} />
              </div>
              <h3 className="empty-box-title">No Inventory Pieces Match Your Search</h3>
              <p className="empty-box-text">
                Try clearing your search terms or selecting a different category to view available coins and bullion.
              </p>
              <button
                type="button"
                className="btn btn-gold"
                onClick={resetFilters}
                style={{ marginTop: '1.25rem' }}
              >
                <span>View Full Storefront Inventory</span>
                <Icons.ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Guarantee Footer Notice */}
          <div className="collection-footer-guarantee" style={{ marginTop: '4rem' }}>
            <div className="footer-guarantee-inner">
              <div className="guarantee-icon-wrap">
                <Icons.ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="guarantee-inner-title">Highlander Sold Value Guarantee Included with Every Piece</h3>
                <p className="guarantee-inner-text">
                  If at any time a customer proves that a piece purchased from our storefront was overpriced based on its current market state, Highlander Gold &amp; Silver will refund the cost difference, or accept return of the item at its full purchased value. Montana 0% sales tax applies to all orders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CollectionPage;
