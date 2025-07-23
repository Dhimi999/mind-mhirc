export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
}

export function generateSitemap(urls: SitemapUrl[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = '</urlset>';

  const urlElements = urls.map(url => {
    let urlElement = `  <url>\n    <loc>${url.loc}</loc>`;
    
    if (url.lastmod) {
      urlElement += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      urlElement += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority) {
      urlElement += `\n    <priority>${url.priority}</priority>`;
    }
    
    urlElement += '\n  </url>';
    return urlElement;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlElements}\n${urlsetClose}`;
}

export function getStaticUrls(baseUrl: string): SitemapUrl[] {
  return [
    {
      loc: baseUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      loc: `${baseUrl}/services`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      loc: `${baseUrl}/blog`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      loc: `${baseUrl}/tests`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      loc: `${baseUrl}/login`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'yearly',
      priority: '0.5'
    },
    {
      loc: `${baseUrl}/privacy`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      loc: `${baseUrl}/terms`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];
}