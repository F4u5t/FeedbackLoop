import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: post, error } = (await supabase
      .from('posts')
      .select(
        `
        *,
        profiles!author_id (
          id,
          username,
          display_name,
          avatar_url
        ),
        post_tags (
          tags (id, name, slug, color)
        )
      `
      )
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single()) as any;

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get vote count
    const { data: voteCount } = (await (supabase as any)
      .rpc('get_post_vote_count', { p_post_id: params.id })
      .single()) as any;

    // Get comment count
    const { count: commentCount } = (await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', params.id)
      .eq('is_deleted', false)) as any;

    return NextResponse.json({
      ...post,
      vote_count: voteCount || 0,
      comment_count: commentCount || 0,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { title, content, contentHtml } = body;

    // Check ownership
    const { data: post } = (await supabase
      .from('posts')
      .select('author_id')
      .eq('id', params.id)
      .single()) as any;

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: updated, error } = (await ((supabase as any)
      .from('posts')
      .update({
        title,
        content,
        content_html: contentHtml,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single())) as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership or admin
    const { data: post } = (await supabase
      .from('posts')
      .select('author_id')
      .eq('id', params.id)
      .single()) as any;

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { data: profile } = (await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()) as any;

    if (post.author_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await ((supabase as any)
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', params.id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
