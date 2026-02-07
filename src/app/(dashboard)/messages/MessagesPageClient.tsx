'use client';

import React, { useState } from 'react';
import { RetroButton } from '@/components/ui/RetroButton';
import { NewMessageModal } from '@/components/NewMessageModal';

interface MessagesPageClientProps {
  currentUserId: string;
  conversations: any[];
  allUsers: Array<{ id: string; username: string; display_name: string; avatar_url?: string }>;
}

export function MessagesPageClient({
  currentUserId,
  conversations,
  allUsers,
}: MessagesPageClientProps) {
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ MESSAGES ]]=</h2>
            <p className="text-terminal-dim text-xs">Direct messages with other users</p>
          </div>
          <RetroButton onClick={() => setShowNewMessageModal(true)}>NEW MESSAGE</RetroButton>
        </div>
      </div>

      <div className="space-y-2">
        {conversations.length > 0 ? (
          conversations.map((conv: any) => (
            <a key={conv.userId} href={`/messages/${conv.userId}`} className="block">
              <div className="p-3 border border-terminal-border hover:border-terminal-green transition-colors cursor-pointer bg-terminal-black">
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
              </div>
            </a>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">No conversations yet. Start one to begin!</p>
        )}
      </div>

      {showNewMessageModal && (
        <NewMessageModal
          users={allUsers}
          currentUserId={currentUserId}
          onClose={() => setShowNewMessageModal(false)}
        />
      )}
    </div>
  );
}
