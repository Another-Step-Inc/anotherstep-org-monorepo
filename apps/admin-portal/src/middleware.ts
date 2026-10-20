import { defineMiddleware } from 'astro:middleware';
import { getSessionUser } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  if (path.startsWith('/_') || /\.[a-z0-9]+$/i.test(path)) return next();

  context.locals.user = await getSessionUser(context.cookies.get('admin_session')?.value);
  if (!context.locals.user && path !== '/login' && path !== '/api/auth/login') {
    return context.redirect('/login');
  }
  if (context.locals.user && path === '/login') return context.redirect('/');

  return next();
});
