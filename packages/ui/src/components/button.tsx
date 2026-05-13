import * as React from 'react';
import { cn } from './utils';

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'bg-brand-primary text-white hover:bg-brand-accent',
    secondary: 'bg-brand-surface text-brand-glow hover:bg-white/10',
    outline: 'border border-white/20 text-white hover:bg-white/5',
    ghost: 'text-white hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button };
