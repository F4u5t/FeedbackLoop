import { requireAdmin } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';

export default async function AdminUsersPage() {
  await requireAdmin();
  const supabase = createServerSupabaseClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-amber font-bold text-lg mb-2">=[[ MANAGE USERS ]]=</h2>
        <p className="text-terminal-dim text-xs">View and control user access</p>
      </div>

      <div className="space-y-2">
        {users && users.length > 0 ? (
          users.map((user: any) => (
            <RetroCard key={user.id} className="text-xs">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-terminal-green font-bold">{user.display_name}</p>
                  <p className="text-terminal-dim">@{user.username}</p>
                  <p className="text-terminal-amber uppercase text-xs mt-1">{user.role}</p>
                </div>
                <div className="flex gap-1">
                  <RetroButton variant="ghost" size="sm">[PROMOTE]</RetroButton>
                  <RetroButton variant="danger" size="sm">[BAN]</RetroButton>
                </div>
              </div>
            </RetroCard>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">No users</p>
        )}
      </div>
    </div>
  );
}
