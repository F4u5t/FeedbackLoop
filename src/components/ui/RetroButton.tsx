'use client';

import React from 'react';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function RetroButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: RetroButtonProps) {
  const variants = {
    primary: 'border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-black',
    secondary: 'border-terminal-amber text-terminal-amber hover:bg-terminal-amber hover:text-terminal-black',
    danger: 'border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-terminal-black',
    ghost: 'border-terminal-border text-terminal-dim hover:border-terminal-white hover:text-terminal-white',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-6 py-2 text-base',
  };

  return (
    <button
      className={`
        border font-mono font-bold uppercase tracking-wider
        transition-all duration-150 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
        ${variants[variant]}
        ${sizes[size]}
        ${variant === 'primary' ? 'hover:shadow-glow-green' : ''}
        ${variant === 'secondary' ? 'hover:shadow-glow-amber' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-blink">▓</span>
          PROCESSING...
        </span>
      ) : (
        <>[ {children} ]</>
      )}
    </button>
  );
}
