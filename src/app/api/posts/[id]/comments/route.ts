import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: comments, error } = (await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        created_at,
        author_id,
        profiles!author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .eq('post_id', params.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })) as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const { data: comment, error } = (await ((supabase as any)
      .from('comments')
      .insert({
        post_id: params.id,
        author_id: user.id,
        content: content.trim(),
      })
      .select()
      .single())) as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify post author about new comment
    const { data: post } = (await supabase
      .from('posts')
      .select('author_id')
      .eq('id', params.id)
      .single()) as any;

    if (post && post.author_id !== user.id) {
      const serviceRole = createServiceRoleClient();
      await ((serviceRole as any)
        .from('notifications')
        .insert({
          user_id: post.author_id,
          type: 'comment',
          reference_id: params.id,
          reference_type: 'post',
          message: 'New comment on your post',
        }));
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
