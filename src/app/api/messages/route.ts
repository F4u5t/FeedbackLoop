import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }

    // Get conversations
    const { data: sent } = (await supabase
      .from('messages')
      .select(
        `
        id,
        sender_id,
        recipient_id,
        created_at,
        profiles!recipient_id (id, username, display_name, avatar_url)
      `
      )
      .eq('sender_id', user.id)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })) as any;

    const { data: received } = (await supabase
      .from('messages')
      .select(
        `
        id,
        sender_id,
        recipient_id,
        created_at,
        profiles!sender_id (id, username, display_name, avatar_url)
      `
      )
      .eq('sender_id', userId)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })) as any;

    const messages = [...(sent || []), ...(received || [])]
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, content } = body;

    if (!recipientId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: message, error } = (await ((supabase as any)
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
      })
      .select()
      .single())) as any;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification for recipient
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const serviceRole = createServiceRoleClient();
    await ((serviceRole as any)
      .from('notifications')
      .insert({
        user_id: recipientId,
        type: 'message',
        reference_id: user.id,
        reference_type: 'user',
        message: 'New message',
      }));

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
