'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, children, className = '', id, ...props }, ref) => {
    const selectId = id || label ? `select_${label?.toLowerCase().replace(/\s+/g, '_')}` : undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 tracking-wide">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={`w-full appearance-none bg-white border text-slate-900 text-sm rounded-lg px-3.5 py-2 pr-10 transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer ${
              error
                ? 'border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-300 hover:border-slate-400 focus:border-teal-600 focus:ring-teal-600/10'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white text-slate-900">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
        {!error && helperText && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
