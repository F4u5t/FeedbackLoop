import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import { formatDistanceToNow } from 'date-fns';
import { redirect } from 'next/navigation';

export default async function AdminInvitesPage({
  searchParams,
}: {
  searchParams: { link?: string; email?: string };
}) {
  await requireAdmin();
  const supabase = createServerSupabaseClient();

  async function sendInvite(formData: FormData) {
    'use server';

    const email = formData.get('email') as string;

    if (!email) {
      return;
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    // Check if already invited
    const { data: existing } = await supabase
      .from('invites')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existing) {
      // Show existing invite link
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${existing.token}`;
      redirect(`/admin/invites?link=${encodeURIComponent(inviteUrl)}&email=${encodeURIComponent(email)}`);
      return;
    }

    // Create invite
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');

    const { error } = await supabase
      .from('invites')
      .insert({
        email: email,
        token: token,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } as any)
      .select()
      .single();

    if (error) {
      return;
    }

    // Show the invite link directly (no email needed)
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
    redirect(`/admin/invites?link=${encodeURIComponent(inviteUrl)}&email=${encodeURIComponent(email)}`);
  }

  const { data: invites } = await supabase
    .from('invites')
    .select(`
      *,
      profiles!invited_by (username, display_name)
    `)
    .order('created_at', { ascending: false }) as any;

  const generatedLink = searchParams.link;
  const generatedEmail = searchParams.email;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ SEND INVITES ]]=</h2>
        <p className="text-terminal-dim text-xs">Invite new members to FEEDBACKLOOP</p>
      </div>

      {generatedLink && (
        <RetroCard variant="highlight" className="mb-6">
          <div className="space-y-3">
            <p className="text-terminal-green text-xs font-bold">
              &gt; INVITE LINK GENERATED FOR: <span className="text-terminal-amber">{generatedEmail}</span>
            </p>
            <p className="text-terminal-dim text-xs">Copy this link and share it via Slack, Teams, or email:</p>
            <div className="bg-terminal-black border border-terminal-green p-3 rounded break-all">
              <code className="text-terminal-green text-xs select-all">{generatedLink}</code>
            </div>
            <p className="text-terminal-dim text-xs">
              &gt; Link expires in 7 days. Recipient clicks link to join FEEDBACKLOOP.
            </p>
          </div>
        </RetroCard>
      )}

      <RetroCard variant="default" className="mb-6">
        <form action={sendInvite} className="space-y-4">
          <RetroInput
            label="EMAIL ADDRESS"
            name="email"
            type="email"
            placeholder="developer@company.com"
            required
          />

          <RetroButton type="submit">GENERATE INVITE LINK</RetroButton>
        </form>
      </RetroCard>

      <div className="mb-4">
        <h3 className="text-terminal-amber font-bold text-sm mb-2">=[[ INVITE HISTORY ]]=</h3>
      </div>

      <div className="space-y-2">
        {invites && invites.length > 0 ? (
          invites.map((invite: any) => (
            <RetroCard key={invite.id} variant={invite.status === 'pending' ? 'default' : 'highlight'}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm">
                    <span className={invite.status === 'accepted' ? 'text-terminal-green' : 'text-terminal-amber'}>
                      {invite.email}
                    </span>
                  </p>
                  <p className="text-xs text-terminal-dim">
                    Status: <span className="uppercase font-bold">{invite.status}</span>
                  </p>
                  <p className="text-xs text-terminal-dim">
                    {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                  </p>
                </div>
                {invite.status === 'pending' && (
                  <div className="text-right">
                    <p className="text-terminal-dim text-xs mb-1">Invite link:</p>
                    <code className="text-terminal-green text-xs break-all select-all">
                      {process.env.NEXT_PUBLIC_APP_URL}/invite/{invite.token}
                    </code>
                  </div>
                )}
              </div>
            </RetroCard>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">No invites yet</p>
        )}
      </div>
    </div>
  );
}
