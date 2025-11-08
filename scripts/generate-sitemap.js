import { writeFileSync } from 'fs';
import { generateSitemap } from '../src/utils/sitemap.js';

const baseUrl = 'https://mind-mhirc.my.id';
const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

const urls = [
  // Core pages
  { loc: `${baseUrl}/`, changefreq: 'weekly', priority: '1.0', lastmod: today },
  { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.8', lastmod: today },
  { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.3', lastmod: today },
  { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.3', lastmod: today },
  { loc: `${baseUrl}/cookies`, changefreq: 'yearly', priority: '0.2', lastmod: today },
  
  // Services landing
  { loc: `${baseUrl}/services`, changefreq: 'monthly', priority: '0.8', lastmod: today },
  
  // Individual services with tabs
  { loc: `${baseUrl}/safe-mother`, changefreq: 'monthly', priority: '0.7', lastmod: today },
  
  { loc: `${baseUrl}/spiritual-budaya`, changefreq: 'weekly', priority: '0.9', lastmod: today },
  { loc: `${baseUrl}/spiritual-budaya/pengantar`, changefreq: 'weekly', priority: '0.8', lastmod: today },
  { loc: `${baseUrl}/spiritual-budaya/jelajah`, changefreq: 'weekly', priority: '0.7', lastmod: today },
  { loc: `${baseUrl}/spiritual-budaya/intervensi`, changefreq: 'weekly', priority: '0.7', lastmod: today },
  { loc: `${baseUrl}/spiritual-budaya/psikoedukasi`, changefreq: 'weekly', priority: '0.7', lastmod: today },
  
  { loc: `${baseUrl}/hibrida-cbt`, changefreq: 'weekly', priority: '0.9', lastmod: today },
  { loc: `${baseUrl}/hibrida-cbt/pengantar`, changefreq: 'weekly', priority: '0.8', lastmod: today },
  { loc: `${baseUrl}/hibrida-cbt/jelajah`, changefreq: 'weekly', priority: '0.7', lastmod: today },
  { loc: `${baseUrl}/hibrida-cbt/intervensi-hibrida`, changefreq: 'weekly', priority: '0.7', lastmod: today },
  { loc: `${baseUrl}/hibrida-cbt/psikoedukasi`, changefreq: 'weekly', priority: '0.7', lastmod: today },
  
  // Content hubs
  { loc: `${baseUrl}/tests`, changefreq: 'monthly', priority: '0.6', lastmod: today },
  { loc: `${baseUrl}/publications`, changefreq: 'monthly', priority: '0.6', lastmod: today },
  { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: '0.9', lastmod: today },
  
  // Auth pages (low priority, still indexable for SEO landing)
  { loc: `${baseUrl}/login`, changefreq: 'yearly', priority: '0.2', lastmod: today },
  { loc: `${baseUrl}/forget-password-by-email`, changefreq: 'yearly', priority: '0.1', lastmod: today },
  { loc: `${baseUrl}/complete-profile`, changefreq: 'yearly', priority: '0.1', lastmod: today },
];

const xml = generateSitemap(urls);
writeFileSync('public/sitemap-static.xml', xml, 'utf-8');
console.log('✅ Static sitemap generated at public/sitemap-static.xml');
