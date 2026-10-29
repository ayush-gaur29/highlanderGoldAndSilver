import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { InventoryItem } from '../types';
import { InventoryService } from '../services/inventoryService';
import { BUSINESS_INFO } from '../data/businessInfo';
import { findProductBySlug } from '../utils/slug';
import { calculateSettlement, generatePayPalPaymentUrl } from '../utils/payment';
import { Icons } from '../utils/icons';
import { ItemCard } from '../components/collection/ItemCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedNotice, setShowAddedNotice] = useState(false);

  // Fetch product dynamically from Supabase by slug or ID
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    InventoryService.getInventory()
      .then((all) => {
        if (!isMounted) return;
        const found = findProductBySlug(slug, all);
        setItem(found || null);

        if (found) {
          const related = all
            .filter((inv) => inv.id !== found.id)
            .sort((a) => (a.category === found.category ? -1 : 1))
            .slice(0, 3);
          setRelatedItems(related);
          document.title = `${found.title} — Highlander Gold & Silver`;
        } else {
          document.title = 'Piece Not Found — Highlander Gold & Silver';
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[ProductDetailPage] Failed to load inventory item:', err);
        if (isMounted) {
          setItem(null);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Scroll to top and reset image index when item changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImageIndex(0);
    setQuantity(1);
    setShowAddedNotice(false);
  }, [slug]);

  if (isLoading) {
    return (
      <main className="product-detail-main not-found-view" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
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
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#1B2A4A', marginBottom: '0.5rem' }}>
            Retrieving Numismatic Record...
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Accessing Highlander Vault records from Supabase
          </p>
        </div>
      </main>
    );
  }

  // If item is not found, display a graceful not-found state
  if (!item) {
    return (
      <main className="product-detail-main not-found-view">
        <div className="container">
          <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/collection" className="breadcrumb-link">Collection</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Not Found</span>
          </nav>

          <div className="detail-not-found-card">
            <div className="not-found-icon-wrap">
              <Icons.Search size={40} />
            </div>
            <h1 className="not-found-title">Numismatic Piece Not Found</h1>
            <p className="not-found-desc">
              The item you requested could not be located in our active Bigfork, Montana storefront inventory. It may have been acquired by another collector or relocated within our catalog.
            </p>
            <div className="not-found-actions">
              <Link to="/collection" className="btn btn-gold">
                <Icons.ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
                <span>Return to Storefront Collection</span>
              </Link>
              <Link to="/contact" className="btn btn-silver">
                <Icons.Phone size={15} />
                <span>Inquire with Storefront</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isUnavailable =
    item.status === 'Unavailable' ||
    item.status === 'Closed' ||
    item.stock_status === 'Out of Stock' ||
    (typeof item.stock_quantity === 'number' && item.stock_quantity <= 0);
  const images = item.additionalImages && item.additionalImages.length > 0
    ? item.additionalImages
    : [item.featuredImage];

  const settlement = calculateSettlement(item.price * quantity, BUSINESS_INFO.terms.buyersPremiumPercent);
  const unitSettlement = calculateSettlement(item.price, BUSINESS_INFO.terms.buyersPremiumPercent);
  const payPalUrl = generatePayPalPaymentUrl(BUSINESS_INFO.payPalUrl, settlement.totalSettlement);

  const handleAddToCart = () => {
    if (isUnavailable) return;
    addToCart(item, quantity);
    setShowAddedNotice(true);
    setTimeout(() => setShowAddedNotice(false), 3000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <main className="product-detail-main">
      <div className="container">
        {/* Breadcrumb Navigation & Back Link */}
        <div className="detail-top-nav-bar">
          <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/collection" className="breadcrumb-link">Collection</Link>
            <span className="breadcrumb-sep">/</span>
            <Link
              to={`/collection?category=${encodeURIComponent(item.category)}`}
              className="breadcrumb-link"
            >
              {item.category}
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current" title={item.title}>
              Item #{item.lotNumber}
            </span>
          </nav>

          <Link to="/collection" className="detail-back-link">
            <Icons.ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />
            <span>Back to Collection</span>
          </Link>
        </div>

        {/* Main Product Detail Grid (Two Column Desktop Layout) */}
        <div className="product-detail-grid">
          {/* Left Column: Image Showcase & Gallery */}
          <section className="detail-gallery-column" aria-label="Product imagery">
            <div className="detail-main-stage">
              <div className="stage-badge-lot">Item #{item.lotNumber}</div>
              <div className="stage-badge-category">{item.category}</div>

              {isUnavailable && (
                <div className="stage-watermark-unavailable">
                  Currently Unavailable
                </div>
              )}

              <img
                src={images[selectedImageIndex] || item.featuredImage}
                alt={item.title}
                className="detail-main-image"
                loading="eager"
              />
            </div>

            {/* Thumbnail Row if multiple views available */}
            {images.length > 1 && (
              <div className="detail-thumb-row" role="tablist" aria-label="Product image views">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={idx === selectedImageIndex}
                    className={`detail-thumb-btn ${idx === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View coin image ${idx + 1}`}
                  >
                    <img src={img} alt={`View ${idx + 1} of ${item.title}`} />
                  </button>
                ))}
              </div>
            )}

            {/* In-House Inspection & Physical Vault Verification */}
            <div className="detail-vault-badge-box">
              <div className="vault-badge-icon">
                <Icons.ShieldCheck size={20} />
              </div>
              <div>
                <strong className="vault-badge-title">
                  Certified &amp; Inspected by Highlander Gold &amp; Silver
                </strong>
                <p className="vault-badge-sub">
                  Vaulted at Jewel Basin Armory, Bigfork, MT · Guaranteed strike authenticity and verified grade
                </p>
              </div>
            </div>
          </section>

          {/* Right Column: Product Information, Settlement & Purchase Actions */}
          <section className="detail-info-column" aria-label="Product details and purchase options">
            {/* Meta Category & Lot Header */}
            <div className="detail-meta-tags">
              <span className="detail-tag-item">Item #{item.lotNumber}</span>
              <span className="detail-tag-category">{item.category}</span>
              <span className="detail-tag-metal">{item.metal}</span>
            </div>

            <h1 className="detail-product-title">{item.title}</h1>

            {item.lead && <p className="detail-product-lead">{item.lead}</p>}

            {/* Stock Availability Indicator */}
            <div className="detail-stock-status-row">
              {!isUnavailable ? (
                <div className="stock-pill stock-in">
                  <span className="stock-dot-green" />
                  <span>Available in Storefront Inventory</span>
                </div>
              ) : (
                <div className="stock-pill stock-out">
                  <span className="stock-dot-amber" />
                  <span>{item.statusNote || 'Currently Unavailable · Returning Soon'}</span>
                </div>
              )}
              <span className="stock-tax-pill">0% Montana Sales Tax</span>
            </div>

            {/* Pricing & Settlement Card */}
            <div className="detail-pricing-card">
              <div className="pricing-primary-row">
                <div>
                  <span className="pricing-headline-label">Storefront Price</span>
                  <div className="pricing-headline-amount">{item.priceFormatted}</div>
                </div>
                {item.estimateRange && (
                  <div className="pricing-appraisal-block">
                    <span className="appraisal-label">Numismatic Estimate</span>
                    <span className="appraisal-value">{item.estimateRange}</span>
                  </div>
                )}
              </div>

              {/* Settlement Fee Breakdown */}
              <div className="detail-settlement-breakdown">
                <div className="settlement-line">
                  <span className="settlement-label">Settlement with 15% Buyer's Premium:</span>
                  <span className="settlement-value">
                    ${unitSettlement.totalSettlement.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
                <div className="settlement-line">
                  <span className="settlement-label">Montana State Sales Tax:</span>
                  <span className="settlement-value text-green">0% (Tax-Exempt)</span>
                </div>
                <div className="settlement-line">
                  <span className="settlement-label">Fulfillment Delivery:</span>
                  <span className="settlement-value text-green">USPS Insured Shipping Included</span>
                </div>
              </div>
            </div>

            {/* Add to Cart & Checkout Action Block */}
            <div className="detail-purchase-block">
              {!isUnavailable ? (
                <>
                  <div className="detail-action-controls-row">
                    {/* Quantity Stepper */}
                    <div className="detail-qty-control" aria-label="Select quantity">
                      <button
                        type="button"
                        className="detail-qty-btn"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Icons.Minus size={14} />
                      </button>
                      <span className="detail-qty-number" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="detail-qty-btn"
                        onClick={() => handleQuantityChange(1)}
                        aria-label="Increase quantity"
                      >
                        <Icons.Plus size={14} />
                      </button>
                    </div>

                    {/* Primary Add to Cart Button */}
                    <button
                      type="button"
                      className="btn btn-gold btn-detail-add-cart"
                      onClick={handleAddToCart}
                      id="detailAddToCartBtn"
                    >
                      <Icons.ShoppingBag size={18} />
                      <span>
                        Add to Cart • ${(item.price * quantity).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </button>
                  </div>

                  {/* Secondary Direct PayPal Checkout */}
                  <a
                    href={payPalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-silver btn-detail-paypal"
                    id="detailPayPalBtn"
                  >
                    <Icons.CreditCard size={16} />
                    <span>
                      Instant PayPal Checkout (${settlement.totalSettlement.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })})
                    </span>
                  </a>
                </>
              ) : (
                <div className="detail-unavailable-box">
                  <button type="button" className="btn btn-silver btn-detail-disabled" disabled>
                    <span>Currently Unavailable</span>
                  </button>
                  <p className="unavailable-note">
                    This inventory lot is temporarily spoken for or pending acquisition. Contact our storefront directly to request a similar strike or place a private hold.
                  </p>
                </div>
              )}

              {/* Added Notice Feedback */}
              {showAddedNotice && (
                <div className="detail-added-alert" role="status">
                  <Icons.Check size={16} />
                  <span>Item added to shopping cart drawer.</span>
                </div>
              )}
            </div>

            {/* Technical Specifications Table */}
            <div className="detail-specs-section">
              <h3 className="specs-section-title">Verified Technical Specifications</h3>
              <div className="specs-table-container">
                <table className="detail-specs-table">
                  <tbody>
                    <tr>
                      <th scope="row">Vault Identifier</th>
                      <td>Item #{item.lotNumber}</td>
                    </tr>
                    <tr>
                      <th scope="row">Classification</th>
                      <td>{item.category} ({item.metal})</td>
                    </tr>
                    {item.purity && (
                      <tr>
                        <th scope="row">Metal &amp; Purity</th>
                        <td>{item.purity}</td>
                      </tr>
                    )}
                    {item.grade && (
                      <tr>
                        <th scope="row">Certified Grade</th>
                        <td>{item.grade}</td>
                      </tr>
                    )}
                    {item.mintage && (
                      <tr>
                        <th scope="row">Mintage / Issue</th>
                        <td>{item.mintage}</td>
                      </tr>
                    )}
                    <tr>
                      <th scope="row">Fulfillment</th>
                      <td>In-House Insured USPS Priority Packaging</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="detail-description-section">
              <h3 className="description-section-title">Historical &amp; Numismatic Overview</h3>
              <div className="detail-description-body">
                <p>{item.description}</p>

                {item.paymentNote && (
                  <div className="detail-payment-note-box">
                    <Icons.ShieldCheck size={16} className="note-icon" />
                    <div>
                      <strong>Acquisition Terms:</strong> {item.paymentNote}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Highlander Sold Value Guarantee Banner */}
            <div className="detail-guarantee-card">
              <div className="guarantee-card-icon">
                <Icons.ShieldCheck size={22} />
              </div>
              <div className="guarantee-card-content">
                <h4 className="guarantee-card-title">Highlander Sold Value Guarantee Included</h4>
                <p className="guarantee-card-text">
                  If at any time a customer proves that a piece purchased from our storefront was overpriced based on its current market state, Highlander Gold &amp; Silver will refund the cost difference, or accept return of the item at its full purchased value.
                </p>
              </div>
            </div>

            {/* High-Value Bank Wire Assistance */}
            <div className="detail-contact-prompt">
              <p>
                Questions regarding this piece or prefer a direct bank wire? Speak with us directly at{' '}
                <a href={`tel:${BUSINESS_INFO.phone}`}>{BUSINESS_INFO.phoneFormatted}</a> or email{' '}
                <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>.
              </p>
            </div>
          </section>
        </div>

        {/* Related Pieces Section */}
        {relatedItems.length > 0 && (
          <section className="detail-related-section" aria-label="Related numismatic inventory">
            <div className="related-section-header">
              <div>
                <span className="related-eyebrow">Explore More Acquisitions</span>
                <h2 className="related-title">Certified Pieces from the Montana Vault</h2>
              </div>
              <Link to="/collection" className="btn btn-silver btn-sm">
                <span>View Full Inventory</span>
                <Icons.ArrowRight size={13} />
              </Link>
            </div>

            <div className="item-grid" style={{ marginTop: '1.75rem' }}>
              {relatedItems.map((relItem) => (
                <ItemCard key={relItem.id} item={relItem} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetailPage;
