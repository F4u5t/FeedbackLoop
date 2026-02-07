'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OnlineUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  last_activity_at: string;
}

interface OnlineUsersProps {
  initialUsers: OnlineUser[];
  currentUserId: string;
}

export function OnlineUsers({ initialUsers, currentUserId }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState(initialUsers);
  const router = useRouter();

  // Refresh online users every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/users/online');
        if (res.ok) {
          const data = await res.json();
          setOnlineUsers(data.filter((u: OnlineUser) => u.id !== currentUserId));
        }
      } catch (error) {
        console.error('Failed to fetch online users:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleMessageClick = (userId: string) => {
    router.push(`/messages/${userId}`);
  };

  return (
    <div className="mt-6 border-t border-terminal-border pt-4">
      <h3 className="text-terminal-green font-bold text-xs uppercase mb-3">ONLINE USERS ({onlineUsers.length})</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-2 p-2 border border-terminal-border hover:border-terminal-green transition-colors bg-terminal-black text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="text-terminal-cyan font-bold truncate">
                  {user.display_name || user.username}
                </p>
                <p className="text-terminal-dim text-xs truncate">@{user.username}</p>
              </div>
              <button
                onClick={() => handleMessageClick(user.id)}
                className="px-2 py-1 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-black transition-colors text-xs whitespace-nowrap"
                title="Send message"
              >
                MSG
              </button>
            </div>
          ))
        ) : (
          <p className="text-terminal-dim text-xs">No users online</p>
        )}
      </div>
    </div>
  );
}
