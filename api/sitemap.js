// File: /api/sitemap.js
// Dynamic sitemap endpoint with robust error handling and timeout protection
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

export default async function handler(req, res) {
  // Set headers FIRST to ensure proper response even on error
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  
  try {
    const baseUrl = getBaseUrl(req);
    
    // Static URLs - always available
    const staticUrls = [
      // Core
      { loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8' },
      { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.3' },
      { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.3' },
      { loc: `${baseUrl}/cookies`, changefreq: 'yearly', priority: '0.2' },
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
      { loc: `${baseUrl}/login`, changefreq: 'yearly', priority: '0.2' },
      { loc: `${baseUrl}/forget-password-by-email`, changefreq: 'yearly', priority: '0.1' },
      { loc: `${baseUrl}/complete-profile`, changefreq: 'yearly', priority: '0.1' },
    ];

    // Try to load blog posts with timeout protection
    let blogUrls = [];
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        // Create timeout promise (3 seconds max for Supabase query)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase query timeout')), 3000)
        );
        
        const sb = createClient(supabaseUrl, supabaseKey);
        const queryPromise = sb
          .from('blog_posts')
          .select('slug, updated_date')
          .order('updated_date', { ascending: false });
        
        // Race between query and timeout
        const { data: blogPosts, error } = await Promise.race([queryPromise, timeoutPromise]);
        
        if (error) {
          console.warn('Supabase error (will use static URLs only):', error.message);
        } else if (blogPosts && blogPosts.length > 0) {
          blogUrls = blogPosts.map(post => ({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: post.updated_date?.split('T')[0],
            changefreq: 'weekly',
            priority: '0.8',
          }));
          console.log(`✅ Loaded ${blogUrls.length} blog posts for sitemap`);
        }
      } catch (e) {
        console.warn('Blog fetch failed (will use static URLs only):', e.message);
        // Continue with static URLs only - this is not fatal
      }
    } else {
      console.warn('Supabase credentials not available, using static sitemap only');
    }

    const allUrls = [...staticUrls, ...blogUrls];
    const xml = generateSitemap(allUrls);

    res.status(200).send(xml);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    
    // Return minimal valid sitemap instead of 500 error
    // This ensures Google always gets SOMETHING instead of failing completely
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mind-mhirc.my.id/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mind-mhirc.my.id/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://mind-mhirc.my.id/blog</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    
    res.status(200).send(fallbackXml);
  }
}
