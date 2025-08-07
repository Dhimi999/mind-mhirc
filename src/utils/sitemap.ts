// File: /src/utils/sitemap.ts

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
    if (url.lastmod) urlElement += `\n    <lastmod>${url.lastmod}</lastmod>`;
    if (url.changefreq) urlElement += `\n    <changefreq>${url.changefreq}</changefreq>`;
    if (url.priority) urlElement += `\n    <priority>${url.priority}</priority>`;
    urlElement += '\n  </url>';
    return urlElement;
  }).join('\n');

  return `${xmlHeader}\n${urlsetOpen}\n${urlElements}\n${urlsetClose}`;
}
