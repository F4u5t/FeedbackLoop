import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update last_activity_at using raw SQL to avoid type issues
    await supabase.rpc('update_user_activity', { user_id: user.id }).catch(() => {
      // Fallback: If the function doesn't exist yet, ignore
      console.log('Activity tracking not yet configured');
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
