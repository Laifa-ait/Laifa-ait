import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon | React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            {renderIcon()}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-zinc-50 border border-zinc-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 block ${icon ? 'pl-11' : 'px-4'} py-3 transition-colors ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
