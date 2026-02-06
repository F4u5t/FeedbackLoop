'use client';

import React from 'react';

interface RetroCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'danger';
}

export function RetroCard({ title, children, className = '', variant = 'default' }: RetroCardProps) {
  const borderColor = {
    default: 'border-terminal-border',
    highlight: 'border-terminal-green',
    danger: 'border-terminal-red',
  }[variant];

  const titleColor = {
    default: 'text-terminal-green',
    highlight: 'text-terminal-amber',
    danger: 'text-terminal-red',
  }[variant];

  return (
    <div className={`relative ${borderColor} border bg-terminal-black p-4 ${className}`}>
      {title && (
        <div className={`absolute -top-3 left-3 bg-terminal-black px-2 text-xs font-bold ${titleColor}`}>
          ┤ {title} ├
        </div>
      )}
      {children}
    </div>
  );
}
