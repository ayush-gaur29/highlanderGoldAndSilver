import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center' | 'split';
  metaRight?: React.ReactNode;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  metaRight,
  className = ''
}) => {
  if (align === 'split') {
    return (
      <div className={`collection-header-row reveal-on-scroll ${className}`}>
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 style={{ marginTop: '0.35rem' }}>{title}</h2>
          {subtitle && (
            <p className="text-muted" style={{ marginTop: '0.25rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        {metaRight && <div>{metaRight}</div>}
      </div>
    );
  }

  if (align === 'center') {
    return (
      <div
        style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}
        className={`reveal-on-scroll ${className}`}
      >
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 style={{ marginTop: '0.5rem', marginBottom: '0.85rem' }}>{title}</h2>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div className={`reveal-on-scroll ${className}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>{title}</h2>
      {subtitle && <p className="text-muted">{subtitle}</p>}
    </div>
  );
};
