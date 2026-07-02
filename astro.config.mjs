// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Static pitch/demo site — booking form posts to a placeholder endpoint
// until a real backend (Formspree/Resend/etc.) is wired up for launch.
// Tailwind runs via the PostCSS plugin (postcss.config.mjs) rather than
// the Vite plugin, which currently breaks under Astro's bundled Vite/rolldown.
export default defineConfig({
  site: 'https://luanfreitastattoo.com',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
});
