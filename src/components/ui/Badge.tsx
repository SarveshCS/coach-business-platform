'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'active'
    | 'success'
    | 'pending'
    | 'warning'
    | 'danger'
    | 'cancelled'
    | 'info'
    | 'purple'
    | 'amber'
    | 'org';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-md font-medium',
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-semibold',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    cancelled: 'bg-slate-100 text-slate-400 border border-slate-200 line-through',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    org: 'bg-teal-50 text-teal-800 border border-teal-200',
  };

  const dotColors = {
    default: 'bg-slate-400',
    active: 'bg-emerald-500',
    success: 'bg-emerald-500',
    pending: 'bg-amber-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    cancelled: 'bg-slate-400',
    info: 'bg-sky-500',
    purple: 'bg-indigo-500',
    amber: 'bg-amber-500',
    org: 'bg-teal-600',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 leading-none transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      <span>{children}</span>
    </span>
  );
};
