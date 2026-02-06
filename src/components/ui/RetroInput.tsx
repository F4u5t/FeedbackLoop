'use client';

import React, { forwardRef } from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const RetroInput = forwardRef<HTMLInputElement, RetroInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-xs text-terminal-green font-bold uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-terminal-green text-sm">
            &gt;
          </span>
          <input
            ref={ref}
            className={`
              w-full bg-terminal-black border border-terminal-border
              pl-6 pr-3 py-2 font-mono text-sm text-terminal-white
              placeholder:text-terminal-dim
              focus:outline-none focus:border-terminal-green focus:shadow-glow-green
              transition-all duration-150
              ${error ? 'border-terminal-red' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-terminal-red">ERROR: {error}</p>
        )}
      </div>
    );
  }
);
RetroInput.displayName = 'RetroInput';

interface RetroTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const RetroTextArea = forwardRef<HTMLTextAreaElement, RetroTextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-xs text-terminal-green font-bold uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full bg-terminal-black border border-terminal-border
            px-3 py-2 font-mono text-sm text-terminal-white
            placeholder:text-terminal-dim
            focus:outline-none focus:border-terminal-green focus:shadow-glow-green
            transition-all duration-150 min-h-[100px] resize-y
            ${error ? 'border-terminal-red' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-xs text-terminal-red">ERROR: {error}</p>
        )}
      </div>
    );
  }
);
RetroTextArea.displayName = 'RetroTextArea';
