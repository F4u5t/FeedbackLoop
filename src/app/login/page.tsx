'use client';

import React, { Suspense, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function InviteStatusBanner() {
  const searchParams = useSearchParams();
  const inviteStatus = searchParams.get('invite');
  const inviteEmail = searchParams.get('email');

  if (inviteStatus !== 'sent' && inviteStatus !== 'error') {
    return null;
  }

  return (
    <>
      {inviteStatus === 'sent' && (
        <div className="text-terminal-green text-xs mb-4">
          ✓ Invite accepted. Magic link sent{inviteEmail ? ` to ${inviteEmail}` : ''}.
        </div>
      )}
      {inviteStatus === 'error' && (
        <div className="text-terminal-red text-xs mb-4">
          ✗ Unable to process invite. Please try again or contact an admin.
        </div>
      )}
    </>
  );
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Convert username to email (same format as signup)
      const email = `${username}@feedbackloop.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push('/feed');
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
 ╔════════════════════════════════════════════════════════════════════╗
 ║                                                                    ║
 ║  ███████╗███████╗███████╗██████╗ ██████╗  █████╗  ██████╗██╗  ██╗ ║
 ║  ██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██║ ██╔╝ ║
 ║  █████╗  █████╗  █████╗  ██║  ██║██████╔╝███████║██║     █████╔╝  ║
 ║  ██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║██╔══██╗██╔══██║██║     ██╔═██╗  ║
 ║  ██║     ███████╗███████╗██████╔╝██████╔╝██║  ██║╚██████╗██║  ██╗ ║
 ║  ╚═╝     ╚══════╝╚══════╝╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ║
 ║                                                                    ║
 ║          ██╗      ██████╗  ██████╗ ██████╗                        ║
 ║          ██║     ██╔═══██╗██╔═══██╗██╔══██╗                       ║
 ║          ██║     ██║   ██║██║   ██║██████╔╝                       ║
 ║          ██║     ██║   ██║██║   ██║██╔═══╝                        ║
 ║          ███████╗╚██████╔╝╚██████╔╝██║                            ║
 ║          ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝                            ║
 ║                                                                    ║
 ╚════════════════════════════════════════════════════════════════════╝
`}
        </pre>

        <div className="border border-terminal-border p-6">
          <div className="text-terminal-green text-xs mb-4">
            ┌─── SYSTEM LOGIN ───────────────────────┐
          </div>

          <Suspense fallback={null}>
            <InviteStatusBanner />
          </Suspense>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-terminal-dim text-xs mb-4">
              &gt; Enter your username and password to log in.
            </div>

            <RetroInput
              label="USERNAME"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              error={error}
            />

            <RetroInput
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <RetroButton
              type="submit"
              loading={loading}
              className="w-full"
            >
              LOGIN
            </RetroButton>

            <div className="text-terminal-dim text-xs mt-4 text-center">
              No account yet?{' '}
              <Link href="/signup" className="text-terminal-amber hover:text-terminal-green">
                [SIGN UP]
              </Link>
            </div>

            <div className="text-terminal-dim text-xs mt-4">
              &gt; SYS: Enter your credentials to access FEEDBACKLOOP.
            </div>

            <div className="text-terminal-dim text-xs text-center border-t border-terminal-border pt-3 mt-3">
              <Link href="/admin-login" className="text-terminal-green hover:text-terminal-amber text-xs">
                [ADMIN LOGIN]
              </Link>
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
