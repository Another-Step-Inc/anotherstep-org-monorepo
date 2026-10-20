import type { APIRoute } from 'astro';
import { submitStagedPost, WordPressApiError, WordPressConfigurationError } from '../../../lib/wordpress';

export const POST: APIRoute = async (context) => {
  if (context.locals.user?.role !== 'content_author') return context.redirect('/content', 303);
  const form = await context.request.formData();
  const rawPostId = String(form.get('post_id') ?? '').trim();
  const postId = Number(rawPostId);
  const title = String(form.get('title') ?? '').trim();
  const content = String(form.get('content') ?? '').trim();
  if (!/^[1-9]\d*$/.test(rawPostId) || !Number.isSafeInteger(postId)
    || !title || title.length > 180 || !content || content.length > 20_000) {
    return context.redirect('/content/new?error=invalid', 303);
  }

  try {
    await submitStagedPost(postId, title, content);
  } catch (error) {
    const code = error instanceof WordPressConfigurationError
      ? 'backend-config'
      : error instanceof WordPressApiError
        ? error.status === 401 || error.status === 403
          ? 'backend-auth'
          : error.status === 503 ? 'backend-unavailable' : 'backend-error'
        : undefined;
    if (!code) throw error;
    return context.redirect(`/content/new?error=${code}`, 303);
  }
  return context.redirect('/content?notice=submitted', 303);
};
