import React from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryItem } from '../../types';
import { Icons } from '../../utils/icons';
import { getProductPath } from '../../utils/slug';

export interface ItemCardProps {
  item: InventoryItem;
  onClick?: (item: InventoryItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const navigate = useNavigate();
  const isUnavailable = item.status === 'Unavailable';
  const productPath = getProductPath(item);

  const handleCardClick = () => {
    if (onClick) {
      onClick(item);
    } else {
      navigate(productPath);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      className={`item-card ${isUnavailable ? 'item-card-unavailable' : ''}`}
      data-id={item.id}
      tabIndex={0}
      role="link"
      aria-label={`View details for ${item.title}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* Media Box with Item Badge & Subtle Warm Neutral / Silver Background */}
      <div className="card-media-box">
        <div className="lot-number-badge">
          <span className="lot-badge-text">Item #{item.lotNumber}</span>
        </div>

        <div className="category-tag-badge">{item.category}</div>

        {isUnavailable && (
          <div className="unavailable-watermark-badge">
            Currently Unavailable
          </div>
        )}

        <img
          src={item.featuredImage}
          alt={item.title}
          className="card-img"
          loading="lazy"
        />
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Technical specifications pills */}
        <div className="card-spec-tags">
          {item.grade && (
            <span className="spec-pill spec-pill-gold">
              <Icons.ShieldCheck size={11} />
              {item.grade}
            </span>
          )}
          {item.purity && (
            <span className="spec-pill spec-pill-silver">{item.purity}</span>
          )}
        </div>

        <h3 className="card-title" title={item.title}>
          {item.title}
        </h3>

        {/* Item Description */}
        <p className="card-description-preview">
          {item.lead || item.description}
        </p>

        {/* Footer: Price & View Details Action */}
        <div className="card-footer">
          <div className="card-price-box">
            <span className="price-label">Storefront Price</span>
            <span className="price-amount">{item.priceFormatted}</span>
            {isUnavailable && (
              <span className="status-note-label">Out of Stock</span>
            )}
          </div>

          <div className="card-actions-group">
            <span className="card-inspect-btn" aria-hidden="true">
              <span>View Piece</span>
              <Icons.ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

