import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// makes text safe to drop inside an html attribute
function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// fills the page title and share text in index.html from the site content
function seoTags(): Plugin {
  return {
    name: 'seo-tags',
    transformIndexHtml(html) {
      const { seo } = JSON.parse(readFileSync('src/content/site.json', 'utf8'))
      return html
        .replaceAll('%SEO_TITLE%', escapeHtml(seo.title))
        .replaceAll('%SEO_DESCRIPTION%', escapeHtml(seo.description))
        .replaceAll('%SEO_SHARE_TITLE%', escapeHtml(seo.shareTitle))
        .replaceAll('%SEO_SHARE_DESCRIPTION%', escapeHtml(seo.shareDescription))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoTags()],
  build: {
    rollupOptions: {
      // the public site and the admin dashboard are two separate pages
      input: { main: 'index.html', admin: 'admin/index.html' },
    },
  },
})
