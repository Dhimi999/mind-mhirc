// File: /api/sitemap.js
import { createClient } from '@supabase/supabase-js';
import { generateSitemap } from '../src/utils/sitemap.js';

function getBaseUrl(req) {
  // Prefer explicit env, otherwise derive from request host
  const envBase = process.env.SITE_BASE_URL && process.env.SITE_BASE_URL.trim();
  if (envBase) return envBase.replace(/\/$/, '');
  const host = (req?.headers?.host || '').trim();
  if (host) return `https://${host}`;
  return 'https://mind-mhirc.my.id';
}

// const supabase = createClient(
//   process.env.VITE_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

export default async function handler(req, res) {
  try {
    const baseUrl = getBaseUrl(req);
    const staticUrls = [
      // Core
      { loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.3' },
      { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.3' },
      // Services landing
      { loc: `${baseUrl}/services`, changefreq: 'monthly', priority: '0.8' },
      // Individual services (public landing + tabs)
      { loc: `${baseUrl}/safe-mother`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${baseUrl}/spiritual-budaya`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${baseUrl}/spiritual-budaya/pengantar`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/spiritual-budaya/jelajah`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${baseUrl}/spiritual-budaya/intervensi`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${baseUrl}/spiritual-budaya/psikoedukasi`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${baseUrl}/hibrida-cbt`, changefreq: 'weekly', priority: '0.9' },
      { loc: `${baseUrl}/hibrida-cbt/pengantar`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/hibrida-cbt/jelajah`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${baseUrl}/hibrida-cbt/intervensi-hibrida`, changefreq: 'weekly', priority: '0.7' },
      { loc: `${baseUrl}/hibrida-cbt/psikoedukasi`, changefreq: 'weekly', priority: '0.7' },
      // Content hubs
      { loc: `${baseUrl}/tests`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/publications`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.9' },
    ];

    // Try to load blog posts if Supabase credentials are available
    let blogUrls = [];
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const sb = createClient(supabaseUrl, supabaseKey);
        const { data: blogPosts, error } = await sb
          .from('blog_posts')
          .select('slug, updated_date');
        if (error) {
          console.error('Supabase error:', error);
        }
        blogUrls = (blogPosts || []).map(post => ({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: post.updated_date?.split('T')[0],
          changefreq: 'weekly',
          priority: '0.8',
        }));
      } catch (e) {
        console.error('Supabase client init/fetch failed:', e);
      }
    }

    const allUrls = [...staticUrls, ...blogUrls];
    const xml = generateSitemap(allUrls);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
}
