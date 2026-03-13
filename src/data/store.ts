import initialProducts from './products.json';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  lastModified: string;
}

// In-memory store so we can mutate prices for the demo
const products: Product[] = structuredClone(initialProducts) as Product[];

export function getAllProducts(filter?: { category?: string }): Product[] {
  if (filter?.category) {
    return products.filter((p) => p.category === filter.category);
  }
  return products;
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function updateProduct(
  id: string,
  data: Partial<Product>,
): Product | undefined {
  const product = products.find((p) => p.id === id);
  if (!product) return undefined;
  Object.assign(product, data, { lastModified: new Date().toISOString() });
  return product;
}
