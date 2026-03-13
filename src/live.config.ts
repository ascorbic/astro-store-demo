import { defineLiveCollection } from "astro:content";
import { z } from "astro/zod";
import { productLoader } from "./loaders/products";

const products = defineLiveCollection({
	loader: productLoader(),
	schema: z.object({
		id: z.string(),
		name: z.string(),
		description: z.string(),
		price: z.number(),
		category: z.string(),
		image: z.string(),
		inStock: z.boolean(),
		lastModified: z.string(),
	}),
});

export const collections = { products };
