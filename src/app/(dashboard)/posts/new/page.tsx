import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RetroCard } from '@/components/ui/RetroCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { RetroInput, RetroTextArea } from '@/components/ui/RetroInput';
import { TipTapEditor } from '@/components/TipTapEditor';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewPostPage() {
  const user = await requireAuth();

  async function createPost(formData: FormData) {
    'use server';

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const contentHtml = formData.get('contentHtml') as string;
    const tags = formData.getAll('tags') as string[];

    if (!title || !content) {
      return;
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Create post
    const { data: post, error: postError } = (await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title,
        content: JSON.parse(content),
        content_html: contentHtml,
      } as any)
      .select()
      .single()) as any;

    if (postError || !post) {
      console.error('Post creation error:', postError);
      return;
    }

    // Add tags if any
    if (tags.length > 0) {
      const { data: tagRecords } = (await supabase
        .from('tags')
        .select('id')
        .in('id', tags)) as any;

      if (tagRecords && tagRecords.length > 0) {
        await (supabase
          .from('post_tags')
          .insert(tagRecords.map((t: any) => ({ post_id: post.id, tag_id: t.id })) as any)) as any;
      }
    }

    redirect(`/posts/${post.id}`);
  }

  const supabase = createServerSupabaseClient();
  const { data: tags } = (await supabase.from('tags').select('*')) as any;

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
