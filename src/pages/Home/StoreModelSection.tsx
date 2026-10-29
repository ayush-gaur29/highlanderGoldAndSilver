import React from 'react';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Icons } from '../../utils/icons';

export const StoreModelSection: React.FC = () => {
  return (
    <section className="section section-warm" id="store-model">
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="The Highlander Advantage"
          title="A Modern Precious-Metals Storefront"
          subtitle="Highlander Gold &amp; Silver operates as an ongoing online store rather than a standard auction. We don't force you into multi-day bidding wars against ticking clocks."
        />

        <div className="store-highlights-grid">
          <div className="highlight-card reveal-on-scroll">
            <div className="highlight-icon-box">
              <Icons.Clock size={22} />
            </div>
            <h3 className="highlight-title">Instant Close On Request</h3>
            <p className="highlight-text">
              Place an offer or check-out request on any item. HGS halts the online listing to close the sale directly
              for you, eliminating waiting days for an auction block to expire.
            </p>
          </div>

          <div className="highlight-card reveal-on-scroll">
            <div className="highlight-icon-box">
              <Icons.ShieldCheck size={22} />
            </div>
            <h3 className="highlight-title">Numismatic Guarantee</h3>
            <p className="highlight-text">
              Every coin is hand-picked for true luster and detail. If you present proof that a coin purchased was
              overpriced based on its market state, HGS refunds the difference or accepts the return.
            </p>
          </div>

          <div className="highlight-card reveal-on-scroll">
            <div className="highlight-icon-box">
              <Icons.Package size={22} />
            </div>
            <h3 className="highlight-title">In-House Insured Delivery</h3>
            <p className="highlight-text">
              All packaging and fulfillment is performed in-house from our Bigfork armory. Every parcel ships via USPS
              Priority or Ground, fully insured with delivery confirmation.
            </p>
          </div>

          <div className="highlight-card reveal-on-scroll">
            <div className="highlight-icon-box">
              <Icons.CreditCard size={22} />
            </div>
            <h3 className="highlight-title">Transparent 15% Premium</h3>
            <p className="highlight-text">
              Flat 15% Buyer's Premium across all inventory with 0% Montana sales tax. Self-pay easily via PayPal with
              pre-calculated settlements, or wire credit on high-value lots.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
