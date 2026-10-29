import React from 'react';
import { ContactCard } from '../../components/common/ContactCard';
import { BUSINESS_INFO } from '../../data/businessInfo';
import { Icons } from '../../utils/icons';

export const ContactSection: React.FC = () => {
  return (
    <section className="section section-light contact-section" id="contact">
      <div className="container">
        {/* Hero / Cover Banner */}
        <div className="contact-cover-box reveal-on-scroll is-revealed">
          <img
            src="/assets/brand/contact_cover_precious_metals.jpg"
            alt="Highlander Precious Metals Reserve"
            className="contact-cover-img"
          />
          <div className="contact-cover-overlay" />
          <div className="contact-cover-content">
            <span className="contact-cover-eyebrow">
              <Icons.Star size={13} fill="currentColor" />
              Direct Storefront &amp; Collector Liaison · Bigfork, Montana
            </span>
            <h2 className="contact-cover-title">
              Connect with <span className="gradient-text-gold">Highlander Gold &amp; Silver</span>
            </h2>
            <p className="contact-cover-desc">
              Whether you are inquiring about a specific inventory piece, coordinating high-value bank wire settlement,
              or requesting private vault consultation in Flathead County, we provide direct, confidential assistance.
            </p>
          </div>
        </div>

        {/* Spacious 4-Card Contact Grid */}
        <div className="contact-cards-grid">
          {/* Card 1: Physical Armory */}
          <ContactCard
            iconName="mapPin"
            label="Physical Storehouse"
            title="Bigfork, Montana"
            text={
              <>
                {BUSINESS_INFO.street}<br />
                {BUSINESS_INFO.city}, {BUSINESS_INFO.state} {BUSINESS_INFO.zip}<br />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                  Flathead County · Private Consultations
                </span>
              </>
            }
            actionText="Get Directions"
            actionHref={`https://maps.google.com/?q=${encodeURIComponent(
              `${BUSINESS_INFO.street} ${BUSINESS_INFO.city} ${BUSINESS_INFO.state} ${BUSINESS_INFO.zip}`
            )}`}
            isExternal
          />

          {/* Card 2: Telephone */}
          <ContactCard
            iconName="phone"
            label="Direct Telephone"
            title={BUSINESS_INFO.phoneFormatted}
            text={
              <>
                Monday – Saturday<br />
                {BUSINESS_INFO.terms.hours}<br />
                <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                  Direct voice line for collectors &amp; buyers
                </span>
              </>
            }
            actionText={`Call ${BUSINESS_INFO.phoneFormatted}`}
            actionHref={`tel:${BUSINESS_INFO.phone}`}
          />

          {/* Card 3: Direct Email */}
          <ContactCard
            iconName="mail"
            label="Electronic Mail"
            title={BUSINESS_INFO.email}
            titleStyle={{ wordBreak: 'break-all', fontSize: '0.95rem' }}
            text="Inventory inquiries, high-value bullion requests &amp; provenance questions answered directly."
            actionText="Email Us"
            actionHref={`mailto:${BUSINESS_INFO.email}`}
          />

          {/* Card 4: PayPal Settlement Gateway */}
          <ContactCard
            iconName="creditCard"
            label="Settlement Gateway"
            title="paypal.me/HighlanderGoldSilver"
            titleStyle={{ wordBreak: 'break-all', fontSize: '0.92rem' }}
            text="Official verified PayPal self-pay portal with comprehensive buyer protection."
            actionText="Visit PayPal"
            actionHref={BUSINESS_INFO.payPalUrl}
            isExternal
          />
        </div>

        {/* Clean metallic separator */}
        <hr className="hairline-silver" style={{ marginTop: 'clamp(3rem, 5vw, 4.5rem)' }} />
      </div>
    </section>
  );
};
