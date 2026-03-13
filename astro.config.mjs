// @ts-check
import { defineConfig, fontProviders, memoryCache } from "astro/config";
import node from "@astrojs/node";
import vue from "@astrojs/vue";
import { cdnCacheProvider } from "./src/cache/cdn-provider.ts";

export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [vue()],
  experimental: {
    cache: {
      provider: memoryCache(),
    },
    routeRules: {
      "/": { maxAge: 300, swr: 3600 },
      "/products/[slug]": { maxAge: 300, swr: 3600 },
      "/api/products": { maxAge: 60, tags: ["products"] },
    },
  },
  security: {
    csp: true,
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "DM Sans",
      cssVariable: "--font-body",
    },
    {
      provider: fontProviders.google(),
      name: "Playfair Display",
      cssVariable: "--font-display",
    },
  ],
});
