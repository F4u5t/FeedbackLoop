import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NotificationBell } from '@/components/NotificationBell';
import { OnlineUsers } from '@/components/OnlineUsers';
import { ActivityTracker } from '@/components/ActivityTracker';
import Link from 'next/link';
import { Suspense } from 'react';

async function DashboardHeader() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as any;

  return (
    <header className="border-b border-terminal-border bg-terminal-darkgray p-4 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-terminal-green font-bold text-sm uppercase tracking-widest">
            ▓ FEEDBACKLOOP v1.0
          </h1>
          <div className="text-terminal-dim text-xs hidden sm:block">
            CONNECTED AS {profile?.username?.toUpperCase() || 'USER'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link
            href="/profile"
            className="text-terminal-dim text-xs hover:text-terminal-cyan transition-colors"
          >
            [PROFILE]
          </Link>
          <form
            action={async () => {
              'use server';
              const supabase = createServerSupabaseClient();
              await supabase.auth.signOut();
              const { redirect } = await import('next/navigation');
              redirect('/login');
            }}
          >
            <button
              type="submit"
              className="text-terminal-dim text-xs hover:text-terminal-red transition-colors"
            >
              [LOGOUT]
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

async function OnlineUsersList() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  // Get users active in the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: onlineUsers } = (await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, last_activity_at')
    .gt('last_activity_at', fiveMinutesAgo)
    .neq('id', user.id)
    .order('last_activity_at', { ascending: false })) as any;

  return <OnlineUsers initialUsers={onlineUsers || []} currentUserId={user.id} />;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-terminal-black">
      <ActivityTracker />
      <Suspense fallback={null}>
        <DashboardHeader />
      </Suspense>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="hidden sm:block border-r border-terminal-border bg-terminal-darkgray w-48 p-4 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <nav className="space-y-1 font-mono text-xs">
            <NavLink href="/feed">[1] Feed</NavLink>
            <NavLink href="/posts/new">[2] New Post</NavLink>
            <NavLink href="/my-posts">[3] My Posts</NavLink>
            <NavLink href="/messages">[4] Messages</NavLink>
            <NavLink href="/tags">[T] Tags</NavLink>
            <div className="border-t border-terminal-border my-2 pt-2">
              <NavLink href="/profile">[P] Profile</NavLink>
              <NavLink href="/admin" variant="secondary">[A] Admin Panel</NavLink>
            </div>
          </nav>

          <div className="mt-4 text-terminal-dim text-xs border-t border-terminal-border pt-4">
            <p>CONNECTED: ONLINE</p>
            <p>SESSION: ACTIVE</p>
          </div>

          <Suspense fallback={<div className="mt-6 text-terminal-dim text-xs">Loading users...</div>}>
            <OnlineUsersList />
          </Suspense>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  children,
  variant = 'default',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
}) {
  return (
    <Link
      href={href}
      className={`
        block px-3 py-2 rounded transition-colors duration-100
        ${variant === 'default'
          ? 'text-terminal-dim hover:text-terminal-green hover:bg-terminal-highlight'
          : 'text-terminal-amber hover:text-terminal-red hover:bg-terminal-highlight'}
      `}
    >
      {children}
    </Link>
  );
}
