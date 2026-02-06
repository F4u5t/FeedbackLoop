'use client';

import React from 'react';

interface RetroTagProps {
  name: string;
  color?: string;
  slug?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  active?: boolean;
}

export function RetroTag({ name, color = '#00ff41', onClick, removable, onRemove, active }: RetroTagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono
        border cursor-pointer transition-all duration-150
        ${active ? 'bg-opacity-20' : 'bg-transparent'}
        hover:bg-opacity-20
      `}
      style={{
        borderColor: color,
        color: color,
        backgroundColor: active ? `${color}33` : 'transparent',
      }}
      onClick={onClick}
    >
      #{name}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="hover:text-terminal-red ml-1"
        >
          ×
        </button>
      )}
    </span>
  );
}
