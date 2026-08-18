'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'org';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
      md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
      lg: 'px-5 py-2.5 text-base font-medium rounded-xl gap-2.5',
    };

    const variantClasses = {
      primary:
        'bg-teal-700 hover:bg-teal-800 text-white shadow-xs active:scale-[0.99]',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 active:scale-[0.99]',
      outline:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs active:scale-[0.99]',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 active:scale-[0.99]',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-[0.99]',
      org: 'bg-org-primary hover:opacity-90 text-white shadow-xs active:scale-[0.99]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
