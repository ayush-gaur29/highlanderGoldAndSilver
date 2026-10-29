import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../utils/icons';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { StorefrontNarrativeSection } from '../components/common/StorefrontNarrativeSection';

export const AboutPage: React.FC = () => {
  useScrollReveal();

  return (
    <main className="about-page-main">
      {/* Page Header Banner with Right-Side Jewel Basin Armory Heritage Image */}
      <section className="page-header-banner">
        <div className="container">
          <div className="page-banner-grid">
            <div className="page-banner-content">
              <nav className="page-breadcrumbs" aria-label="Breadcrumb">
                <Link to="/" className="breadcrumb-link">Home</Link>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">About</span>
              </nav>


              <h1 className="page-banner-title">Heritage, Integrity &amp; Numismatic Precision</h1>
              <p className="page-banner-desc">
                Founded on transparency, decades of precious metals experience, and Montana hospitality. We operate as an ongoing storefront rather than a high-pressure auction house.
              </p>

              {/* Quick Trust Highlights */}
              <div className="collection-stats-strip">
                <div className="stat-pill">
                  <Icons.MapPin size={14} />
                  <span>Flathead County Storefront</span>
                </div>
                <div className="stat-pill">
                  <Icons.ShieldCheck size={14} />
                  <span>Market Value Guarantee</span>
                </div>
                <div className="stat-pill">
                  <Icons.Check size={14} />
                  <span>Independent Grading</span>
                </div>
              </div>
            </div>

            {/* Right-Side Relevant Image Showcase */}
            <div className="page-banner-media">
              <div className="page-banner-media-box">
                <img
                  src="/assets/brand/about_heritage_hero.jpg"
                  alt="Jewel Basin Armory Precious Metals Specialist and Numismatic Inspection"
                  className="page-banner-img"
                  width={1920}
                  height={1080}
                  loading="eager"
                />
              </div>
              <div className="page-banner-badge">
                <div className="banner-badge-icon">
                  <Icons.Sparkles size={16} />
                </div>
                <span className="banner-badge-text">Jewel Basin Armory Numismatic Heritage</span>
                <span className="banner-badge-sub">Est. Montana</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About & Storefront Narrative Section — Refined 2-Column Layout */}
      <StorefrontNarrativeSection />

      {/* 3 Pillars of Numismatic Excellence */}
      <section className="section section-warm">
        <div className="container">
          <div className="section-header-center">

            <h2 className="section-title">The Three Pillars of Highlander Quality</h2>
            <p className="section-subtitle">
              Every coin and bullion bar in our vault must meet three rigorous standards before being made available for acquisition.
            </p>
          </div>

          <div className="pillars-grid" style={{ marginTop: '3rem' }}>
            <div className="pillar-card">
              <div className="pillar-num">01</div>
              <h3 className="pillar-title">Hand-Selected Eye Appeal</h3>
              <p className="pillar-desc">
                We spend numerous hours each week inspecting coins individually. We look beyond basic numeric grades to assess field cleanliness, original mint luster, peripheral toning, and sharp strike definition that true connoisseurs appreciate.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-num">02</div>
              <h3 className="pillar-title">Certified Grading &amp; Authenticity</h3>
              <p className="pillar-desc">
                Our numismatic pieces carry certification from leading independent services including NGC, PCGS, and historical grading services, encapsulated in tamper-evident holders with guaranteed strike authenticity and pedigree.
              </p>
            </div>

            <div className="pillar-card">
              <div className="pillar-num">03</div>
              <h3 className="pillar-title">Precious Metal Integrity</h3>
              <p className="pillar-desc">
                From sovereign .999 pure gold strikes to 90% Morgan silver dollars and 10 oz Scottsdale bullion bars, all precious metal weights, dimensions, and alloy purities are verified with precision acoustic and magnetic testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee & Terms Deep Dive */}
      <section className="section section-body">
        <div className="container">
          <div className="guarantee-box reveal-on-scroll is-revealed">
            <span className="guarantee-badge">
              <Icons.ShieldCheck size={16} strokeWidth={2.5} />
              Our Unconditional Customer Promise
            </span>
            <h2 style={{ marginTop: '0.65rem', marginBottom: '1.25rem', color: 'var(--color-aubergine)' }}>
              The Highlander Sold Value Guarantee
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              <p>
                <strong>Fair Market Value Protection:</strong> We stand entirely behind every valuation in our catalog. If at any time a customer proves that a piece purchased from our storefront was overpriced based on its current market state, Highlander Gold &amp; Silver will refund the cost difference, or accept return of the item at its full purchased value (as-sold).
              </p>
              <p>
                <strong>In-House Insured Packaging:</strong> We do not outsource fulfillment to third-party shipping brokers. All packaging is performed in-house by our team using heavy-gauge, discrete tamper-resistant packaging. Every shipment travels via USPS Priority or Ground, fully insured with tracking. Packages valued above $500 require a signature upon delivery.
              </p>
              <p>
                <strong>Montana 0% Sales Tax Advantage:</strong> Because our operations are based entirely within Flathead County, Montana, transactions are exempt from state sales tax. For large gold and bullion acquisitions, this represents hundreds or thousands in direct savings compared to out-of-state merchants.
              </p>
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/collection" className="btn btn-gold">
                <span>Explore Storefront Inventory</span>
                <Icons.ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn-silver">
                <span>Contact Jewel Basin Armory</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
