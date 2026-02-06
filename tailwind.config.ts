import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
        terminal: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
      },
      colors: {
        terminal: {
          black: '#0a0a0a',
          darkgray: '#1a1a2e',
          green: '#00ff41',
          darkgreen: '#00cc33',
          amber: '#ffb000',
          cyan: '#00e5ff',
          magenta: '#ff00ff',
          red: '#ff3333',
          blue: '#4488ff',
          white: '#e0e0e0',
          dim: '#666666',
          border: '#333333',
          highlight: '#1a3a1a',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        'glow-green': '0 0 10px rgba(0, 255, 65, 0.3)',
        'glow-amber': '0 0 10px rgba(255, 176, 0, 0.3)',
        'glow-cyan': '0 0 10px rgba(0, 229, 255, 0.3)',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.98' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
