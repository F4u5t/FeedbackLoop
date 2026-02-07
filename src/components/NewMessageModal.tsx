'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RetroInput } from '@/components/ui/RetroInput';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroCard } from '@/components/ui/RetroCard';

interface NewMessageModalProps {
  users: Array<{ id: string; username: string; display_name: string; avatar_url?: string }>;
  currentUserId: string;
  onClose: () => void;
}

export function NewMessageModal({ users, currentUserId, onClose }: NewMessageModalProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u.id !== currentUserId)
      .filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.display_name?.toLowerCase().includes(search.toLowerCase())
      );
  }, [users, search, currentUserId]);

  const handleSelectUser = (userId: string) => {
    router.push(`/messages/${userId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <RetroCard variant="default" className="w-full max-w-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-terminal-green font-bold text-lg mb-2">=[[ START CONVERSATION ]]=</h3>
            <p className="text-terminal-dim text-xs">Select a user to message</p>
          </div>

          <RetroInput
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-64 overflow-y-auto space-y-2 border border-terminal-border p-2 bg-terminal-black">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className="w-full text-left px-3 py-2 hover:bg-terminal-border transition-colors border border-transparent hover:border-terminal-green"
                >
                  <p className="text-terminal-green font-bold text-sm">{user.display_name || user.username}</p>
                  <p className="text-terminal-dim text-xs">@{user.username}</p>
                </button>
              ))
            ) : (
              <p className="text-terminal-dim text-xs text-center py-4">No users found</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <RetroButton type="button" variant="ghost" onClick={onClose}>
              CANCEL
            </RetroButton>
          </div>
        </div>
      </RetroCard>
    </div>
  );
}
