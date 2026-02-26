import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Public credentials (anon key) – safe to use in serverless function
const SUPABASE_URL = "https://gfeuhclekmdxaatyyiez.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZXVoY2xla21keGFhdHl5aWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDI2MzIsImV4cCI6MjA1NjUxODYzMn0.zl3T3J2a8cCJxq5OI9IdAnWEYXSwdUwcJ6D_5MglXCI";

const SITE = "https://mind-mhirc.my.id";

/** Halaman statis dengan prioritas dan frekuensi update */
const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/services", priority: "0.9", changefreq: "monthly" },
  { path: "/services/konsultasi", priority: "0.7", changefreq: "monthly" },
  { path: "/services/edukasi", priority: "0.7", changefreq: "monthly" },
  { path: "/services/pendampingan", priority: "0.7", changefreq: "monthly" },
  { path: "/blog", priority: "0.9", changefreq: "daily" },
  { path: "/safe-mother", priority: "0.8", changefreq: "monthly" },
  { path: "/safe-mother/psikoedukasi", priority: "0.7", changefreq: "monthly" },
  { path: "/spiritual-budaya", priority: "0.8", changefreq: "monthly" },
  { path: "/hibrida-cbt", priority: "0.8", changefreq: "monthly" },
];

/** Escape karakter khusus XML */
function escXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlEntry(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string
): string {
  return `  <url>
    <loc>${escXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Supabase client untuk Node.js (tanpa localStorage)
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch semua blog posts yang dipublikasikan
    const { data: blogs, error } = await supabase
      .from("blog_posts")
      .select("id, slug, updated_date, published_date")
      .order("published_date", { ascending: false });

    if (error) {
      console.error("Supabase error fetching blog posts:", error.message);
    }

    // Buat URL entries untuk halaman statis
    const staticEntries = STATIC_ROUTES.map((r) =>
      urlEntry(`${SITE}${r.path}`, today, r.changefreq, r.priority)
    ).join("\n");

    // Buat URL entries untuk setiap blog post
    const blogEntries = (blogs ?? [])
      .map((post) => {
        const slug = post.slug || post.id;
        const lastmod = post.updated_date
          ? post.updated_date.split("T")[0]
          : post.published_date
          ? post.published_date.split("T")[0]
          : today;
        return urlEntry(
          `${SITE}/blog/${encodeURIComponent(slug)}`,
          lastmod,
          "monthly",
          "0.7"
        );
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticEntries}
${blogEntries}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    // Cache selama 24 jam di CDN, stale-while-revalidate 1 jam
    res.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=3600"
    );
    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap handler error:", err);
    res.status(500).send("Error generating sitemap");
  }
}
