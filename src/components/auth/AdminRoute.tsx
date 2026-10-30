import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../../utils/icons';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isAdmin, isLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="profile-loading-screen">
        <div className="auth-spinner" style={{ width: 44, height: 44, borderWidth: 3 }} />
        <p className="profile-loading-text">Verifying administrative authorization...</p>
      </div>
    );
  }

  // Not logged in -> redirect to home and open login
  if (!user) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div className="auth-card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <div className="verification-icon-wrap">
            <Icons.Lock size={36} />
          </div>
          <h2 className="auth-card-title">Authentication Required</h2>
          <p className="auth-card-subtitle" style={{ marginBottom: '1.5rem' }}>
            Please log in with an authorized staff administrator account to view the Highlander Control Dashboard.
          </p>
          <button
            type="button"
            className="btn btn-gold btn-full"
            onClick={() => openAuthModal('login')}
          >
            Sign In with Administrator Account
          </button>
        </div>
      </div>
    );
  }

  // Logged in as regular customer ('user' role) -> Access Denied screen
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', display: 'flex', justifyContent: 'center' }}>
        <div
          className="auth-card"
          style={{
            maxWidth: 540,
            padding: '2.5rem 2rem',
            textAlign: 'center',
            borderColor: 'rgba(239, 68, 68, 0.4)'
          }}
        >
          <div
            className="verification-icon-wrap"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#DC2626'
            }}
          >
            <Icons.Shield size={36} />
          </div>

          <h2 className="auth-card-title" style={{ color: '#991B1B', marginTop: '1rem' }}>
            Access Denied: Staff Authorization Required
          </h2>

          <p className="auth-card-subtitle" style={{ fontSize: '0.92rem', lineHeight: 1.6, margin: '1rem 0 1.5rem' }}>
            This armory control and administration area is restricted strictly to verified staff administrators of Highlander Gold &amp; Silver.
          </p>

          <div
            style={{
              background: 'rgba(1, 33, 74, 0.04)',
              border: '1px solid var(--color-silver-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.75rem',
              textAlign: 'left',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Authenticated Identity:</span>
              <strong style={{ color: 'var(--color-aubergine)' }}>{user.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Assigned Role:</span>
              <span className="profile-tier-badge" style={{ fontSize: '0.72rem', padding: '0.15rem 0.6rem' }}>
                {role || 'user'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Permission Level:</span>
              <span style={{ color: '#DC2626', fontWeight: 600 }}>Standard Customer Privileges</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={() => navigate('/')}
            >
              Return to Storefront
            </button>
            <button
              type="button"
              className="btn btn-gold btn-md"
              onClick={() => navigate('/profile')}
            >
              View My Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin access granted
  return <>{children}</>;
};

