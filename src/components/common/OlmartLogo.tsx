import React from 'react';
import { Link } from 'react-router-dom';

interface OlmartLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  to?: string;
}

export const OlmaIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="60" cy="70" rx="30" ry="34" stroke="currentColor" strokeWidth="8" />
    <path
      d="M60 40C60 40 52 20 60 15C68 20 60 40 60 40Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M55 42C55 42 35 38 40 25C48 25 55 35 55 42Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M65 42C65 42 85 38 80 25C72 25 65 35 65 42Z"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const OlmartLogo: React.FC<OlmartLogoProps> = ({
  className = '',
  iconClassName = 'w-7 h-7 text-stone-900',
  textClassName = 'text-lg font-black tracking-tight text-stone-900 uppercase',
  showText = true,
  to = '/',
}) => {
  const content = (
    <div className={`inline-flex items-center gap-2 group select-none transition-transform active:scale-95 ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-amber-500/10 p-1 group-hover:bg-amber-500/20 transition-colors">
        <OlmaIcon className={`${iconClassName} transition-transform duration-200 group-hover:scale-105`} />
      </div>
      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className={textClassName}>
            OLMA<span className="text-orange-500">RT</span>
          </span>
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} title="Retour à la page principale Olmart" aria-label="Accueil Olmart">
        {content}
      </Link>
    );
  }

  return content;
};
