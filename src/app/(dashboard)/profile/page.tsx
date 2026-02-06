import { createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/admin';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as any;

  async function updateProfile(formData: FormData) {
    'use server';

    const displayName = formData.get('displayName') as string;
    const bio = formData.get('bio') as string;

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    const { error } = await ((supabase as any)
      .from('profiles')
      .update({
        display_name: displayName,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id));

    if (error) {
      console.error('Profile update error:', error);
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ USER PROFILE ]]=</h2>
        <p className="text-terminal-dim text-xs">Edit your profile information</p>
      </div>

      <RetroCard variant="default">
        <div className="mb-6 pb-4 border-b border-terminal-border">
          <p className="text-terminal-green text-sm font-bold">{profile?.username}</p>
          <p className="text-terminal-dim text-xs">Member since {new Date(profile?.created_at || '').toLocaleDateString()}</p>
          <p className="text-terminal-amber text-xs mt-1 uppercase">{profile?.role}</p>
        </div>

        <form action={updateProfile} className="space-y-4">
          <RetroInput
            label="DISPLAY NAME"
            name="displayName"
            placeholder="Your name"
            defaultValue={profile?.display_name || ''}
            maxLength={100}
          />

          <div>
            <label className="block text-xs text-terminal-green font-bold uppercase tracking-wider mb-2">
              BIO
            </label>
            <textarea
              name="bio"
              placeholder="Tell us about yourself..."
              defaultValue={profile?.bio || ''}
              maxLength={256}
              className={`
                w-full bg-terminal-black border border-terminal-border
                px-3 py-2 font-mono text-sm text-terminal-white
                placeholder:text-terminal-dim
                focus:outline-none focus:border-terminal-green focus:shadow-glow-green
                transition-all duration-150 min-h-[80px] resize-y
              `}
            />
          </div>

          <div className="flex gap-2">
            <RetroButton type="submit">SAVE CHANGES</RetroButton>
            <Link href="/feed">
              <RetroButton type="button" variant="ghost">CANCEL</RetroButton>
            </Link>
          </div>
        </form>
      </RetroCard>

      <div className="mt-6">
        <h3 className="text-terminal-amber font-bold text-sm mb-3">=[[ ACCOUNT ]]=</h3>
        <RetroCard variant="danger">
          <p className="text-terminal-red text-xs font-bold mb-2">LOGOUT</p>
          <p className="text-terminal-dim text-xs mb-3">Sign out of your FEEDBACKLOOP session</p>
          <form
            action={async () => {
              'use server';
              const supabase = createServerSupabaseClient();
              await supabase.auth.signOut();
              const { redirect } = await import('next/navigation');
              redirect('/login');
            }}
          >
            <RetroButton type="submit" variant="danger" size="sm">
              SIGN OUT
            </RetroButton>
          </form>
        </RetroCard>
      </div>
    </div>
  );
}
