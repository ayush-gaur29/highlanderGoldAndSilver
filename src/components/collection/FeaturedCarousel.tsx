import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InventoryItem } from '../../types';
import { ItemCard } from './ItemCard';
import { Icons } from '../../utils/icons';

interface FeaturedCarouselProps {
  items: InventoryItem[];
  onInspectItem?: (item: InventoryItem) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  items,
  onInspectItem
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [slideDistance, setSlideDistance] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  // Responsive visible count: Desktop 3, Tablet 2, Mobile 1
  const updateMetrics = useCallback(() => {
    const width = window.innerWidth;
    let count = 3;
    if (width < 640) {
      count = 1;
    } else if (width < 1024) {
      count = 2;
    }
    setVisibleCount(count);

    if (trackRef.current && trackRef.current.children.length > 0) {
      const firstSlide = trackRef.current.children[0] as HTMLElement;
      const slideW = firstSlide.getBoundingClientRect().width;
      const style = window.getComputedStyle(trackRef.current);
      const gap = parseFloat(style.gap) || 24;
      setSlideDistance(slideW + gap);
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics, items.length]);

  const maxIndex = Math.max(0, items.length - visibleCount);

  // Auto-clamp index when resizing viewports
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= maxIndex;

  // Touch Swipe Handling on mobile / tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null) {
      if (touchDeltaX.current < -45) {
        handleNext();
      } else if (touchDeltaX.current > 45) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // Accessible Keyboard arrow controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const translateX = currentIndex * slideDistance;

  return (
    <div
      className="featured-carousel-container"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Featured Precious Metals Carousel"
      role="region"
    >
      {/* Header Row with Title, Subtitle and Arrow Controls */}
      <div className="section-header-row featured-header-row">
        <div className="featured-header-text">
          <h2 className="section-title">Featured Precious Metals</h2>
          <p className="section-subtitle">
            Hand-picked sovereign gold, certified Morgan dollars, and pure silver bullion backed by verified provenance.
          </p>
        </div>

        {/* Arrow Navigation Controls (‹ and ›) */}
        <div className="carousel-nav-controls">
          <div className="carousel-counter-badge" aria-live="polite">
            <span className="counter-current">{currentIndex + 1}</span>
            <span className="counter-sep">/</span>
            <span className="counter-total">{maxIndex + 1}</span>
          </div>

          <div className="carousel-arrow-buttons">
            <button
              type="button"
              className="carousel-arrow-btn carousel-arrow-prev"
              onClick={handlePrev}
              disabled={isAtStart}
              aria-label="Previous products"
              title={isAtStart ? 'At beginning of collection' : 'Previous products (‹)'}
            >
              <Icons.ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              className="carousel-arrow-btn carousel-arrow-next"
              onClick={handleNext}
              disabled={isAtEnd}
              aria-label="Next products"
              title={isAtEnd ? 'At end of collection' : 'Next products (›)'}
            >
              <Icons.ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Viewport and Sliding Track */}
      <div
        className="carousel-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={trackRef}
          className="carousel-track"
          style={{
            transform: `translateX(-${translateX}px)`
          }}
        >
          {items.map((item) => (
            <div className="carousel-slide" key={item.id}>
              <ItemCard item={item} onClick={onInspectItem} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots Indicator */}
      {maxIndex > 0 && (
        <div className="carousel-dots-indicator" role="tablist" aria-label="Carousel pagination">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={currentIndex === idx}
              className={`carousel-dot ${currentIndex === idx ? 'is-active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCarousel;
