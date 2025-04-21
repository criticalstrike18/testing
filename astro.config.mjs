// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },

  prefetch: true,
  site: 'https://playersclub88.netlify.app/',
  integrations: [sitemap(),react()],
});