import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';

export default async function AdminPostsPage() {
  await requireAdmin();
  const supabase = createServerSupabaseClient();

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!author_id (display_name, username)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false }) as any;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-amber font-bold text-lg mb-2">=[[ MODERATION ]]=</h2>
        <p className="text-terminal-dim text-xs">Review and delete posts</p>
      </div>

      <div className="space-y-2">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <RetroCard key={post.id} className="text-xs">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-terminal-green font-bold">{post.title}</p>
                  <p className="text-terminal-dim">by {post.profiles?.display_name}</p>
                </div>
                <RetroButton variant="danger" size="sm">[DELETE]</RetroButton>
              </div>
            </RetroCard>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">No posts</p>
        )}
      </div>
    </div>
  );
}
