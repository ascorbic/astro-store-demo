import type { LiveLoader } from "astro/loaders";
import { getAllProducts, getProduct, type Product } from "../data/store";

export function productLoader(): LiveLoader<Product> {
	return {
		name: "product-loader",
		loadCollection: async ({ filter }) => {
			try {
				const products = getAllProducts(filter);
				return {
					entries: products.map((product) => ({
						id: product.id,
						data: product,
						cacheHint: {
							tags: [`product-${product.id}`, `category-${product.category}`],
						},
					})),
					cacheHint: {
						tags: ["products"],
					},
				};
			} catch (err) {
				return {
					error: new Error(
						`Failed to load products: ${(err as Error).message}`,
					),
				};
			}
		},
		loadEntry: async ({ filter }) => {
			try {
				const id =
					typeof filter === "object" && "id" in filter
						? (filter as { id: string }).id
						: String(filter);
				const product = getProduct(id);
				if (!product) {
					return { error: new Error(`Product "${id}" not found`) };
				}
				return {
					id: product.id,
					data: product,
					cacheHint: {
						lastModified: new Date(product.lastModified),
						tags: [`product-${product.id}`, `category-${product.category}`],
					},
				};
			} catch (err) {
				return {
					error: new Error(`Failed to load product: ${(err as Error).message}`),
				};
			}
		},
	};
}
