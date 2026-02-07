'use client';

import React from 'react';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import { TipTapEditor } from '@/components/TipTapEditor';
import Link from 'next/link';

interface NewPostFormProps {
  createPost: (formData: FormData) => Promise<void>;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export function NewPostForm({ createPost, tags = [] }: NewPostFormProps) {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-terminal-green font-bold text-lg mb-2">=[[ NEW POST ]]=</h2>
        <p className="text-terminal-dim text-xs">Share your idea or project</p>
      </div>

      <RetroCard variant="default">
        <form action={createPost} className="space-y-4">
          <RetroInput
            label="TITLE"
            name="title"
            placeholder="What's your idea?"
            required
            maxLength={200}
          />

          <div>
            <label className="block text-xs text-terminal-green font-bold uppercase tracking-wider mb-2">
              CONTENT
            </label>
            <TipTapEditor
              placeholder="Describe your idea or project..."
              onChange={(json, html) => {
                const hiddenJson = document.querySelector('input[name="content"]') as HTMLInputElement;
                const hiddenHtml = document.querySelector('input[name="contentHtml"]') as HTMLInputElement;
                if (hiddenJson) hiddenJson.value = JSON.stringify(json);
                if (hiddenHtml) hiddenHtml.value = html;
              }}
            />
            <input type="hidden" name="content" defaultValue="{}" />
            <input type="hidden" name="contentHtml" defaultValue="" />
          </div>

          <div>
            <label className="block text-xs text-terminal-green font-bold uppercase tracking-wider mb-2">
              TAGS
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-terminal-border p-2 bg-terminal-black">
              {tags?.map((tag: any) => (
                <label key={tag.id} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag.id}
                    className="w-3 h-3 rounded"
                  />
                  <span style={{ color: tag.color }}>#{tag.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <RetroButton type="submit">PUBLISH</RetroButton>
            <Link href="/feed">
              <RetroButton type="button" variant="ghost">CANCEL</RetroButton>
            </Link>
          </div>
        </form>
      </RetroCard>
    </div>
  );
}
