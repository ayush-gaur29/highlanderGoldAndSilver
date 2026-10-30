import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Icons } from '../../utils/icons';
import { BUSINESS_INFO } from '../../data/businessInfo';
import { useAuth } from '../../context/AuthContext';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { user, profile, isAdmin, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();

  // Close on Escape key press and prevent scroll when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Collector';

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`}
        id="mobileDrawerOverlay"
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Mobile Navigation Drawer */}
      <aside
        className={`mobile-drawer ${isOpen ? 'open' : ''}`}
        id="mobileDrawer"
        aria-label="Mobile Navigation"
      >
        <div className="mobile-drawer-header">
          <Link to="/" className="brand-link" aria-label="Highlander Gold and Silver Home" onClick={onClose}>
            <img
              src="/assets/brand/highlander_logo_original.png"
              alt="Highlander Gold and Silver"
              className="mobile-drawer-logo"
              width={1024}
              height={341}
            />
          </Link>
          <button
            type="button"
            className="modal-close-btn"
            id="mobileDrawerClose"
            aria-label="Close menu"
            onClick={onClose}
          >
            <Icons.Close size={18} />
          </button>
        </div>

        {/* User Account Banner (Mobile) */}
        <div className="mobile-drawer-auth-box">
          {!user ? (
            <button
              type="button"
              className="btn btn-gold btn-sm mobile-auth-btn"
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
            >
              <Icons.User size={16} />
              <span>Sign In / Register</span>
            </button>
          ) : (
            <div className="mobile-user-card">
              <div className="mobile-user-info">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="mobile-avatar-img"
                  />
                ) : (
                  <div className="mobile-avatar-circle">
                    <Icons.User size={18} />
                  </div>
                )}
                <div className="mobile-user-text">
                  <span className="mobile-user-name">{displayName}</span>
                  <span className="mobile-user-tier">
                    {isAdmin ? 'Staff Administrator' : (profile?.tier || 'Collector Member')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation limited strictly to: Home, Collection, About, Contact, Cart */}
        <nav className="mobile-nav-list" aria-label="Mobile Navigation Links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Home</span>
            <Icons.ArrowRight size={15} className="mobile-nav-arrow" />
          </NavLink>
          <NavLink
            to="/collection"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Collection</span>
            <Icons.ArrowRight size={15} className="mobile-nav-arrow" />
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>About</span>
            <Icons.ArrowRight size={15} className="mobile-nav-arrow" />
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <span>Contact</span>
            <Icons.ArrowRight size={15} className="mobile-nav-arrow" />
          </NavLink>

          {/* Authenticated Customer Links */}
          {user && (
            <>
              <div style={{ height: '1px', background: 'var(--color-silver-border)', margin: '0.75rem 0' }} />
              <NavLink
                to="/profile"
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span>My Profile</span>
                <Icons.User size={15} className="mobile-nav-arrow" />
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span style={{ color: 'var(--color-gold-dark)', fontWeight: 700 }}>Staff Dashboard</span>
                  <Icons.Shield size={15} className="mobile-nav-arrow" />
                </NavLink>
              )}

              <button
                type="button"
                className="mobile-nav-link mobile-logout-btn"
                onClick={async () => {
                  onClose();
                  await logout();
                  navigate('/');
                }}
              >
                <span>Logout</span>
                <Icons.LogOut size={15} className="mobile-nav-arrow" />
              </button>
            </>
          )}

          <div style={{ height: '1px', background: 'var(--color-silver-border)', margin: '0.75rem 0' }} />
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-silver-border)' }}>
          <a
            href={BUSINESS_INFO.payPalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold btn-sm"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            PayPal Payment Portal
          </a>
        </div>
      </aside>
    </>
  );
};
