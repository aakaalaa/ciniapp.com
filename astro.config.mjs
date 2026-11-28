import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ciniapp.com",
  trailingSlash: "ignore",
  build: { format: "directory" },
  // Old addresses that still work: the first beta link, sent to a few people before it was shortened to /beta.
  redirects: { "/beta-x7q4": "/beta" },
  // Keep unlisted, noindex pages out of the sitemap: /pro and /pro/thanks (Stripe return pages, reached from the app),
  // /invite (friend invite links), the closed-beta sign-up (/beta, sent to people directly) and /support, which only
  // forwards the app's old help link to /contact.
  integrations: [sitemap({ filter: (page) => !/^\/(pro|invite|beta|beta-x7q4|support)(\/|$)/.test(new URL(page).pathname) })],
  devToolbar: { enabled: false },
});
