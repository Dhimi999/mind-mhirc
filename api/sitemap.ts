// File: api/sitemap.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateSitemap, type SitemapUrl } from '../src/utils/sitemap';

const baseUrl = 'https://mind-mhirc.my.id';

// Pastikan ENV ini sudah disetel di Vercel (Settings > Environment Variables)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fallback & Validasi ENV
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Static pages
    const staticUrls: SitemapUrl[] = [
      { loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/services`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/tests`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/publications`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.9' },
    ];

    // Dynamic blog posts
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_date')
      .eq('published', true);

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).send('Failed to fetch blog posts');
    }

    const blogUrls: SitemapUrl[] = (blogPosts || []).map((post) => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.updated_date?.split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const xml = generateSitemap([...staticUrls, ...blogUrls]);

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).send('Internal Server Error');
  }
}
