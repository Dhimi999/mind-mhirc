// File: api/sitemap.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateSitemap, type SitemapUrl } from '../src/utils/sitemap';

const baseUrl = 'https://mind-mhirc.my.id';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Static URLs
    const staticUrls: SitemapUrl[] = [
      { loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/services`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/tests`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/publications`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.9' },
    ];

    // Dynamic blog posts from Supabase
    const { data: blogPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_date')
      .eq('published', true);

    if (error) {
      console.error('Supabase error:', error);
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
    console.error('Error generating sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
}
