import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { OrderService } from '../../services/orderService';
import { Icons } from '../../utils/icons';
import { BUSINESS_INFO } from '../../data/businessInfo';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, openAuthModal } = useAuth();
  const {
    cartItems,
    isCartOpen,
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

  // Close on Escape key press and prevent body scroll when open
  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  const handleClose = () => {
    setIsCartOpen(false);
  };

  const handleNavigateToCollection = (categoryName?: string) => {
    setIsCartOpen(false);
    if (categoryName) {
      navigate(`/collection?category=${encodeURIComponent(categoryName)}`);
    } else {
      navigate('/collection');
    }
  };

  const formattedSubtotal = `$${subtotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const formattedBuyersPremium = `+$${buyersPremium.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const formattedTotalSettlement = `$${totalSettlement.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        id="cartDrawerOverlay"
        onClick={handleClose}
        aria-hidden={!isCartOpen}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        className={`cart-drawer ${isCartOpen ? 'open' : ''}`}
        id="cartDrawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartDrawerHeading"
      >
        {/* Clean Header: compact icon, "Shopping Cart" title, selected-item count, close button */}
        <header className="cart-drawer-header">
          <div className="cart-header-left">
            <div className="cart-header-icon" aria-hidden="true">
              <Icons.ShoppingBag size={17} />
            </div>
            <div className="cart-header-titles">
              <h2 className="cart-drawer-title" id="cartDrawerHeading">
                Shopping Cart
              </h2>
              <span className="cart-header-badge">
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="cart-drawer-close-btn"
            id="cartDrawerCloseBtn"
            aria-label="Close cart drawer"
            onClick={handleClose}
          >
            <Icons.Close size={18} />
          </button>
        </header>

        {/* Drawer Body / Content */}
        {cartItems.length === 0 ? (
          /* Modern Luxury Empty State */
          <div className="cart-drawer-empty">
            <div className="cart-empty-icon-wrap">
              <div className="cart-empty-icon-glow" />
              <div className="cart-empty-icon">
                <Icons.ShoppingBag size={34} />
              </div>
            </div>

            <h3 className="cart-empty-title">Your Cart is Empty</h3>
            <p className="cart-empty-text">
              Browse our authenticated Montana collection of sovereign gold, certified Morgan dollars, silver bullion, and ancient rarities.
            </p>

            <button
              type="button"
              className="btn btn-gold cart-empty-cta-btn"
              id="cartBrowseCollectionBtn"
              onClick={() => handleNavigateToCollection()}
            >
              <span>Explore Collection</span>
              <Icons.ArrowRight size={15} />
            </button>

            {/* Quick Category Discovery */}
            <div className="cart-empty-discovery">
              <span className="cart-discovery-label">Quick Discovery</span>
              <div className="cart-discovery-grid">
                <button
                  type="button"
                  className="cart-discovery-pill"
                  onClick={() => handleNavigateToCollection('Sovereign Gold Coins')}
                >
                  <span className="pill-dot gold-dot" />
                  <span>Sovereign Gold</span>
                </button>
                <button
                  type="button"
                  className="cart-discovery-pill"
                  onClick={() => handleNavigateToCollection('Morgan Silver Dollars')}
                >
                  <span className="pill-dot silver-dot" />
                  <span>Morgan Dollars</span>
                </button>
                <button
                  type="button"
                  className="cart-discovery-pill"
                  onClick={() => handleNavigateToCollection('Silver Bullion & Bars')}
                >
                  <span className="pill-dot bullion-dot" />
                  <span>Silver Bullion</span>
                </button>
                <button
                  type="button"
                  className="cart-discovery-pill"
                  onClick={() => handleNavigateToCollection('Ancient Numismatics')}
                >
                  <span className="pill-dot ancient-dot" />
                  <span>Ancient Rarities</span>
                </button>
              </div>
            </div>

            {/* Trust Pillars in Empty State */}
            <div className="cart-empty-trust-list">
              <div className="cart-empty-trust-item">
                <Icons.ShieldCheck size={14} className="trust-icon" />
                <span>0% Montana Sales Tax • Fully Tax-Exempt</span>
              </div>
              <div className="cart-empty-trust-item">
                <Icons.Package size={14} className="trust-icon" />
                <span>USPS Insured Shipping Included</span>
              </div>
              <div className="cart-empty-trust-item">
                <Icons.Check size={14} className="trust-icon" />
                <span>HGS Sold Value & Authenticity Guaranteed</span>
              </div>
            </div>
          </div>
        ) : (
          /* Populated State with Clear Hierarchy: Items -> Order Summary -> Checkout Actions */
          <div className="cart-drawer-content">
            {/* 1. Cart Items Section */}
            <section className="cart-items-section" aria-label="Shopping cart items">
              <div className="cart-items-header">
                <span className="cart-section-title">
                  Items in Cart ({totalItemCount})
                </span>

              </div>

              <div className="cart-items-scroll">
                {cartItems.map(({ item, quantity }) => (
                  <article key={item.id} className="cart-item-card" data-id={item.id}>
                    <div className="cart-item-media">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="cart-item-img"
                        loading="lazy"
                      />
                    </div>

                    <div className="cart-item-body">
                      <div className="cart-item-top-row">
                        <h4 className="cart-item-title" title={item.title}>
                          {item.title}
                        </h4>
                        <button
                          type="button"
                          className="cart-item-remove-btn"
                          aria-label={`Remove ${item.title} from cart`}
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          <Icons.Trash size={14} />
                        </button>
                      </div>

                      <div className="cart-item-bottom-row">
                        <div className="cart-item-pricing">
                          <span className="cart-item-price">{item.priceFormatted}</span>
                          {quantity > 1 && (
                            <span className="cart-item-total-price">
                              (${(item.price * quantity).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })})
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper Control */}
                        <div className="cart-qty-stepper" aria-label="Adjust quantity">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            aria-label={`Decrease quantity of ${item.title}`}
                            onClick={() => updateQuantity(item.id, quantity - 1)}
                          >
                            <Icons.Minus size={11} />
                          </button>
                          <span className="cart-qty-val" aria-live="polite">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            aria-label={`Increase quantity of ${item.title}`}
                            onClick={() => updateQuantity(item.id, quantity + 1)}
                          >
                            <Icons.Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 2. Order Summary Card */}
            <section className="cart-summary-section" aria-label="Order summary">
              <div className="cart-summary-card">
                <div className="cart-summary-card-header">
                  <span className="cart-summary-title">Order Summary</span>
                </div>

                <div className="summary-line">
                  <span className="summary-label">Product Subtotal</span>
                  <span className="summary-value">{formattedSubtotal}</span>
                </div>

                <div className="summary-line">
                  <span className="summary-label">
                    Settlement Fee (15% Buyer's Premium)
                  </span>
                  <span className="summary-value summary-bp">
                    {formattedBuyersPremium}
                  </span>
                </div>

                <div className="summary-line">
                  <span className="summary-label">Montana State Sales Tax</span>
                  <span className="summary-value summary-free">
                    $0.00 (0% Tax-Exempt)
                  </span>
                </div>

                <div className="summary-line">
                  <span className="summary-label">USPS Insured Shipping</span>
                  <span className="summary-value summary-free">
                    Included (In-House)
                  </span>
                </div>

                <div className="summary-divider" />

                <div className="summary-line summary-total-line">
                  <span className="summary-total-label">Total Settlement</span>
                  <span className="summary-total-value">
                    {formattedTotalSettlement}
                  </span>
                </div>
              </div>
            </section>

            {/* 3. Checkout Actions */}
            <footer className="cart-drawer-footer">
              <a
                href={payPalCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cart-checkout-btn"
                id="cartCheckoutBtn"
                onClick={async (e) => {
                  if (!user) {
                    e.preventDefault();
                    sessionStorage.setItem('hgs_paypal_redirect', payPalCheckoutUrl);
                    handleClose();
                    openAuthModal('login');
                    return;
                  }

                  // Asynchronously record order in Supabase
                  try {
                    await OrderService.createOrder(
                      {
                        fullName: profile?.full_name || user.email?.split('@')[0] || 'Collector Member',
                        email: user.email || '',
                        phone: profile?.phone || '',
                        address: profile?.city ? `${profile.city}, ${profile.state || 'MT'}` : '',
                        city: profile?.city || '',
                        state: profile?.state || '',
                        paymentMethod: 'PayPal'
                      },
                      cartItems
                    );
                    clearCart();
                    handleClose();
                  } catch (err) {
                    console.warn('[CartDrawer] Supabase order recording notice:', err);
                  }
                }}
              >
                <Icons.CreditCard size={18} />
                <span>Proceed to PayPal Checkout ({formattedTotalSettlement})</span>
              </a>

              <button
                type="button"
                className="cart-continue-btn"
                onClick={handleClose}
              >
                Continue Browsing Storefront
              </button>

              {totalSettlement >= 5000 && (
                <p className="cart-wire-note">
                  Bank wire accepted for orders over $5,000 with fee credit. Inquire at{' '}
                  <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>.
                </p>
              )}
            </footer>
          </div>
        )}
      </aside>
    </>
  );
};


