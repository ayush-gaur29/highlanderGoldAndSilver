import React from 'react';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Icons } from '../../utils/icons';

export const AboutSection: React.FC = () => {
  return (
    <section className="section section-warm" id="about">
      <div className="container">
        {/* Section Heading */}
        <SectionHeading
          align="center"
          eyebrow="About Highlander Gold &amp; Silver · Bigfork, Montana"
          title="A Direct Storefront for Rare Coins &amp; Precious Metals"
          subtitle="Highlander Gold &amp; Silver operates as an ongoing online storefront rather than an auction house. We believe acquiring sovereign gold, certified Morgan dollars, and precious metals should be straightforward, transparent, and immediate—without bidding wars or ticking timers."
        />

        {/* 4 Storefront Advantage Cards */}
        <div className="store-highlights-grid">
          <div className="highlight-card reveal-on-scroll is-revealed">
            <div className="highlight-icon-box">
              <Icons.CreditCard size={22} />
            </div>
            <h3 className="highlight-title">Direct Storefront Purchase</h3>
            <p className="highlight-text">
              Browse curated inventory and purchase directly with seamless instant checkout via PayPal or bank wire.
              No bidding wars, timed auction blocks, or waiting days for listing clocks to expire.
            </p>
          </div>

          <div className="highlight-card reveal-on-scroll is-revealed">
            <div className="highlight-icon-box">
              <Icons.ShieldCheck size={22} />
            </div>
            <h3 className="highlight-title">Sold Value Guarantee</h3>
            <p className="highlight-text">
              Every coin is hand-picked for true luster, strike, eye appeal, and metal integrity. If proof is presented
              that an acquired coin was overpriced based on its market state, HGS refunds the difference or accepts as-sold return.
            </p>
          </div>

          <div className="highlight-card reveal-on-scroll is-revealed">
            <div className="highlight-icon-box">
              <Icons.Package size={22} />
            </div>
            <h3 className="highlight-title">In-House Insured Delivery</h3>
            <p className="highlight-text">
              All packaging and fulfillment is performed in-house from our Bigfork facility. Every parcel ships via USPS
              Priority or Ground, fully insured with delivery tracking. Packages exceeding $500 require a signature upon delivery.
            </p>
          </div>

          <div className="highlight-card reveal-on-scroll is-revealed">
            <div className="highlight-icon-box">
              <Icons.Check size={22} />
            </div>
            <h3 className="highlight-title">Transparent 15% Settlement</h3>
            <p className="highlight-text">
              Flat 15% settlement fee across inventory with 0% Montana state sales tax. Direct PayPal checkout with
              instant confirmation, or incoming wire fee credit on high-value acquisitions.
            </p>
          </div>
        </div>

        {/* Sold Value Guarantee Showcase Callout */}
        <div className="guarantee-box reveal-on-scroll is-revealed" style={{ marginTop: '3.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <span className="guarantee-badge">
                <Icons.ShieldCheck size={16} strokeWidth={2.5} />
                Authentic Value &amp; Authenticity Promise
              </span>
              <h2 style={{ marginTop: '0.5rem', marginBottom: '1rem', color: 'var(--color-aubergine)' }}>
                The Highlander Sold Value Guarantee
              </h2>
              <p className="text-muted" style={{ marginBottom: '1rem', lineHeight: 1.65 }}>
                Highlander Gold &amp; Silver spends numerous hours each week hand-selecting coins and precious metals
                for superior eye appeal, strike quality, and metal integrity. We represent a broad range of sovereign gold,
                certified Morgan &amp; Peace dollars, ancient coinage, and precious metals.
              </p>
              <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.65 }}>
                <strong>Our Direct Promise:</strong> If at any time a customer proves that a piece they purchased was
                overpriced based on its current market state, HGS will refund the cost difference, or accept the return
                of the item at its full purchased value (as-sold). Acquire with complete confidence knowing your investment
                is backed by genuine integrity and our guarantee.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <span className="badge-verified">
                  <Icons.Check size={13} />
                  Verified Sold Value Guarantee
                </span>
                <span className="badge-verified">
                  <Icons.Check size={13} />
                  Hand-Selected Eye Appeal
                </span>
                <span className="badge-verified">
                  <Icons.Check size={13} />
                  Difference Refund Protection
                </span>
                <span className="badge-verified">
                  <Icons.Check size={13} />
                  0% Montana State Sales Tax
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
