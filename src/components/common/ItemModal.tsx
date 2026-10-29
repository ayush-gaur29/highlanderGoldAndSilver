import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { Icons } from '../../utils/icons';
import { BUSINESS_INFO } from '../../data/businessInfo';
import { generatePayPalPaymentUrl, calculateSettlement } from '../../utils/payment';
import { formatAmountNumber, generateEmailInquiryUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

export interface ItemModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const isUnavailable = item.status === 'Unavailable';

  const images = item.additionalImages && item.additionalImages.length > 0
    ? item.additionalImages
    : [item.featuredImage];

  const settlement = calculateSettlement(item.price, BUSINESS_INFO.terms.buyersPremiumPercent);
  const payPalUrl = generatePayPalPaymentUrl(BUSINESS_INFO.payPalUrl, settlement.totalSettlement);
  const emailInquiryUrl = generateEmailInquiryUrl(BUSINESS_INFO.email, item);

  const handleAddToCart = () => {
    if (!isUnavailable) {
      addToCart(item);
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay open"
      id="itemModalOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalItemTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-container">
        <button
          type="button"
          className="modal-close-btn"
          id="modalCloseBtn"
          aria-label="Close item details"
          onClick={onClose}
        >
          <Icons.Close size={20} />
        </button>

        <div id="modalDynamicContent">
          <div className="modal-grid">
            {/* Media Gallery Column */}
            <div className="modal-gallery-side">
              <div className="modal-main-img-box">
                <img
                  id="modalMainImage"
                  src={images[currentImageIndex] || item.featuredImage}
                  alt={item.title}
                  className="modal-main-img"
                />
              </div>

              {images.length > 1 && (
                <div className="modal-thumb-row">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`modal-thumb ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', textAlign: 'center', width: '100%' }}>
                <span className="badge-verified">
                  <Icons.ShieldCheck size={14} />
                  Certified &amp; Inspected by HGS
                </span>
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--text-tertiary)',
                    marginTop: '0.4rem'
                  }}
                >
                  Bigfork, Montana Armory Inventory
                </p>
              </div>
            </div>

            {/* Information Column */}
            <div className="modal-info-side">
              <div className="modal-lot-tag">
                Item #{item.lotNumber} · {item.category}
              </div>

              <h2 className="modal-title" id="modalItemTitle">
                {item.title}
              </h2>

              {/* Price Card */}
              <div className="modal-price-card">
                <div>
                  <div className="price-label">Storefront Price</div>
                  <div className="price-amount">{item.priceFormatted}</div>
                  {isUnavailable ? (
                    <div className="modal-estimate" style={{ color: '#D97706', fontWeight: 600 }}>
                      Currently Unavailable · Returning Soon
                    </div>
                  ) : item.estimateRange ? (
                    <div className="modal-estimate">Market Range: {item.estimateRange}</div>
                  ) : null}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="price-label">Settlement with 15% Fee</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--color-gold-dark)',
                      fontSize: '1.1rem'
                    }}
                  >
                    ${settlement.totalSettlement.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                    Montana 0% Sales Tax
                  </div>
                </div>
              </div>

              {/* Verified Specifications Table */}
              <table className="modal-specs-table">
                <tbody>
                  <tr>
                    <th>Item #</th>
                    <td>Item #{item.lotNumber}</td>
                  </tr>
                  <tr>
                    <th>Classification</th>
                    <td>
                      {item.category} ({item.metal})
                    </td>
                  </tr>
                  {item.purity && (
                    <tr>
                      <th>Purity / Metal</th>
                      <td>{item.purity}</td>
                    </tr>
                  )}
                  {item.grade && (
                    <tr>
                      <th>Certified Grade</th>
                      <td>{item.grade}</td>
                    </tr>
                  )}
                  {item.mintage && (
                    <tr>
                      <th>Mintage / Issue</th>
                      <td>{item.mintage}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Fulfillment</th>
                    <td>In-House Insured USPS Priority Packaging</td>
                  </tr>
                </tbody>
              </table>

              {/* Description */}
              <div className="modal-description">
                <p>{item.description}</p>
                {item.paymentNote && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(234, 170, 0, 0.08)',
                      borderLeft: '3px solid var(--color-gold)',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <strong>Acquisition Terms:</strong> {item.paymentNote}
                  </div>
                )}
              </div>

              {/* Sold Value Promise Callout */}
              <div
                style={{
                  background: '#FAF9F6',
                  border: '1px solid var(--color-silver-border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}
              >
                <strong
                  style={{
                    color: 'var(--color-aubergine)',
                    display: 'block',
                    marginBottom: '0.2rem'
                  }}
                >
                  HGS Sold Value Guarantee:
                </strong>
                If proof is presented that any purchased piece was overpriced based on current market
                state, HGS refunds the difference or accepts as-sold return.
              </div>

              {/* Action CTAs */}
              <div className="modal-actions">
                {!isUnavailable ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-gold"
                      style={{ flex: 1.2 }}
                      onClick={handleAddToCart}
                    >
                      <Icons.ShoppingBag size={16} />
                      Add to Cart (${formatAmountNumber(item.price)})
                    </button>

                    <a
                      href={payPalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                    >
                      <Icons.CreditCard size={16} />
                      Buy Now via PayPal
                    </a>
                  </>
                ) : (
                  <a
                    href={emailInquiryUrl}
                    className="btn btn-gold"
                    style={{ flex: 1 }}
                  >
                    <Icons.Mail size={16} />
                    Restock Inquiry / Notification
                  </a>
                )}
              </div>

              <p
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-tertiary)',
                  textAlign: 'center',
                  marginTop: '0.75rem'
                }}
              >
                Direct settlement via verified PayPal portal:{' '}
                <a
                  href={BUSINESS_INFO.payPalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-aubergine)', textDecoration: 'underline' }}
                >
                  paypal.me/HighlanderGoldSilver
                </a>{' '}
                · Phone:{' '}
                <a
                  href={`tel:${BUSINESS_INFO.phone}`}
                  style={{ color: 'var(--color-aubergine)' }}
                >
                  {BUSINESS_INFO.phoneFormatted}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
