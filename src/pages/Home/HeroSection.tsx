import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../../utils/icons';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        {/* Enlarged Original Logo with Pop-Up Animation */}
        <div className="hero-logo-showcase">
          <img
            src="/assets/brand/highlander_logo_original.png"
            alt="Highlander Gold & Silver"
            className="hero-enlarged-logo"
            width={1024}
            height={341}
          />
        </div>

        {/* View Collection Call-to-Action with Slide Animation */}
        <div className="hero-cta-wrapper">
          <Link
            to="/collection"
            className="btn btn-hero-view"
            id="heroViewCollectionBtn"
          >
            <span>View Collection</span>
            <Icons.ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};
