import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import Link from 'next/link';

export default async function AdminPage() {
  await requireAdmin();
  const supabase = createServerSupabaseClient();

  // Get stats
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false);

  const { count: totalComments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false);

  const { data: recentActivity } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      created_at,
      profiles!author_id (username, display_name)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(5) as any;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-amber font-bold text-lg mb-2">=[[ ADMIN DASHBOARD ]]=</h2>
        <p className="text-terminal-dim text-xs">System administration and controls</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <RetroCard className="text-center">
          <div className="text-terminal-green font-bold text-xl">{totalUsers || 0}</div>
          <div className="text-terminal-dim text-xs">USERS</div>
        </RetroCard>
        <RetroCard className="text-center">
          <div className="text-terminal-green font-bold text-xl">{totalPosts || 0}</div>
          <div className="text-terminal-dim text-xs">POSTS</div>
        </RetroCard>
        <RetroCard className="text-center">
          <div className="text-terminal-green font-bold text-xl">{totalComments || 0}</div>
          <div className="text-terminal-dim text-xs">COMMENTS</div>
        </RetroCard>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-terminal-cyan font-bold text-sm mb-2">=[[ QUICK ACTIONS ]]=</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link href="/admin/invites">
            <RetroCard className="cursor-pointer hover:border-terminal-green transition-colors">
              <p className="text-terminal-green text-xs font-bold">[1] SEND INVITES</p>
              <p className="text-terminal-dim text-xs mt-1">Invite new members via email</p>
            </RetroCard>
          </Link>
          <Link href="/admin/users">
            <RetroCard className="cursor-pointer hover:border-terminal-green transition-colors">
              <p className="text-terminal-green text-xs font-bold">[2] MANAGE USERS</p>
              <p className="text-terminal-dim text-xs mt-1">View and control user access</p>
            </RetroCard>
          </Link>
          <Link href="/admin/posts">
            <RetroCard className="cursor-pointer hover:border-terminal-green transition-colors">
              <p className="text-terminal-green text-xs font-bold">[3] MANAGE POSTS</p>
              <p className="text-terminal-dim text-xs mt-1">Review and delete content</p>
            </RetroCard>
          </Link>
          <Link href="/admin/tags">
            <RetroCard className="cursor-pointer hover:border-terminal-green transition-colors">
              <p className="text-terminal-green text-xs font-bold">[4] MANAGE TAGS</p>
              <p className="text-terminal-dim text-xs mt-1">Create and edit category tags</p>
            </RetroCard>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <h3 className="text-terminal-cyan font-bold text-sm mb-2">=[[ RECENT ACTIVITY ]]=</h3>
        <div className="space-y-2">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((post: any) => (
              <RetroCard key={post.id} className="text-xs">
                <p className="text-terminal-green">{post.title}</p>
                <p className="text-terminal-dim">
                  by {post.profiles?.display_name} · {new Date(post.created_at).toLocaleDateString()}
                </p>
              </RetroCard>
            ))
          ) : (
            <p className="text-terminal-dim text-xs">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
