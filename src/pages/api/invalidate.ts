import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
  const body = await context.request.json();
  const { productId, tags: requestedTags } = body;

  let tags: string[] = [];
  if (requestedTags && Array.isArray(requestedTags)) {
    tags = requestedTags;
  } else if (productId) {
    tags = [`product-${productId}`, 'products'];
  }

  await context.cache.invalidate({ tags });

  return Response.json({
    invalidated: tags,
    message: `Invalidated ${tags.length} cache tag(s)`,
    timestamp: new Date().toISOString(),
  });
}
