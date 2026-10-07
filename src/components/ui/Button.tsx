import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon | React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-sans font-bold uppercase tracking-widest rtl:tracking-normal transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[10px] rounded-lg gap-1.5",
    md: "px-4 py-2.5 text-xs rounded-xl gap-2",
    lg: "px-6 py-3.5 text-sm rounded-2xl gap-2.5",
  };

  const variantClasses = {
    primary: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm border border-emerald-600",
    secondary: "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200",
    outline: "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300",
    danger: "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 border border-transparent",
  };

  const finalClassName = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return (
      <IconComponent
        className={
          size === 'sm' ? "w-3 h-3 shrink-0" : size === 'lg' ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0"
        }
      />
    );
  };

  return (
    <button className={finalClassName} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
      ) : iconPosition === 'left' ? (
        renderIcon()
      ) : null}
      
      {children ? <span>{children}</span> : null}
      
      {!isLoading && iconPosition === 'right' && renderIcon()}
    </button>
  );
};
