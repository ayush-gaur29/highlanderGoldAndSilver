import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { MobileDrawer } from './MobileDrawer';
import { useCart } from '../../context/CartContext';
import { Icons } from '../../utils/icons';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { totalItemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} id="siteHeader">
        <div className="container header-inner">
          {/* Brand Logo: Supplied Original Highlander Gold & Silver Logo */}
          <Link to="/" className="brand-link" aria-label="Highlander Gold & Silver Home">
            <img
              src="/assets/brand/highlander_logo_original.png"
              alt="Highlander Gold & Silver"
              className="brand-primary-logo"
              width={1024}
              height={341}
            />
          </Link>

          {/* Desktop Navigation: Home, Collection, About, Contact */}
          <Navigation />

          {/* Header Actions: Cart Drawer Trigger & Mobile Menu Toggle */}
          <div className="header-actions">
            {/* Cart Trigger Button */}
            <button
              type="button"
              className="btn-header-cart"
              id="headerCartBtn"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping Cart with ${totalItemCount} items`}
            >
              <span className="cart-icon-wrap">
                <Icons.ShoppingBag size={18} />
                {totalItemCount > 0 && (
                  <span className="cart-badge" id="headerCartCount">
                    {totalItemCount}
                  </span>
                )}
              </span>
              <span className="cart-text">Cart</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="mobile-menu-toggle"
              id="mobileMenuToggle"
              aria-label="Open mobile navigation menu"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <Icons.Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />
    </>
  );
};
