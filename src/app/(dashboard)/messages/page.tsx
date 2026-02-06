import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import Link from 'next/link';

export default async function MessagesPage() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

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
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ MESSAGES ]]=</h2>
        <p className="text-terminal-dim text-xs">Direct messages with other users</p>
      </div>

      <div className="space-y-2">
        {uniqueConversations.length > 0 ? (
          uniqueConversations.map((conv: any) => (
            <Link key={conv.userId} href={`/messages/${conv.userId}`}>
              <RetroCard className="cursor-pointer hover:border-terminal-green transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-terminal-green font-bold text-sm">
                      {conv.profile?.display_name || conv.profile?.username}
                    </p>
                    <p className="text-terminal-dim text-xs truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread && (
                    <span className="bg-terminal-green text-terminal-black text-xs px-2 py-0.5 rounded">
                      NEW
                    </span>
                  )}
                </div>
              </RetroCard>
            </Link>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">No conversations yet</p>
        )}
      </div>
    </div>
  );
}
