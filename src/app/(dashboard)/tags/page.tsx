import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import { redirect } from 'next/navigation';

export default async function TagsPage() {
  const user = await requireAuth();
  const supabase = createServerSupabaseClient();

  const { data: tags } = (await supabase.from('tags').select('*').order('name')) as any;

  const { data: profile } = (await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as any;

  async function deleteTag(formData: FormData) {
    'use server';

    const tagId = formData.get('tagId') as string;

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user!.id).single()) as any;

    if (profile?.role !== 'admin') {
      return;
    }

    await ((supabase as any).from('tags').delete().eq('id', tagId));
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/tags');
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ TAGS ]]=</h2>
        <p className="text-terminal-dim text-xs">Topic categories for posts</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {tags?.map((tag: any) => (
          <RetroCard key={tag.id} className="text-center">
            <p
              className="font-bold text-sm"
              style={{ color: tag.color }}
            >
              #{tag.name}
            </p>
            {profile?.role === 'admin' && (
              <form action={deleteTag} className="mt-2">
                <input type="hidden" name="tagId" value={tag.id} />
                <RetroButton type="submit" variant="danger" size="sm" className="w-full">
                  DELETE
                </RetroButton>
              </form>
            )}
          </RetroCard>
        ))}
      </div>
    </div>
  );
}
