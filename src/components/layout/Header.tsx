import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation } from './Navigation';
import { MobileDrawer } from './MobileDrawer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../utils/icons';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { totalItemCount, setIsCartOpen } = useCart();
  const { user, profile, isAdmin, openAuthModal, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // User display name
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Profile';

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

          {/* Header Actions: Cart, Login/Profile & Mobile Menu Toggle */}
          <div className="header-actions">
            {/* Customer Authentication: Login Button OR Profile Dropdown */}
            {!user ? (
              <button
                type="button"
                className="btn-header-login"
                id="headerLoginBtn"
                onClick={() => openAuthModal('login')}
                aria-label="Customer Login"
              >
                <Icons.User size={16} className="login-icon" />
                <span className="login-text">Login</span>
              </button>
            ) : (
              <div className="header-profile-menu-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="btn-header-profile"
                  id="headerProfileBtn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Customer Account Menu"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Collector'}
                      className="header-avatar-img"
                    />
                  ) : (
                    <span className="header-avatar-circle">
                      <Icons.User size={15} />
                    </span>
                  )}
                  <span className="header-profile-name">{displayName}</span>
                  <Icons.ChevronDown
                    size={14}
                    className={`profile-chevron ${profileDropdownOpen ? 'open' : ''}`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="header-profile-dropdown" role="menu">
                    <div className="dropdown-user-header">
                      <strong className="dropdown-user-name">
                        {profile?.full_name || 'Highlander Collector'}
                      </strong>
                      <span className="dropdown-user-email">{user.email}</span>
                      <span className={`dropdown-role-badge ${isAdmin ? 'admin-badge' : ''}`}>
                        {isAdmin ? 'Staff Admin' : (profile?.tier || 'Collector Member')}
                      </span>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/profile');
                      }}
                    >
                      <Icons.User size={15} />
                      <span>My Profile</span>
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        role="menuitem"
                        className="dropdown-menu-item admin-item"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate('/admin');
                        }}
                      >
                        <Icons.Shield size={15} />
                        <span>Staff Dashboard</span>
                      </button>
                    )}

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-menu-item logout-item"
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await logout();
                        navigate('/');
                      }}
                    >
                      <Icons.LogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

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
