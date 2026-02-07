import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MessagesPageClient } from './MessagesPageClient';

export default async function MessagesPage() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  // Fetch all users except current user
  const { data: allUsers } = (await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .neq('id', user.id)) as any;

  // Get distinct conversations
  const { data: conversations } = await supabase
    .from('messages')
    .select(`
      *,
      profiles!sender_id (id, username, display_name, avatar_url),
      profiles!recipient_id (id, username, display_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Build unique conversations
  const convMap = new Map();
  conversations?.forEach((msg: any) => {
    const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
    const otherProfile = msg.sender_id === user.id ? msg.profiles_recipient_id : msg.profiles_sender_id;

    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        userId: otherId,
        profile: otherProfile,
        lastMessage: msg.content,
        lastMessageTime: msg.created_at,
        unread: msg.recipient_id === user.id && !msg.read_at,
      });
    }
  });

  const uniqueConversations = Array.from(convMap.values());

  return (
    <MessagesPageClient
      currentUserId={user.id}
      conversations={uniqueConversations}
      allUsers={allUsers || []}
    />
  );
}
