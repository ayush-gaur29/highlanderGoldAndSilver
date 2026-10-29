import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { BUSINESS_INFO } from '../data/businessInfo';
import { Icons } from '../utils/icons';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItemCount,
    subtotal,
    buyersPremium,
    totalSettlement,
    payPalCheckoutUrl
  } = useCart();

  return (
    <main className="cart-page-main">
      {/* Page Header Banner */}
      <section className="page-header-banner">
        <div className="container">
          <nav className="page-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Shopping Cart</span>
          </nav>

          <span className="eyebrow-badge">
            <Icons.ShoppingBag size={12} />
            Storefront Checkout Review
          </span>
          <h1 className="page-banner-title">Your Shopping Cart</h1>
          <p className="page-banner-desc">
            Review your selected precious metal acquisitions, verify transparent settlement breakdowns, and proceed to secure checkout with Montana 0% sales tax.
          </p>
        </div>
      </section>

      {/* Cart Content Section */}
      <section className="section section-body" id="cart-content">
        <div className="container">
          {cartItems.length === 0 ? (
            /* Empty State */
            <div className="cart-page-empty-box">
              <div className="empty-cart-circle">
                <Icons.ShoppingBag size={42} />
              </div>
              <h2 className="empty-cart-title">Your Shopping Cart is Empty</h2>
              <p className="empty-cart-desc">
                You haven&rsquo;t added any sovereign gold coins, certified Morgan dollars, or precious metals yet. Browse our verified inventory to find your next investment trophy.
              </p>
              <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <Link to="/collection" className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Explore Storefront Collection</span>
                  <Icons.ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  className="btn btn-silver"
                  onClick={() => setIsCartOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <Icons.ShoppingBag size={16} />
                  <span>Open Quick Side Drawer</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Cart Items & Settlement Summary Grid */
            <div className="cart-page-grid">
              {/* Left Column: Items List */}
              <div className="cart-page-items-column">
                <div className="cart-column-header">
                  <h2 className="cart-column-title">
                    Selected Pieces ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
                  </h2>
                  <button
                    type="button"
                    className="cart-clear-all-link"
                    onClick={clearCart}
                    title="Remove all items from cart"
                  >
                    Clear All
                  </button>
                </div>

                <div className="cart-page-items-list">
                  {cartItems.map(({ item, quantity }) => (
                    <article key={item.id} className="cart-page-item-card" data-id={item.id}>
                      <div className="item-card-media-wrap">
                        <img
                          src={item.featuredImage}
                          alt={item.title}
                          className="item-card-img"
                          loading="lazy"
                        />
                      </div>

                      <div className="item-card-info-wrap">
                        <div className="item-card-badges-row">
                          <span className="cart-badge-category">{item.category}</span>
                          <span className="cart-badge-lot">Item #{item.lotNumber}</span>
                          {item.grade && (
                            <span className="cart-badge-grade">{item.grade}</span>
                          )}
                        </div>

                        <h3 className="item-card-name" title={item.title}>
                          {item.title}
                        </h3>

                        <div className="item-card-pricing-row">
                          <div className="item-unit-price">
                            <span className="unit-label">Price Each:</span>
                            <span className="unit-val">{item.priceFormatted}</span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="cart-page-qty-controls">
                            <button
                              type="button"
                              className="qty-btn"
                              aria-label={`Decrease quantity of ${item.title}`}
                              onClick={() => updateQuantity(item.id, quantity - 1)}
                            >
                              <Icons.Minus size={12} />
                            </button>
                            <span className="qty-count">{quantity}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              aria-label={`Increase quantity of ${item.title}`}
                              onClick={() => updateQuantity(item.id, quantity + 1)}
                            >
                              <Icons.Plus size={12} />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="item-line-total">
                            <span className="line-total-label">Subtotal:</span>
                            <span className="line-total-val">
                              ${(item.price * quantity).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            className="cart-page-remove-btn"
                            aria-label={`Remove ${item.title} from cart`}
                            onClick={() => removeFromCart(item.id)}
                            title="Remove this item"
                          >
                            <Icons.Trash size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="cart-actions-bar">
                  <Link to="/collection" className="btn btn-silver btn-sm">
                    <Icons.ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                    <span>Continue Browsing Collection</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Settlement Summary Card */}
              <aside className="cart-page-summary-column" aria-label="Order Settlement Summary">
                <div className="cart-summary-card">
                  <h3 className="summary-card-title">Order Settlement</h3>

                  <div className="summary-breakdown-list">
                    <div className="summary-line">
                      <span className="summary-line-label">Products Subtotal:</span>
                      <span className="summary-line-value">
                        ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="summary-line">
                      <span className="summary-line-label">
                        Settlement Fee (15%):
                      </span>
                      <span className="summary-line-value">
                        +${buyersPremium.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="summary-line">
                      <span className="summary-line-label">Montana State Sales Tax:</span>
                      <span className="summary-line-value summary-free">
                        $0.00 (0% Tax-Exempt)
                      </span>
                    </div>

                    <div className="summary-line">
                      <span className="summary-line-label">USPS Insured Shipping:</span>
                      <span className="summary-line-value summary-free">
                        Included (In-House)
                      </span>
                    </div>

                    <div className="summary-divider" />

                    <div className="summary-total-line">
                      <span className="total-label">Total Settlement:</span>
                      <span className="total-value">
                        ${totalSettlement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Direct PayPal Checkout Button */}
                  <a
                    href={payPalCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-checkout-primary"
                    id="pageCartCheckoutBtn"
                  >
                    <Icons.CreditCard size={18} />
                    <span>Proceed to PayPal Checkout</span>
                  </a>

                  {/* Montana Tax Advantage Callout */}
                  <div className="montana-tax-notice">
                    <Icons.Check size={14} className="tax-check-icon" />
                    <span>
                      <strong>0% Montana State Sales Tax:</strong> Enjoy zero sales tax on all bullion and rare coin acquisitions governed under Montana state law.
                    </span>
                  </div>

                  {/* Bank Wire Note */}
                  <div className="wire-settlement-notice">
                    <h4 className="wire-notice-title">Orders Exceeding $5,000</h4>
                    <p className="wire-notice-text">
                      Direct domestic bank wire payments are accepted with an incoming wire fee credit. Inquire at <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a> or call {BUSINESS_INFO.phoneFormatted}.
                    </p>
                  </div>

                  {/* Security Guarantees */}
                  <div className="summary-trust-strip">
                    <div className="trust-pill">
                      <Icons.ShieldCheck size={13} />
                      <span>HGS Sold Value Guarantee</span>
                    </div>
                    <div className="trust-pill">
                      <Icons.Package size={13} />
                      <span>Insured In-House Packaging</span>
                    </div>
                    <div className="trust-pill">
                      <Icons.Lock size={13} />
                      <span>Verified PayPal Protection</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CartPage;
