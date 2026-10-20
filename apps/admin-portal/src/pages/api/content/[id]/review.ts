import type { APIRoute } from 'astro';
import {
  decideStagedPost,
  type StagingDecision,
  WordPressApiError,
  WordPressConfigurationError,
} from '../../../../lib/wordpress';

const decisions: Record<string, StagingDecision> = {
  approve: 'approve',
  reject: 'reject',
  request_changes: 'request_changes',
};

export const POST: APIRoute = async (context) => {
  if (context.locals.user?.role !== 'content_reviewer') return context.redirect('/content', 303);
  const rawPostId = context.params.id ?? '';
  const postId = Number(rawPostId);
  if (!/^[1-9]\d*$/.test(rawPostId) || !Number.isSafeInteger(postId)) {
    return context.redirect('/content', 303);
  }

  const form = await context.request.formData();
  const decision = decisions[String(form.get('decision') ?? '')];
  const note = String(form.get('note') ?? '').trim();
  if (!decision || note.length > 5_000 || (decision === 'request_changes' && !note)) {
    return context.redirect(`/content/${postId}?error=backend-error`, 303);
  }

  try {
    await decideStagedPost(postId, decision, note);
  } catch (error) {
    const code = error instanceof WordPressConfigurationError
      ? 'backend-config'
      : error instanceof WordPressApiError
        ? error.status === 401 || error.status === 403
          ? 'backend-auth'
          : error.status === 503 ? 'backend-unavailable' : 'backend-error'
        : undefined;
    if (!code) throw error;
    return context.redirect(`/content/${postId}?error=${code}`, 303);
  }
  return context.redirect('/content?notice=decided', 303);
};
