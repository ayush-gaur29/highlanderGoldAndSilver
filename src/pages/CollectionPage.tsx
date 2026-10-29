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
    isLoading,
    error,
    refetch,
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
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== '/assets/brand/highlander_refined_emblem.jpg') {
                      target.src = '/assets/brand/highlander_refined_emblem.jpg';
                    }
                  }}
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
              {isLoading ? (
                <span>Accessing live Supabase inventory...</span>
              ) : error ? (
                <span style={{ color: '#DC2626' }}>Database connection interrupted</span>
              ) : (
                <>
                  Showing <span className="active-count-highlight">{filteredItems.length}</span> of {allItems.length} available pieces
                  {activeCategory.toLowerCase() !== 'all' && (
                    <span className="active-filter-indicator">
                      in <strong>{activeCategory}</strong>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="active-filter-indicator">
                      matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
                    </span>
                  )}
                </>
              )}
            </div>

            {hasActiveFilters && !isLoading && !error && (
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

          {/* Content States: Loading, Error, Empty, or Grid */}
          {isLoading ? (
            <div className="collection-loading-container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
              <div
                style={{
                  margin: '0 auto 1.5rem',
                  width: '44px',
                  height: '44px',
                  border: '3px solid rgba(184, 150, 87, 0.2)',
                  borderTopColor: '#B89657',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-navy-dark, #1B2A4A)', marginBottom: '0.35rem' }}>
                Connecting to Highlander Vault Catalog
              </h3>
              <p style={{ color: 'var(--text-secondary, #6B7280)', fontSize: '0.875rem' }}>
                Fetching certified numismatic rarities and bullion from Supabase...
              </p>
            </div>
          ) : error ? (
            <div
              className="collection-error-box"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                marginTop: '2rem'
              }}
            >
              <div style={{ color: '#DC2626', marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                <Icons.AlertCircle size={36} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#991B1B', marginBottom: '0.5rem' }}>
                Unable to Load Storefront Inventory
              </h3>
              <p style={{ color: '#7F1D1D', maxWidth: '520px', margin: '0 auto 1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {error}
              </p>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => refetch()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Icons.Refresh size={15} />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : allItems.length === 0 ? (
            <div className="collection-empty-box" style={{ marginTop: '2rem' }}>
              <div className="empty-box-icon">
                <Icons.Package size={36} />
              </div>
              <h3 className="empty-box-title">No Inventory Currently Listed</h3>
              <p className="empty-box-text">
                Our active catalog in Bigfork, Montana is currently being updated. Please check back shortly or contact our storefront directly.
              </p>
              <Link to="/contact" className="btn btn-gold" style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Inquire With Storefront</span>
                <Icons.ArrowRight size={15} />
              </Link>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="item-grid" style={{ marginTop: '2rem' }}>
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="collection-empty-box" style={{ marginTop: '2rem' }}>
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
