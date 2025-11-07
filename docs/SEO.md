# SEO Setup and Maintenance Guide

Updated: 2025-11-07

This project now includes a standardized SEO setup for indexability on Google and social sharing.

## What’s Included

- Reusable `<SEO />` component (`src/components/seo/SEO.tsx`) with:
  - Title, description, canonical, keywords (from tags)
  - Open Graph (Facebook, LinkedIn) and Twitter Cards
  - JSON-LD Article schema for blog posts
- Page integrations:
  - Blog post pages with dynamic SEO from Supabase content
  - About, Privacy, Terms, Cookies, Service Detail pages
  - Program pages (Spiritual & Budaya, Hibrida Naratif CBT) already include meta via Helmet
- Sitemaps & robots:
  - `public/robots.txt` (disallows gated areas, allows assets)
  - `public/sitemap.xml` pointing to dynamic API endpoint
  - Dynamic `api/sitemap.js` generates URLs (core pages + program tabs + blog slugs when available)

## Submit to Google Search Console

1. Verify property for `https://mind-mhirc.my.id` (DNS recommended)
2. Submit sitemap: `https://mind-mhirc.my.id/sitemap.xml`
3. Use URL Inspection for key pages:
   - `/` `/about` `/services` `/blog` `/spiritual-budaya` `/hibrida-cbt`
4. Monitor coverage and enhancements (sitelinks, breadcrumbs, articles)

## Adding SEO to a Page

```
import SEO from "@/components/seo/SEO";

<SEO
  title="Page Title | Mind MHIRC"
  description="Short, keyword-rich description for the page."
  canonicalPath="/path"
/>
```

For articles:
```
<SEO
  title={`${post.title} | Blog Mind MHIRC`}
  description={post.excerpt}
  canonicalPath={`/blog/${post.slug}`}
  type="article"
  image={post.cover_image}
  publishedTime={post.published_date}
  modifiedTime={post.updated_date}
  tags={post.tags}
/>
```

## SPA Indexability Notes

- Googlebot is capable of rendering JavaScript; ensure critical content mounts quickly.
- Avoid blocking resources in `robots.txt`.
- Ensure canonical URLs are stable and reflect tabs/slugs correctly.
- For highly dynamic content, consider prerendering in future (e.g., `@prerenderer/rollup` or SSR) if crawl coverage is insufficient.

## Domain Hygiene

- All canonical/meta URLs derive from `getSiteBaseUrl()`.
- Fallback base updated to: `https://mind-mhirc.my.id`.
- Avoid hardcoding other domains; update links when migrating environments.

## Troubleshooting

- If blog pages show as Discovered – currently not indexed:
  - Ensure `api/sitemap.js` returns blog slugs with `lastmod`
  - Check response time and content rendering
  - Use URL Inspection → Test Live URL → Request Indexing

- If Helmet tags don’t appear:
  - Ensure `<HelmetProvider>` wraps the app (already configured in `App.tsx`).

