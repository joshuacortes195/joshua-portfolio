import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sitePath } from './src/lib/links'

// makes text safe to drop inside an html attribute
function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// fills the page title, share text and the no-javascript block in index.html from the site content
function seoTags(): Plugin {
  return {
    name: 'seo-tags',
    transformIndexHtml(html) {
      const site = JSON.parse(readFileSync('src/content/site.json', 'utf8'))
      // a missing seo block falls back to my name instead of breaking the build
      const seo = site.seo ?? {}
      const title = seo.title ?? site.name ?? ''
      const description = seo.description ?? ''
      // job title and focus line from the hero, on one line
      const role = [site.hero?.title, site.hero?.subtitle].filter(Boolean).join(', ')
      // the resume link has to be a plain file on this site, same rule the page itself uses
      const resume = sitePath(site.resume) ?? '/'
      return html
        .replaceAll('%SEO_TITLE%', escapeHtml(title))
        .replaceAll('%SEO_DESCRIPTION%', escapeHtml(description))
        .replaceAll('%SEO_SHARE_TITLE%', escapeHtml(seo.shareTitle ?? title))
        .replaceAll('%SEO_SHARE_DESCRIPTION%', escapeHtml(seo.shareDescription ?? description))
        .replaceAll('%SITE_NAME%', escapeHtml(site.name ?? ''))
        .replaceAll('%SITE_ROLE%', escapeHtml(role))
        .replaceAll('%SITE_EMAIL%', escapeHtml(site.email ?? ''))
        .replaceAll('%SITE_RESUME%', escapeHtml(resume))
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
