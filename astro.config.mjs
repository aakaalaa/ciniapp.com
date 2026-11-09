import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ciniapp.com",
  trailingSlash: "ignore",
  build: { format: "directory" },
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
