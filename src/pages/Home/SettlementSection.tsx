import React from 'react';
import { SettlementCalculator } from '../../components/settlement/SettlementCalculator';
import { Icons } from '../../utils/icons';

export const SettlementSection: React.FC = () => {
  return (
    <section className="section section-light" id="payment-shipping">
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }} className="reveal-on-scroll">
          <span className="eyebrow">• VERIFIED SETTLEMENT &amp; DELIVERY •</span>
          <h2 style={{ marginTop: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-aubergine)' }}>
            Simple, Secure <span className="gradient-text-gold">Self-Pay</span>
          </h2>
          <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
            Highlander Gold &amp; Silver provides transparent self-pay settlements. Use the official PayPal link to complete
            your transaction with any major credit card, debit card, or PayPal balance.
          </p>
        </div>

        <div className="payment-grid">
          {/* Official PayPal Payment & Calculator Card */}
          <div className="payment-card reveal-on-scroll">
            <div className="payment-card-header">
              <div className="payment-icon-badge">
                <Icons.CreditCard size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-aubergine)', marginBottom: '0.25rem' }}>
                  Pay with PayPal
                </h3>
                <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                  Complete your invoice settlement securely via PayPal's verified payment gateway.
                </p>
              </div>
            </div>

            {/* Natural Quick Settlement Calculator */}
            <SettlementCalculator />
          </div>

          {/* Shipping & Settlement Terms Card */}
          <div className="payment-card reveal-on-scroll">
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-aubergine)', marginBottom: '1.25rem' }}>
              Delivery &amp; Settlement Policies
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 1. Insured Shipping */}
              <div className="policy-item">
                <div className="policy-icon-wrap">
                  <Icons.Package size={16} />
                </div>
                <div>
                  <div className="policy-heading">1. Insured Domestic Shipping</div>
                  <p className="policy-desc">
                    All domestic shipments are fulfilled in-house via USPS Priority or Ground. Every parcel includes
                    full insurance and postal tracking. Packages exceeding $500 require a signature upon delivery.
                  </p>
                </div>
              </div>

              {/* 2. Wire Transfer Credit */}
              <div className="policy-item">
                <div className="policy-icon-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div>
                  <div className="policy-heading">2. High-Dollar Wire Transfer Credit</div>
                  <p className="policy-desc">
                    For high-value bullion or gold coin acquisitions that exceed credit card limits, bank wire payment
                    is accepted with an incoming wire fee credit applied directly to your settlement.
                  </p>
                </div>
              </div>

              {/* 3. Settlement Requirement */}
              <div className="policy-item">
                <div className="policy-icon-wrap">
                  <Icons.Clock size={16} />
                </div>
                <div>
                  <div className="policy-heading">3. 24-Hour Settlement Window</div>
                  <p className="policy-desc">
                    Settlement is requested within 24 hours of invoice issuance. Prompt payments guarantee
                    next-business-day dispatch from our Bigfork facility.
                  </p>
                </div>
              </div>

              {/* Montana Tax Exemption Note */}
              <div className="tax-exemption-note">
                <Icons.Check size={16} strokeWidth={2.5} className="flex-shrink-0" />
                <span>
                  <strong>0% Montana State Sales Tax:</strong> All purchases processed through this Montana facility
                  enjoy complete state sales tax exemption.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
