'use client';

import React, { useState } from 'react';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Verify hardcoded credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError('Invalid credentials');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const email = `${username}@feedbackloop.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push('/feed');
    } catch {
      setError('Connection failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            ┌─── ADMIN LOGIN ────────────────────────┐
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="text-terminal-dim text-xs mb-4">
              &gt; Enter admin credentials to access dashboard
            </div>

            <RetroInput
              label="USERNAME"
              type="text"
              placeholder="admin"
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
