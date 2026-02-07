'use client';

import { useEffect } from 'react';

export function ActivityTracker() {
  useEffect(() => {
    // Update activity on mount and every 2 minutes
    const updateActivity = async () => {
      try {
        await fetch('/api/users/activity', { method: 'POST' });
      } catch (error) {
        console.error('Failed to update activity:', error);
      }
    };

    updateActivity();
    const interval = setInterval(updateActivity, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
