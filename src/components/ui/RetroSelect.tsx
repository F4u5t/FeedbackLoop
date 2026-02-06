'use client';

import React from 'react';

interface RetroSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function RetroSelect({ label, options, className = '', ...props }: RetroSelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs text-terminal-green font-bold uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-terminal-black border border-terminal-border
          px-3 py-2 font-mono text-sm text-terminal-white
          focus:outline-none focus:border-terminal-green focus:shadow-glow-green
          transition-all duration-150 appearance-none
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RetroModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative border border-terminal-green bg-terminal-black p-6 max-w-lg w-full mx-4 shadow-glow-green">
        <div className="absolute -top-3 left-3 bg-terminal-black px-2 text-xs font-bold text-terminal-green">
          ┤ {title} ├
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-terminal-dim hover:text-terminal-red text-sm"
        >
          [X]
        </button>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export function RetroLoader({ text = 'LOADING' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-terminal-green text-sm font-mono">
      <span className="animate-blink">▓</span>
      <span>{text}...</span>
    </div>
  );
}
