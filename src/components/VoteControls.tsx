'use client';

import React, { useState, useOptimistic } from 'react';
import { createClient } from '@/lib/supabase/client';

interface VoteControlsProps {
  postId: string;
  initialVoteCount: number;
  initialUserVote: number | null;
}

export function VoteControls({ postId, initialVoteCount, initialUserVote }: VoteControlsProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState<number | null>(initialUserVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (loading) return;
    setLoading(true);

    const previousVote = userVote;
    const previousCount = voteCount;

    // Optimistic update
    if (userVote === value) {
      // Remove vote
      setUserVote(null);
      setVoteCount(voteCount - value);
    } else {
      // New vote or change vote
      const diff = userVote ? value - userVote : value;
      setUserVote(value);
      setVoteCount(voteCount + diff);
    }

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        // Revert on error
        setUserVote(previousVote);
        setVoteCount(previousCount);
      } else {
        const data = await res.json();
        setVoteCount(data.vote_count);
        setUserVote(data.user_vote);
      }
    } catch {
      setUserVote(previousVote);
      setVoteCount(previousCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5 font-mono">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`
          text-lg leading-none px-1 transition-colors duration-100
          ${userVote === 1
            ? 'text-terminal-green'
            : 'text-terminal-dim hover:text-terminal-green'}
        `}
        title="Upvote"
      >
        ▲
      </button>
      <span
        className={`
          text-sm font-bold tabular-nums
          ${voteCount > 0 ? 'text-terminal-green' : voteCount < 0 ? 'text-terminal-red' : 'text-terminal-dim'}
        `}
      >
        {voteCount}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`
          text-lg leading-none px-1 transition-colors duration-100
          ${userVote === -1
            ? 'text-terminal-red'
            : 'text-terminal-dim hover:text-terminal-red'}
        `}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
