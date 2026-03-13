import type { APIContext } from 'astro';
import { updateProduct, getProduct } from '../../data/store';

export async function POST(context: APIContext) {
  const body = await context.request.json();
  const { productId, price } = body;

  if (!productId || typeof price !== 'number') {
    return Response.json(
      { error: 'productId and price are required' },
      { status: 400 },
    );
  }

  const existing = getProduct(productId);
  if (!existing) {
    return Response.json(
      { error: `Product "${productId}" not found` },
      { status: 404 },
    );
  }

  const updated = updateProduct(productId, { price });

  return Response.json({
    product: updated,
    message: `Price updated for ${updated!.name}`,
    tags: [`product-${productId}`, `category-${updated!.category}`, 'products'],
  });
}
