import * as React from 'react';
import { cn } from './utils';

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary',
      className,
    )}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input };
