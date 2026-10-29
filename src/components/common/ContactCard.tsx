import React from 'react';
import { Icons } from '../../utils/icons';

export interface ContactCardProps {
  label: string;
  title: string;
  text: React.ReactNode;
  actionText: string;
  actionHref: string;
  isExternal?: boolean;
  iconName: 'mapPin' | 'phone' | 'mail' | 'creditCard';
  titleStyle?: React.CSSProperties;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  label,
  title,
  text,
  actionText,
  actionHref,
  isExternal = false,
  iconName,
  titleStyle
}) => {
  const renderIcon = () => {
    switch (iconName) {
      case 'mapPin':
        return <Icons.MapPin size={20} />;
      case 'phone':
        return <Icons.Phone size={20} />;
      case 'mail':
        return <Icons.Mail size={20} />;
      case 'creditCard':
        return <Icons.CreditCard size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="contact-info-card reveal-on-scroll">
      <div className="contact-card-icon-wrap">{renderIcon()}</div>
      <div className="contact-card-label">{label}</div>
      <h3 className="contact-card-title" style={titleStyle}>
        {title}
      </h3>
      <p className="contact-card-text">{text}</p>
      <a
        href={actionHref}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="contact-card-action"
      >
        <span>{actionText}</span>
        {isExternal ? (
          <Icons.ExternalLink size={12} strokeWidth={2.5} />
        ) : (
          <Icons.ArrowRight size={12} strokeWidth={2.5} />
        )}
      </a>
    </div>
  );
};
