import { requireAuth } from '@/lib/auth/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NewPostForm } from './NewPostForm';
import { redirect } from 'next/navigation';

export default async function NewPostPage() {
  await requireAuth();

  async function createPost(formData: FormData) {
    'use server';

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const contentHtml = formData.get('contentHtml') as string;
    const tags = formData.getAll('tags') as string[];

    if (!title) {
      return;
    }

    let parsedContent;
    try {
      parsedContent = content ? JSON.parse(content) : {};
    } catch (e) {
      console.error('Failed to parse content:', e);
      parsedContent = {};
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
        content: parsedContent,
        content_html: contentHtml,
      } as any)
      .select()
      .single()) as any;

    if (postError || !post) {
      console.error('Post creation error:', postError);
      throw new Error(postError?.message || 'Failed to create post');
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

  return <NewPostForm createPost={createPost} tags={tags || []} />;
}
