'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setError('Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ASCII Art Header */}
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
            ┌─── SYSTEM LOGIN ───────────────────────┐
          </div>

          {!sent ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-terminal-dim text-xs mb-4">
                &gt; Enter your email to log in with a magic link.
              </div>

              <RetroInput
                label="EMAIL ADDRESS"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={error}
              />

              <RetroButton
                type="submit"
                loading={loading}
                className="w-full"
              >
                REQUEST MAGIC LINK
              </RetroButton>

              <div className="text-terminal-dim text-xs mt-4 text-center">
                No account yet?{' '}
                <Link href="/signup" className="text-terminal-amber hover:text-terminal-green">
                  [SIGN UP]
                </Link>
              </div>

              <div className="text-terminal-dim text-xs mt-4">
                &gt; SYS: Magic link will be sent to your email.
              </div>

              <div className="text-terminal-dim text-xs text-center border-t border-terminal-border pt-3 mt-3">
                <Link href="/admin-login" className="text-terminal-green hover:text-terminal-amber text-xs">
                  [ADMIN LOGIN]
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-terminal-green text-sm">
                <p className="mb-2">✓ MAGIC LINK SENT</p>
                <p className="text-terminal-dim text-xs">
                  &gt; Check your email at <span className="text-terminal-amber">{email}</span>
                </p>
                <p className="text-terminal-dim text-xs mt-1">
                  &gt; Click the link to authenticate and connect to FEEDBACKLOOP.
                </p>
              </div>

              <RetroButton
                variant="ghost"
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full"
                size="sm"
              >
                USE DIFFERENT EMAIL
              </RetroButton>

              <div className="text-terminal-dim text-xs mt-4 text-center border-t border-terminal-border pt-3">
                <Link href="/admin-login" className="text-terminal-green hover:text-terminal-amber text-xs">
                  [ADMIN LOGIN]
                </Link>
              </div>
            </div>
          )}

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
