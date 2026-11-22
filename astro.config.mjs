import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ciniapp.com",
  trailingSlash: "ignore",
  build: { format: "directory" },
  // /pro and /pro/thanks are only reached from the app (Stripe return pages) and are noindex, so keep them out of the sitemap.
  integrations: [sitemap({ filter: (page) => !/\/pro(\/|$)/.test(new URL(page).pathname) })],
  devToolbar: { enabled: false },
});
