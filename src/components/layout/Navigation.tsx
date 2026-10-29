import React from 'react';
import { NavLink } from 'react-router-dom';

export interface NavigationProps {
  onLinkClick?: () => void;
  className?: string;
}

export const NAVIGATION_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Collection', path: '/collection' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

export const Navigation: React.FC<NavigationProps> = ({
  onLinkClick,
  className = 'nav-desktop'
}) => {
  return (
    <nav className={className} aria-label="Primary Navigation">
      {NAVIGATION_LINKS.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.path === '/'}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onLinkClick}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};
