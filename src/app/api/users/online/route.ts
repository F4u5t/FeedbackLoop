import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get users active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: onlineUsers, error } = (await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, last_activity_at')
      .gt('last_activity_at', fiveMinutesAgo)
      .neq('id', user.id)
      .order('last_activity_at', { ascending: false })) as any;

    if (error) {
      console.error('Error fetching online users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(onlineUsers || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
