import type { APIContext } from 'astro';
import { getAllProducts } from '../../data/store';

export function GET(context: APIContext) {
  context.cache.set({
    maxAge: 60,
    tags: ['products'],
  });

  const products = getAllProducts();
  return Response.json(products);
}
