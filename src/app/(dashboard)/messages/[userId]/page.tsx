import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroInput } from '@/components/ui/RetroInput';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroTextArea } from '@/components/ui/RetroInput';
import { RetroModal } from '@/components/ui/RetroSelect';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default async function MessageDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  // Get the other user's profile
  const { data: otherProfile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.userId)
    .single()) as any;

  if (!otherProfile) {
    return (
      <div className="p-4 text-center">
        <RetroCard variant="danger">
          <p className="text-terminal-red">USER NOT FOUND</p>
        </RetroCard>
      </div>
    );
  }

  // Get messages
  const { data: messages } = (await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${params.userId}),and(sender_id.eq.${params.userId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true })) as any;

  // Mark as read
  await ((supabase as any)
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', user.id)
    .eq('sender_id', params.userId)
    .is('read_at', null));

  async function sendMessage(formData: FormData) {
    'use server';

    const content = formData.get('content') as string;

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !content.trim()) return;

    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: params.userId,
      content: content.trim(),
    } as any);

    const { revalidatePath } = await import('next/cache');
    revalidatePath(`/messages/${params.userId}`);
  }

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col h-screen">
      {/* Header */}
      <div className="mb-4">
        <RetroCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-terminal-green font-bold">{otherProfile.display_name}</h2>
              <p className="text-terminal-dim text-xs">@{otherProfile.username}</p>
            </div>
            <Link href="/messages">
              <RetroButton variant="ghost" size="sm">[BACK]</RetroButton>
            </Link>
          </div>
        </RetroCard>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages && messages.length > 0 ? (
          messages.map((msg: any) => (
            <RetroCard
              key={msg.id}
              variant={msg.sender_id === user.id ? 'default' : 'highlight'}
              className="text-xs"
            >
              <p className="text-terminal-white">{msg.content}</p>
              <p className="text-terminal-dim text-xs mt-1">
                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
              </p>
            </RetroCard>
          ))
        ) : (
          <p className="text-terminal-dim text-xs text-center">No messages yet. Start the conversation!</p>
        )}
      </div>

      {/* Input */}
      <form action={sendMessage} className="space-y-2">
        <RetroTextArea
          name="content"
          placeholder="Type message..."
          className="min-h-[60px]"
          required
        />
        <RetroButton type="submit" className="w-full">SEND</RetroButton>
      </form>
    </div>
  );
}
