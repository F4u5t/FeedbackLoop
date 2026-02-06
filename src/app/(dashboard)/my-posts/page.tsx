import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import Link from 'next/link';

export default async function MyPostsPage() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      post_tags (tags (id, name, color))
    `)
    .eq('author_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ MY POSTS ]]=</h2>
        <p className="text-terminal-dim text-xs">Your published posts and ideas</p>
      </div>

      <div className="space-y-3">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <RetroCard className="cursor-pointer hover:border-terminal-green transition-colors">
                <h3 className="text-terminal-green font-bold text-sm">{post.title}</h3>
                <p className="text-terminal-dim text-xs">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </RetroCard>
            </Link>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">You haven't posted anything yet</p>
        )}
      </div>

      <div className="mt-6">
        <Link href="/posts/new">
          <RetroButton>CREATE NEW POST</RetroButton>
        </Link>
      </div>
    </div>
  );
}
