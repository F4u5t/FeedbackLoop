import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';

export default async function AdminTagsPage() {
  await requireAdmin();
  const supabase = createServerSupabaseClient();

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-amber font-bold text-lg mb-2">=[[ MANAGE TAGS ]]=</h2>
        <p className="text-terminal-dim text-xs">Create and edit category tags</p>
      </div>

      <div className="space-y-2">
        {tags && tags.length > 0 ? (
          tags.map((tag: any) => (
            <RetroCard key={tag.id} className="text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: tag.color }} className="font-bold">#{tag.name}</p>
                  <p className="text-terminal-dim">{tag.slug}</p>
                </div>
                <div className="flex gap-1">
                  <RetroButton variant="ghost" size="sm">[EDIT]</RetroButton>
                  <RetroButton variant="danger" size="sm">[DELETE]</RetroButton>
                </div>
              </div>
            </RetroCard>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">No tags</p>
        )}
      </div>
    </div>
  );
}
