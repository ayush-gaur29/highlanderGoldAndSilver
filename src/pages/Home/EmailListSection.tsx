import React from 'react';
import { EmailSubscriptionForm } from '../../components/forms/EmailSubscriptionForm';

export const EmailListSection: React.FC = () => {
  return (
    <section className="section email-list-section" id="email-list">
      <div className="container">
        <div className="email-registry-card reveal-on-scroll">
          <div className="email-registry-content">
            <span
              className="eyebrow"
              style={{
                color: 'var(--color-aubergine)',
                marginBottom: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--color-gold)'
                }}
              />
              VIP NUMISMATIC REGISTRY · DROP NOTICES
            </span>
            <h2 className="email-registry-title">
              Join the Highlander Collector <span className="text-gradient-brand">Email List</span>
            </h2>
            <p className="email-registry-desc">
              Get early notification 24 hours before new sovereign gold, rare Morgan &amp; Peace silver dollars, and
              bullion inventory go live. Receive private direct-close opportunities before public bidding opens.
            </p>

            <EmailSubscriptionForm />
          </div>
        </div>
      </div>
    </section>
  );
};
