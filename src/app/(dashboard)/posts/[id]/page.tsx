import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/admin';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput, RetroTextArea } from '@/components/ui/RetroInput';
import { VoteControls } from '@/components/VoteControls';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default async function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  // Fetch post
  const { data: post, error: postError } = (await supabase
    .from('posts')
    .select(
      `
      *,
      profiles!author_id (id, username, display_name, avatar_url),
      post_tags (tags (id, name, slug, color))
    `
    )
    .eq('id', params.id)
    .eq('is_deleted', false)
    .single()) as any;

  if (postError || !post) {
    return (
      <div className="p-4 text-center">
        <RetroCard variant="danger">
          <p className="text-terminal-red">POST NOT FOUND</p>
        </RetroCard>
      </div>
    );
  }

  // Get vote count
  const { data: voteCount } = (await (supabase as any)
    .rpc('get_post_vote_count', { p_post_id: params.id })
    .single()) as any;

  // Get user vote
  const { data: userVote } = (await supabase
    .from('votes')
    .select('value')
    .eq('post_id', params.id)
    .eq('user_id', user.id)
    .single()) as any;

  // Fetch comments
  const { data: comments } = (await supabase
    .from('comments')
    .select(`
      *,
      profiles!author_id (id, username, display_name, avatar_url)
    `)
    .eq('post_id', params.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })) as any;

  async function addComment(formData: FormData) {
    'use server';

    const content = formData.get('content') as string;

    if (!content.trim()) {
      return;
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: params.id,
        author_id: user.id,
        content: content.trim(),
      } as any);

    if (error) {
      return;
    }

    // Revalidate
    const { revalidatePath } = await import('next/cache');
    revalidatePath(`/posts/${params.id}`);
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Post Content */}
      <RetroCard variant="highlight" className="mb-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-terminal-green font-bold text-lg mb-2">{post.title}</h1>
            <div className="flex items-center gap-2 text-xs text-terminal-dim">
              <span className="text-terminal-white">{post.profiles.display_name}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Content */}
          <div
            className="post-content text-sm text-terminal-white border-t border-b border-terminal-border py-4"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {/* Tags */}
          {post.post_tags && post.post_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.post_tags.map((pt: any) => (
                <span
                  key={pt.tags.id}
                  className="text-xs px-2 py-0.5 border"
                  style={{
                    borderColor: pt.tags.color,
                    color: pt.tags.color,
                  }}
                >
                  #{pt.tags.name}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-terminal-border text-xs text-terminal-dim">
            <span>{comments?.length || 0} comments</span>
            <div className="flex items-center gap-2">
              {post.author_id === user.id && (
                <Link href={`/posts/${params.id}/edit`} className="text-terminal-cyan hover:underline">
                  [EDIT]
                </Link>
              )}
              <RetroButton variant="ghost" size="sm" onClick={async () => {
                'use server';
                // TODO: implement delete
              }}>
                [DELETE]
              </RetroButton>
            </div>
          </div>
        </div>

        {/* Vote Controls */}
        <div className="flex justify-center pt-4 border-t border-terminal-border">
          <VoteControls
            postId={params.id}
            initialVoteCount={voteCount || 0}
            initialUserVote={userVote?.value || null}
          />
        </div>
      </RetroCard>

      {/* Comments Section */}
      <div className="mb-6">
        <h2 className="text-terminal-amber font-bold text-sm mb-3">=[[ COMMENTS ]]=</h2>

        {/* Add Comment */}
        <RetroCard className="mb-4">
          <form action={addComment} className="space-y-2">
            <RetroTextArea
              name="content"
              placeholder="Add your thoughts..."
              required
            />
            <RetroButton type="submit" size="sm">
              POST COMMENT
            </RetroButton>
          </form>
        </RetroCard>

        {/* Comments List */}
        <div className="space-y-3">
          {comments && comments.length > 0 ? (
            comments.map((comment: any) => (
              <RetroCard key={comment.id} className="text-xs">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-terminal-green font-bold">{comment.profiles.display_name}</span>
                  <span className="text-terminal-dim">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-terminal-white">{comment.content}</p>
              </RetroCard>
            ))
          ) : (
            <p className="text-terminal-dim text-xs">No comments yet. Be the first!</p>
          )}
        </div>
      </div>

      <Link href="/feed">
        <RetroButton variant="ghost">BACK TO FEED</RetroButton>
      </Link>
    </div>
  );
}
