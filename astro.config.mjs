import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ciniapp.com",
  trailingSlash: "ignore",
  build: { format: "directory" },
  // Keep unlisted, noindex pages out of the sitemap: /pro and /pro/thanks (Stripe return pages, reached from the app),
  // /invite (friend invite links) and the closed-beta sign-up (/beta-…, only sent to people directly).
  integrations: [sitemap({ filter: (page) => !/^\/(pro|invite|beta-[^/]+)(\/|$)/.test(new URL(page).pathname) })],
  devToolbar: { enabled: false },
});
