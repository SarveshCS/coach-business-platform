'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'flat' | 'bordered' | 'elevated';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border border-slate-200/80 shadow-xs',
    flat: 'bg-slate-50/80 border border-slate-200/60',
    bordered: 'bg-white border border-slate-300',
    elevated: 'bg-white border border-slate-200 shadow-md',
  };

  return (
    <div
      className={`rounded-xl p-5 md:p-6 transition-all duration-150 text-slate-900 ${variantClasses[variant]} ${
        hoverEffect ? 'hover:border-slate-300 hover:shadow-sm' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  action?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  action,
}) => {
  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
          </div>
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {trend && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                trend.isPositive
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border border-rose-200'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
            {trend.label && <span className="text-slate-500">{trend.label}</span>}
          </div>
        )}
        {!trend && subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {action && <div>{action}</div>}
      </div>
    </Card>
  );
};
