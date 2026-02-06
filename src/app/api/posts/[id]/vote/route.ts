import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { value } = body; // 1 or -1

    if (!value || ![1, -1].includes(value)) {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
    }

    const postId = params.id;

    // Check if user already voted
    const { data: existingVote } = (await supabase
      .from('votes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()) as any;

    if (existingVote) {
      // If voting the same way, remove the vote
      if (existingVote.value === value) {
        await ((supabase as any)
          .from('votes')
          .delete()
          .eq('id', existingVote.id));
      } else {
        // Change the vote
        await ((supabase as any)
          .from('votes')
          .update({ value })
          .eq('id', existingVote.id));
      }
    } else {
      // Create new vote
      await ((supabase as any)
        .from('votes')
        .insert({
          post_id: postId,
          user_id: user.id,
          value,
        }));

      // Create notification for post author
      const { data: post } = (await supabase
        .from('posts')
        .select('author_id')
        .eq('id', postId)
        .single()) as any;

      if (post && post.author_id !== user.id) {
        const serviceRole = createServiceRoleClient();
        await ((serviceRole as any)
          .from('notifications')
          .insert({
            user_id: post.author_id,
            type: 'vote',
            reference_id: postId,
            reference_type: 'post',
            message: value === 1 ? 'Your post was upvoted!' : 'Your post was downvoted',
          }));
      }
    }

    // Get updated vote count
    const { data, error } = (await (supabase as any)
      .rpc('get_post_vote_count', { p_post_id: postId })
      .single()) as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user's current vote
    const { data: currentVote } = (await supabase
      .from('votes')
      .select('value')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()) as any;

    return NextResponse.json({
      vote_count: data || 0,
      user_vote: currentVote?.value || null,
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
