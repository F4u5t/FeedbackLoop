'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Create email from username (required by Supabase)
      const email = `${username}@feedbackloop.local`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        // Redirect to feed on successful signup
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
            ┌─── CREATE ACCOUNT ─────────────────────┐
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="text-terminal-dim text-xs mb-4">
              &gt; Create an account with a username and password.
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
              CREATE ACCOUNT
            </RetroButton>

            <div className="text-terminal-dim text-xs mt-4 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-terminal-amber hover:text-terminal-green">
                [LOGIN]
              </Link>
            </div>

            <div className="text-terminal-dim text-xs mt-4">
              &gt; SYS: Account created successfully.
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
