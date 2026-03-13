# De Gracht — Demo Walkthrough

Live demo of an Astro 6 store showing live content collections, route caching, cache invalidation, swappable providers, CSP, Fonts API, and Vue islands.

## Setup

```bash
npm run dev
# Open two tabs: http://localhost:4321 (store) and http://localhost:4321/admin (dashboard)
```

## 1. "Here's a store"

Open the store. Browse the product grid. Click through to a product. Hit "Add to Cart" — cart icon updates. Don't explain anything yet, just let it breathe.

## 3. "Where does the data come from?"

Show three files:

1. **`src/live.config.ts`** — the collection definition with `defineLiveCollection()` and a Zod schema
2. **`src/loaders/products.ts`** — the LiveLoader. Returns product data plus `cacheHint` with tags (`products`, `product-{id}`)
3. **`src/pages/products/[id].astro`** — the page. `getLiveEntry('products', id)` returns the entry with cache metadata baked in. `Astro.cache.set(entry)` passes it straight through. Three files, and the data flows from source to page with cache metadata attached.

## 4. "It's cached"

- Refresh the product page — point at the debug bar. "Rendered at" timestamp hasn't changed. The page is served from the in-memory cache
- Show `astro.config.mjs` → `routeRules`: two lines give `/products/[slug]` a 5-minute cache with 1-hour stale-while-revalidate, and `/api/products` a 60-second cache
- This is `memoryCache()` — a built-in LRU cache provider. No Redis, no infrastructure, works out of the box

## 5. "Now break it"

- Switch to the Admin tab (Vue island with `client:load`)
- Click "Bump Price" on Stroopwafels — price changes via API, status shows old → new price
- Click "Invalidate" — hits `/api/invalidate` which calls `context.cache.invalidate({ tags })`
- The invalidation log shows which tags were purged
- Switch back to the store tab, refresh — new price, fresh timestamp. Cache was purged, page re-rendered
- Show the invalidate endpoint: it's 5 lines. `context.cache.invalidate({ tags })` does all the work

## 6. "Swap the provider"

- In `astro.config.mjs`, comment out `memoryCache()`, uncomment `cdnCacheProvider()`
- Restart the dev server
- Refresh a product page, open DevTools → Network → response headers
- `Cache-Control: public, max-age=300, stale-while-revalidate=3600`
- `Cache-Tag: product-stroopwafel, products`
- `Last-Modified` with the entry's timestamp
- Same app, same code, different infrastructure strategy. "This is what Cloudflare, Fastly, or Vercel would see. Swap one line and your caching moves from in-process to the edge."

## 7. Quick hits

**CSP:**

- Show `security: { csp: true }` in the config — one line
- Open response headers — `Content-Security-Policy` with nonces
- View source — inline scripts have `nonce` attributes automatically injected
- No manual header management, no nonce plumbing

**Fonts:**

- Show the `fonts` array in config — two Google Fonts with CSS variables
- Show `Layout.astro` — `<Font cssVariable="--font-display" preload />`
- Open DevTools → Network — fonts are self-hosted (no Google Fonts requests), preloaded via `<link rel="preload">`

## Key Files

| File                                | Shows                                      |
| ----------------------------------- | ------------------------------------------ |
| `astro.config.mjs`                  | Fonts, CSP, route caching, provider swap   |
| `src/live.config.ts`                | Live collection + Zod schema               |
| `src/loaders/products.ts`           | LiveLoader with cache hints                |
| `src/pages/products/[id].astro`     | `getLiveEntry()` + `Astro.cache.set()`     |
| `src/pages/api/invalidate.ts`       | `context.cache.invalidate({ tags })`       |
| `src/cache/cdn-provider.ts`         | Custom provider — headers only, no caching |
| `src/components/AddToCart.vue`      | Vue island (`client:visible`)              |
| `src/components/AdminDashboard.vue` | Vue island (`client:load`)                 |
