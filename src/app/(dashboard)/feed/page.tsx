import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/admin';
import { RetroCard } from '@/components/ui/RetroCard';
import { VoteControls } from '@/components/VoteControls';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Suspense } from 'react';
import type { PostWithMeta } from '@/lib/types/database';

async function FeedContent() {
  await requireAuth();
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch posts with metadata using the database function
  const { data: posts, error } = await (supabase
    .rpc('get_posts_with_metadata', {
      p_sort: 'latest',
      p_tag_slug: null,
      p_limit: 50,
      p_offset: 0,
    } as any) as any);

  if (error) {
    console.error('Error fetching posts:', error);
    return (
      <div className="p-4 text-terminal-red">
        ERROR: Unable to load feed. Please refresh the page.
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-4 text-center text-terminal-dim">
        &gt; Feed is empty. Post something to get started!
      </div>
    );
  }

  // Fetch user votes
  const postIds = posts.map((p: any) => p.id);
  const { data: userVotes } = (await supabase
    .from('votes')
    .select('post_id, value')
    .in('post_id', postIds)
    .eq('user_id', user?.id || '')) as any;

  const voteMap = new Map((userVotes as any)?.map((v: any) => [v.post_id, v.value]) || []);

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <Link key={post.id} href={`/posts/${post.id}`}>
          <RetroCard variant="default" className="cursor-pointer hover:border-terminal-green transition-colors">
            <div className="space-y-2">
              <h3 className="font-bold text-terminal-green text-sm">{post.title}</h3>

              <p className="text-xs text-terminal-dim">
                by <span className="text-terminal-white">{post.author_display_name}</span>
                {' — '}
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </p>

              <p className="text-xs text-terminal-white line-clamp-3">{post.content_html.replace(/<[^>]*>/g, '').substring(0, 150)}</p>

              <div className="flex flex-wrap gap-2 items-center">
                {post.tags && post.tags.map((tag: any) => (
                  <span
                    key={tag.slug}
                    className="text-xs px-2 py-0.5 border"
                    style={{
                      borderColor: tag.color,
                      color: tag.color,
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-terminal-border">
                <div className="flex items-center gap-4 text-xs text-terminal-dim">
                  <span>💬 {post.comment_count}</span>
                </div>
                {user && (
                  <VoteControls
                    postId={post.id}
                    initialVoteCount={post.vote_count}
                    initialUserVote={(voteMap.get(post.id) as any) || null}
                  />
                )}
              </div>
            </div>
          </RetroCard>
        </Link>
      ))}
    </div>
  );
}

export default async function FeedPage() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ FEED ]]=</h2>
        <p className="text-terminal-dim text-xs">Latest posts from the community</p>
      </div>

      <Suspense
        fallback={
          <div className="text-terminal-dim text-xs">
            &gt; LOADING FEED...
          </div>
        }
      >
        <FeedContent />
      </Suspense>
    </div>
  );
}
