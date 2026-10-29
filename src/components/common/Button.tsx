import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'gold' | 'header-cta' | 'sm';
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  href,
  target,
  rel,
  icon,
  iconPosition = 'right',
  ...props
}) => {
  let variantClass = 'btn btn-primary';
  if (variant === 'outline') variantClass = 'btn btn-outline';
  else if (variant === 'gold') variantClass = 'btn btn-gold';
  else if (variant === 'header-cta') variantClass = 'btn-header-cta';
  else if (variant === 'sm') variantClass = 'btn btn-gold btn-sm';

  const combinedClasses = `${variantClass} ${className}`.trim();

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={combinedClasses}>
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
};
