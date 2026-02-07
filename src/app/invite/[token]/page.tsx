import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = createServerSupabaseClient();

  // Check if invite is valid
  const { data: invite, error: inviteError } = (await supabase
    .from('invites')
    .select('*')
    .eq('token', params.token)
    .single()) as any;

  if (inviteError || !invite) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
        <RetroCard variant="danger" className="max-w-md w-full">
          <h2 className="text-terminal-red font-bold mb-2">INVITE INVALID</h2>
          <p className="text-terminal-dim text-xs mb-4">
            This invite token is invalid or has expired. Contact an administrator for a new invite.
          </p>
          <Link href="/login">
            <RetroButton variant="ghost" className="w-full">RETURN TO LOGIN</RetroButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  if (invite.status === 'expired' || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
        <RetroCard variant="danger" className="max-w-md w-full">
          <h2 className="text-terminal-red font-bold mb-2">INVITE EXPIRED</h2>
          <p className="text-terminal-dim text-xs mb-4">
            This invite has expired (valid until {new Date(invite.expires_at).toLocaleDateString()}).
          </p>
          <p className="text-terminal-dim text-xs mb-4">
            Request a new invite from the FEEDBACKLOOP admins.
          </p>
          <Link href="/login">
            <RetroButton variant="ghost" className="w-full">RETURN TO LOGIN</RetroButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
        <RetroCard variant="danger" className="max-w-md w-full">
          <h2 className="text-terminal-red font-bold mb-2">INVITE ERROR</h2>
          <p className="text-terminal-dim text-xs mb-4">
            The server is missing the service role key required to complete login. Contact an administrator.
          </p>
          <Link href="/login">
            <RetroButton variant="ghost" className="w-full">RETURN TO LOGIN</RetroButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  const service = createServiceRoleClient();
  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email: invite.email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error('Error generating magic link:', linkError);
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
        <RetroCard variant="danger" className="max-w-md w-full">
          <h2 className="text-terminal-red font-bold mb-2">INVITE ERROR</h2>
          <p className="text-terminal-dim text-xs mb-4">
            Failed to generate a login link. Please try again or contact an administrator.
          </p>
          <Link href="/login">
            <RetroButton variant="ghost" className="w-full">RETURN TO LOGIN</RetroButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  if (invite.status === 'pending') {
    await (service as any)
      .from('invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id);
  }

  redirect(linkData.properties.action_link);

  return (
    <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ASCII Art Header */}
        <pre className="text-terminal-green text-xs sm:text-sm mb-8 text-center leading-tight">
      {`
       ╔════════════════════════════════════════════════════════════════════╗
       ║                                                                    ║
       ║  ███████╗███████╗███████╗██████╗ ██████╗  █████╗  ██████╗██╗  ██╗ ║
       ║  ██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██║ ██╔╝ ║
       ║  █████╗  █████╗  █████╗  ██║  ██║██████╔╝███████║██║     █████╔╝  ║
       ║  ██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║██╔══██╗██╔══██║██║     ██╔═██╗  ║
       ║  ██║     ███████╗███████╗██████╔╝██████╔╝██║  ██║╚██████╗██║  ██╗ ║
       ║  ╚═╝     ╚══════╝╚══════╝╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ║
       ║                                                                    ║
       ║          ██╗      ██████╗  ██████╗ ██████╗                        ║
       ║          ██║     ██╔═══██╗██╔═══██╗██╔══██╗                       ║
       ║          ██║     ██║   ██║██║   ██║██████╔╝                       ║
       ║          ██║     ██║   ██║██║   ██║██╔═══╝                        ║
       ║          ███████╗╚██████╔╝╚██████╔╝██║                            ║
       ║          ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝                            ║
       ║                                                                    ║
       ╚════════════════════════════════════════════════════════════════════╝
      `}
        </pre>

        <RetroCard variant="highlight">
          <h2 className="text-terminal-amber font-bold text-sm mb-4 uppercase">
            ▓ ENCRYPTED INVITE
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-terminal-green text-xs font-bold mb-1">RECIPIENT EMAIL</p>
              <p className="text-terminal-white text-sm">{invite.email}</p>
            </div>

            <div>
              <p className="text-terminal-dim text-xs mb-2">
                ▓ You've been approved to access FEEDBACKLOOP, a secure community for AI developers at Trane.
              </p>
              <p className="text-terminal-dim text-xs">
                ▓ Click [ ACCEPT ] below to authenticate via magic link.
              </p>
            </div>

            <div className="text-terminal-dim text-xs">
              Redirecting you to a secure login link…
            </div>

            <p className="text-terminal-dim text-xs text-center border-t border-terminal-border pt-3">
              This token expires {new Date(invite.expires_at).toLocaleDateString()}
            </p>
          </div>
        </RetroCard>
      </div>
    </div>
  );
}
