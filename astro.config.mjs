import { defineConfig } from 'astro/config';

// build.format 'file' => dist/donate.html etc., matching the URLs the site
// has always had (with Vercel cleanUrls stripping the .html extension).
export default defineConfig({
  build: { format: 'file' },
});
