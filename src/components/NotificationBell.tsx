'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/lib/types/database';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch {
      // Silent fail
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch {
      // Silent fail
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'vote': return '▲';
      case 'message': return '✉';
      case 'mention': return '@';
      default: return '•';
    }
  };

  const getNotificationLink = (n: Notification) => {
    switch (n.type) {
      case 'comment':
      case 'vote':
        return `/posts/${n.reference_id}`;
      case 'message':
        return `/messages/${n.reference_id}`;
      default:
        return '/feed';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-terminal-dim hover:text-terminal-green transition-colors p-1"
      >
        <span className="text-sm font-mono">[BELL]</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-terminal-red text-terminal-black text-xs font-bold px-1 min-w-[16px] text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 border border-terminal-border bg-terminal-black z-50 shadow-glow-green">
          <div className="flex items-center justify-between border-b border-terminal-border p-2">
            <span className="text-xs text-terminal-green font-bold">NOTIFICATIONS</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-terminal-dim hover:text-terminal-amber"
              >
                [MARK ALL READ]
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-terminal-dim text-xs">
                &gt; No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={getNotificationLink(n)}
                  onClick={() => setIsOpen(false)}
                  className={`
                    block p-2 border-b border-terminal-border hover:bg-terminal-highlight
                    transition-colors text-xs
                    ${!n.read ? 'border-l-2 border-l-terminal-green' : ''}
                  `}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-terminal-green">{getNotificationIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`${n.read ? 'text-terminal-dim' : 'text-terminal-white'}`}>
                        {n.message || `New ${n.type}`}
                      </p>
                      <p className="text-terminal-dim mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
