import { useEffect, useRef } from 'react';

/**
 * Hook to render the character-by-character typewriter effect on the hero heading
 * with zero layout shift and accessible full text for screen readers.
 */
export function useTypewriter() {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = containerRef.current;
    if (!heading) return;

    // Accessibility label
    heading.setAttribute('aria-label', 'Curated Precious Metals & Sovereign Rarities');

    // Honor prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      heading.innerHTML = `Curated <span class="text-gradient-brand">Precious Metals</span> &amp; Sovereign Rarities`;
      return;
    }

    const segments = [
      { text: 'Curated ', className: null },
      { text: 'Precious Metals', className: 'text-gradient-brand' },
      { text: ' & Sovereign Rarities', className: null }
    ];

    heading.innerHTML = '';
    const charSpans: HTMLSpanElement[] = [];

    segments.forEach(seg => {
      let container: HTMLElement = heading;
      if (seg.className) {
        const span = document.createElement('span');
        span.className = seg.className;
        heading.appendChild(span);
        container = span;
      }

      for (let i = 0; i < seg.text.length; i++) {
        const char = seg.text[i];
        const charSpan = document.createElement('span');
        charSpan.className = 'typewriter-char';
        charSpan.style.visibility = 'hidden';
        charSpan.textContent = char;
        container.appendChild(charSpan);
        charSpans.push(charSpan);
      }
    });

    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    heading.appendChild(cursor);

    const startDelay = 220;
    const charInterval = 38;
    let currentIndex = 0;

    const startTimeout = setTimeout(() => {
      const timer = setInterval(() => {
        if (currentIndex < charSpans.length) {
          const span = charSpans[currentIndex];
          span.style.visibility = 'visible';

          if (span.parentNode) {
            span.parentNode.insertBefore(cursor, span.nextSibling);
          }

          currentIndex++;
        } else {
          clearInterval(timer);

          setTimeout(() => {
            cursor.classList.add('is-hidden');
            setTimeout(() => {
              cursor.remove();
            }, 400);
          }, 500);
        }
      }, charInterval);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
    };
  }, []);

  return containerRef;
}
