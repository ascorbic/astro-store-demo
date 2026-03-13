import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ url }, next) => {
  const start = performance.now();
  const result = await next();

  // Admin routes should never be cached
  if (url.pathname.startsWith('/admin')) {
    result.headers.set('Cache-Control', 'no-store');
  }

  const duration = performance.now() - start;
  result.headers.set('Server-Timing', `middleware;dur=${duration.toFixed(2)}`);

  return result;
});
