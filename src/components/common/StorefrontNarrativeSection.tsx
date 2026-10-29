import React from 'react';
import { BUSINESS_INFO } from '../../data/businessInfo';
import { Icons } from '../../utils/icons';

interface StorefrontNarrativeSectionProps {
  className?: string;
  id?: string;
  leftContent?: React.ReactNode;
}

export const StorefrontNarrativeSection: React.FC<StorefrontNarrativeSectionProps> = ({
  className = '',
  id = 'storefront-model',
  leftContent
}) => {
  return (
    <section className={`section section-warm storefront-narrative-section ${className}`} id={id}>
      <div className="container">
        <div className="storefront-narrative-grid">
          {/* Left Column: Customer Inquiry Form (when provided) or Default Brand Narrative */}
          {leftContent ? (
            <div className="storefront-left-custom-container">
              {leftContent}
            </div>
          ) : (
            <div className="storefront-narrative-content">
              <h2 className="storefront-narrative-title">
                A Transparent Model Built for Serious Collectors
              </h2>

              <p className="storefront-narrative-lead">
                Highlander Gold &amp; Silver was established to solve the frustrations collectors encounter with traditional auction platforms: opaque buyer premiums, bidding frenzies, artificial reserves, and prolonged listing delays.
              </p>

              <div className="storefront-narrative-body-wrap">
                <p className="storefront-narrative-body">
                  Operating from our physical location at Jewel Basin Armory in Bigfork, Montana, we offer an ongoing online and in-person storefront. When you find a sovereign gold trophy or certified Morgan dollar you desire, you can purchase it instantly at a guaranteed price with direct settlement.
                </p>

                <p className="storefront-narrative-body">
                  Every single piece in our inventory is evaluated personally by our numismatic specialists for strike crispness, cartwheel luster, original surface integrity, and metal purity before being cataloged.
                </p>
              </div>

              {/* Connecting Trust Anchors */}
              <div className="storefront-trust-strip">
                <div className="storefront-trust-item">
                  <div className="trust-check-icon">
                    <Icons.Check size={14} strokeWidth={2.5} />
                  </div>
                  <span>Guaranteed Instant Price</span>
                </div>
                <div className="storefront-trust-item">
                  <div className="trust-check-icon">
                    <Icons.Check size={14} strokeWidth={2.5} />
                  </div>
                  <span>Expert In-House Vetting</span>
                </div>
                <div className="storefront-trust-item">
                  <div className="trust-check-icon">
                    <Icons.Check size={14} strokeWidth={2.5} />
                  </div>
                  <span>Direct Flathead Consultation</span>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Redesigned "Storefront at a Glance" Card */}
          <div className="storefront-glance-card-container">
            <div className="storefront-glance-card">
              <div className="glance-card-header">
                <div className="glance-header-top">
                  <span className="glance-header-badge">
                    <Icons.Sparkles size={12} />
                    <span>Official Armory Specifications</span>
                  </span>
                </div>
                <h3 className="glance-card-title">Storefront At A Glance</h3>
                <p className="glance-card-subtitle">
                  Direct physical and digital operations based in Flathead County, Montana.
                </p>
              </div>

              <div className="glance-items-list">
                {/* 1. Location */}
                <div className="glance-row-item">
                  <div className="glance-item-icon">
                    <Icons.MapPin size={18} />
                  </div>
                  <div className="glance-item-info">
                    <span className="glance-item-label">Location</span>
                    <span className="glance-item-val">{BUSINESS_INFO.street}, {BUSINESS_INFO.city}, {BUSINESS_INFO.state} {BUSINESS_INFO.zip}</span>
                    <span className="glance-item-note">Flathead County physical facility · Private Consultations</span>
                  </div>
                </div>

                {/* 2. Direct Line */}
                <div className="glance-row-item">
                  <div className="glance-item-icon">
                    <Icons.Phone size={18} />
                  </div>
                  <div className="glance-item-info">
                    <span className="glance-item-label">Direct Line</span>
                    <span className="glance-item-val">{BUSINESS_INFO.phoneFormatted} (Mon–Sat)</span>
                    <span className="glance-item-note">Monday – Saturday · {BUSINESS_INFO.terms.hours}</span>
                  </div>
                </div>

                {/* 3. Sales Tax */}
                <div className="glance-row-item">
                  <div className="glance-item-icon">
                    <Icons.ShieldCheck size={18} />
                  </div>
                  <div className="glance-item-info">
                    <span className="glance-item-label">Sales Tax</span>
                    <span className="glance-item-val">0% Montana State Sales Tax on All Metals</span>

                  </div>
                </div>

                {/* 4. Settlement */}
                <div className="glance-row-item">
                  <div className="glance-item-icon">
                    <Icons.CreditCard size={18} />
                  </div>
                  <div className="glance-item-info">
                    <span className="glance-item-label">Settlement</span>
                    <span className="glance-item-val">Transparent 15% Fee via PayPal or Wire</span>
                    <span className="glance-item-note">Comprehensive buyer protection or high-value incoming wire fee credit</span>
                  </div>
                </div>

                {/* 5. Shipping */}
                <div className="glance-row-item">
                  <div className="glance-item-icon">
                    <Icons.Package size={18} />
                  </div>
                  <div className="glance-item-info">
                    <span className="glance-item-label">Shipping</span>
                    <span className="glance-item-val">In-House Insured USPS Priority Packaging</span>
                    <span className="glance-item-note">Discreet packaging with tracking; signature required on orders exceeding $500</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Trust Lock */}
              <div className="glance-card-footer">
                <div className="glance-footer-badge">
                  <Icons.Lock size={13} />
                  <span>Verified Storefront Security · Direct Settlement Model</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorefrontNarrativeSection;
