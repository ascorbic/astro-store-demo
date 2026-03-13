import type { CacheProvider, CacheProviderFactory } from "astro";

const provider: CacheProviderFactory = () => {
	return {
		name: "cdn",

		setHeaders(options) {
			const headers = new Headers();

			const parts: string[] = [];
			if (options.maxAge != null) {
				parts.push("public");
				parts.push(`max-age=${options.maxAge}`);
			}
			if (options.swr != null) {
				parts.push(`stale-while-revalidate=${options.swr}`);
			}
			if (parts.length > 0) {
				headers.set("Cdn-Cache-Control", parts.join(", "));
			}

			if (options.tags?.length) {
				headers.set("Cache-Tag", options.tags.join(", "));
			}

			if (options.lastModified) {
				headers.set("Last-Modified", options.lastModified.toUTCString());
			}

			if (options.etag) {
				headers.set("ETag", options.etag);
			}

			return headers;
		},

		async invalidate({ tags, path }) {
			const target = tags
				? `tags=[${[tags].flat().join(", ")}]`
				: `path=${path}`;
			console.log(`[cdn] Purge: ${target}`);
		},
	} satisfies CacheProvider;
};

export default provider;

export const cdnCacheProvider = () => ({
	entrypoint: import.meta.url,
});
