import React from 'react';
import { PastAuctionItem } from '../../types';
import { SectionHeading } from '../../components/common/SectionHeading';

export interface PastAuctionsSectionProps {
  pastAuctions: PastAuctionItem[];
}

export const PastAuctionsSection: React.FC<PastAuctionsSectionProps> = ({ pastAuctions }) => {
  return (
    <section className="section section-warm" id="past-auctions">
      <div className="container">
        {/* Section Header */}
        <SectionHeading
          align="split"
          eyebrow="• Realized Provenance · Historical Lots •"
          title="Past Auctions &amp; Realized Hammer Archive"
          subtitle="Review certified lots previously hammered and closed by Highlander Gold &amp; Silver with full transaction transparency and permanent provenance."
          metaRight={
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: 'var(--color-gold-dark)',
                textAlign: 'right'
              }}
            >
              VERIFIED HISTORICAL SALES · BIGFORK, MT
            </div>
          }
        />

        {/* Past Auctions Cards Grid */}
        <div className="past-auctions-grid">
          {pastAuctions.map((item) => (
            <div key={item.id} className="past-auction-card reveal-on-scroll">
              <div className="past-auction-image-wrap">
                <span className="past-lot-pill">Lot #{item.lotNumber}</span>
                <span className="past-status-badge">{item.statusText}</span>
                <img
                  src={item.image}
                  alt={item.title}
                  className="past-auction-img"
                  loading="lazy"
                />
              </div>
              <div className="past-auction-body">
                <h3 className="past-auction-title">{item.title}</h3>
                <div className="past-auction-specs">
                  {item.specs.map((spec: string, idx: number) => (
                    <span key={idx} className="past-spec-chip">
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="past-price-row">
                  <div>
                    <span className="past-price-label">Realized Hammer</span>
                    <div className="past-price-val">
                      <span>$</span>
                      {item.realizedPrice.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--color-aubergine)',
                      fontWeight: 600
                    }}
                  >
                    Hammered Sold
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
