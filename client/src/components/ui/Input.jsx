import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'block w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
        error && 'border-red-400 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'block w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
        error && 'border-red-400 focus:ring-red-500',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed resize-y min-h-20',
        error && 'border-red-400 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
});

export function FormField({ label, required, error, hint, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>}
    </div>
  );
}

