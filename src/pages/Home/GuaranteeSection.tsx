import React from 'react';
import { Icons } from '../../utils/icons';

export const GuaranteeSection: React.FC = () => {
  return (
    <section className="section section-cream" id="guarantee">
      <div className="container">
        <div className="guarantee-box reveal-on-scroll">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span className="guarantee-badge">
                <Icons.ShieldCheck size={16} strokeWidth={2.5} />
                Authentic Numismatic Promise
              </span>
              <h2 style={{ marginBottom: '1rem', color: 'var(--color-aubergine)' }}>
                The Highlander Sold Value Guarantee
              </h2>
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                HGS spends numerous hours each week to hand-pick coins of high quality, regardless of the grading
                company's MS value printed on each slab. We evaluate coins for their true elements of luster, strike,
                eye appeal, and metal integrity.
              </p>
              <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                <strong>Our Direct Promise:</strong> If at any time a customer proves that a coin they purchased was
                over-priced based on its current market state, HGS will refund the cost difference, or accept the return
                of the item at its full purchased value (as-sold). Buy with complete confidence knowing your investment
                is backed by genuine numismatic honor.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <span className="badge-verified">
                  Verified Sold Value Guarantee
                </span>
                <span className="badge-verified">
                  Hand-Selected Eye Appeal
                </span>
                <span className="badge-verified">
                  Difference Refund Protection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
