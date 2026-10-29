import React from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS_INFO } from '../../data/businessInfo';
import { useCart } from '../../context/CartContext';

export const Footer: React.FC = () => {
  const { setIsCartOpen } = useCart();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          {/* Brand Summary */}
          <div>
            <div className="footer-logo-wrap">
              <Link to="/" aria-label="Highlander Gold & Silver Home">
                <img
                  src="/assets/brand/highlander_logo_original.png"
                  alt="Highlander Gold & Silver"
                  className="footer-logo-img"
                  width={1024}
                  height={341}
                />
              </Link>
            </div>
            <p className="footer-brand-desc">
              A dedicated Montana storefront presenting sovereign gold, certified Morgan dollars,
              ancient coins, and precious metals with guaranteed sold value and direct settlement.
            </p>
            <div className="footer-location-coordinates">
              Flathead County, Montana
            </div>
          </div>

          {/* Navigation Links limited to: Home, Collection, About, Contact, Cart */}
          <div>
            <div className="footer-col-title">Store Navigation</div>
            <div className="footer-link-list">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/collection" className="footer-link">Collection</Link>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
              <button
                type="button"
                className="footer-link footer-cart-btn"
                onClick={() => setIsCartOpen(true)}
              >
                Shopping Cart
              </button>
            </div>
          </div>

          {/* Inventory Classifications */}
          <div>
            <div className="footer-col-title">Classifications</div>
            <div className="footer-link-list">
              <Link to="/collection" className="footer-link">Sovereign Gold Coins</Link>
              <Link to="/collection" className="footer-link">Morgan Silver Dollars</Link>
              <Link to="/collection" className="footer-link">Silver Bullion &amp; Bars</Link>
              <Link to="/collection" className="footer-link">Commemorative Proofs</Link>
              <Link to="/collection" className="footer-link">Ancient Numismatics</Link>
            </div>
          </div>

          {/* Official Contact */}
          <div>
            <div className="footer-col-title">Jewel Basin Armory</div>
            <div className="footer-link-list">
              <span className="footer-info-text">{BUSINESS_INFO.street}</span>
              <span className="footer-info-text">
                {BUSINESS_INFO.city}, {BUSINESS_INFO.state} {BUSINESS_INFO.zip}
              </span>
              <a href={`tel:${BUSINESS_INFO.phone}`} className="footer-link">
                {BUSINESS_INFO.phoneFormatted}
              </a>
              <a href={`mailto:${BUSINESS_INFO.email}`} className="footer-link">
                {BUSINESS_INFO.email}
              </a>

            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="footer-bottom-row">
          <div className="footer-copyright">
            © 2026 Highlander Gold &amp; Silver. All rights reserved.
          </div>
          <div className="footer-legal-notice">
            All transactions governed under the laws of the State of Montana. 15% Settlement fee applicable on all
            orders. In-house fully insured shipping via USPS. Montana 0% State Sales Tax.
          </div>
        </div>
      </div>
    </footer>
  );
};
