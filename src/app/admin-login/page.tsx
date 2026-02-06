'use client';

import React, { useState } from 'react';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'admin@feedbackloop.dev';
const ADMIN_PASSWORD = 'admin123';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    if (password !== ADMIN_PASSWORD) {
      setError('Invalid password');
      setLoading(false);
      return;
    }

    try {
      setStatus('Authenticating...');
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        setStatus('');
        return;
      }

      setStatus('Authenticated! Redirecting...');
      // The API route has set the auth cookies, just redirect
      window.location.href = data.redirect || '/feed';
    } catch (err) {
      setError('Connection failed. Make sure dev server is running.');
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <pre className="text-terminal-green text-xs sm:text-sm mb-8 text-center leading-tight">
{`
 ╔═══════════════════════════════════════╗
 ║                                       ║
 ║   ███████╗███████╗███████╗██████╗     ║
 ║   ██╔════╝██╔════╝██╔════╝██╔══██╗   ║
 ║   █████╗  █████╗  █████╗  ██║  ██║   ║
 ║   ██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║   ║
 ║   ██║     ███████╗███████╗██████╔╝    ║
 ║   ╚═╝     ╚══════╝╚══════╝╚═════╝     ║
 ║          BACK LOOP  v1.0              ║
 ║                                       ║
 ║   [ AI Dev Underground Network ]      ║
 ║   Trane Technologies  -  Bldg Ctrl    ║
 ║                                       ║
 ╚═══════════════════════════════════════╝
`}
        </pre>

        <div className="border border-terminal-border p-6">
          <div className="text-terminal-green text-xs mb-4">
            ┌─── ADMIN LOGIN ────────────────────────┐
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="text-terminal-dim text-xs mb-4">
              &gt; Enter admin password to access dashboard
            </div>

            <div className="bg-terminal-darkgray p-2 border border-terminal-border text-xs">
              <p className="text-terminal-green">Email: <span className="text-terminal-amber">{ADMIN_EMAIL}</span></p>
            </div>

            <RetroInput
              label="ADMIN PASSWORD"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              error={error}
            />

            {status && (
              <div className="text-terminal-amber text-xs animate-pulse">
                &gt; {status}
              </div>
            )}

            <RetroButton
              type="submit"
              loading={loading}
              className="w-full"
            >
              LOGIN AS ADMIN
            </RetroButton>

            <div className="text-terminal-dim text-xs mt-4 text-center">
              <a href="/login" className="text-terminal-amber hover:text-terminal-green">
                [BACK TO LOGIN]
              </a>
            </div>
          </form>

          <div className="text-terminal-green text-xs mt-4">
            └─────────────────────────────────────────┘
          </div>
        </div>

        <div className="text-center text-terminal-dim text-xs mt-4">
          FEEDBACKLOOP v1.0 :: EST. 2026 :: SECURE CHANNEL
        </div>
      </div>
    </div>
  );
}
