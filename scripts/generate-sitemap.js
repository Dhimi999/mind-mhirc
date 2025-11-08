import { writeFileSync } from 'fs';
import { generateSitemap } from '../src/utils/sitemap.js';

const baseUrl = 'https://mind-mhirc.my.id';

const urls = [
  // Core pages
  { loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8' },
  { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.3' },
  { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.3' },
  { loc: `${baseUrl}/cookies`, changefreq: 'yearly', priority: '0.2' },
  
  // Services landing
  { loc: `${baseUrl}/services`, changefreq: 'monthly', priority: '0.8' },
  
  // Individual services with tabs
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
  
  // Auth pages (low priority, still indexable for SEO landing)
  { loc: `${baseUrl}/login`, changefreq: 'yearly', priority: '0.2' },
  { loc: `${baseUrl}/forget-password-by-email`, changefreq: 'yearly', priority: '0.1' },
  { loc: `${baseUrl}/complete-profile`, changefreq: 'yearly', priority: '0.1' },
];

const xml = generateSitemap(urls);
writeFileSync('public/sitemap-static.xml', xml, 'utf-8');
console.log('✅ Static sitemap generated at public/sitemap-static.xml');
