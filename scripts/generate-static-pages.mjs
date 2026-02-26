/**
 * generate-static-pages.mjs
 *
 * Dijalankan setelah `vite build` oleh script "build" di package.json.
 *
 * CARA KERJA:
 * Setelah build, hanya ada satu dist/index.html. Skrip ini menduplikasi
 * file tersebut ke setiap subfolder route (contoh: dist/about/index.html)
 * dan menimpa meta tag (title, description, OG, Twitter Card, canonical)
 * dengan konten yang spesifik untuk halaman tersebut.
 *
 * MENGAPA INI PENTING:
 * - Bot social media (WhatsApp, Telegram, Facebook, Twitter/X) TIDAK
 *   menjalankan JavaScript → mereka membaca meta tag dari HTML mentah.
 * - Google Search Bot menjalankan JS (lewat react-helmet-async), namun
 *   pre-rendered HTML mempercepat indexing & crawl budget.
 * - Vercel memprioritaskan static file → dist/about/index.html akan
 *   langsung diserve tanpa melalui rewrite rule ke dist/index.html.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "../dist");
const SITE = "https://mind-mhirc.my.id";
const DEFAULT_OG_IMAGE = `${SITE}/og-image.png`;

/**
 * Definisi semua halaman publik.
 * - path     : URL path tanpa leading slash (dipakai sebagai nama folder di dist/)
 * - title    : <title> dan og:title dan twitter:title
 * - desc     : meta description, og:description, twitter:description
 * - ogImage  : (opsional) override OG image
 * - noIndex  : (opsional) tambahkan noindex,nofollow
 */
const PAGES = [
  {
    path: "about",
    title: "Tentang Kami | Mind MHIRC",
    desc: "Kenali Mind MHIRC – pusat inovasi dan riset kesehatan mental berbasis bukti untuk masyarakat Indonesia.",
  },
  {
    path: "services",
    title: "Layanan | Mind MHIRC",
    desc: "Layanan kesehatan mental profesional: konsultasi psikologis, program edukasi, dan pendampingan kelompok.",
  },
  {
    path: "blog",
    title: "Blog | Mind MHIRC",
    desc: "Artikel edukasi dan tips kesehatan mental terkini dari tim peneliti dan psikolog Mind MHIRC.",
  },
  {
    path: "safe-mother",
    title: "Safe Mother Program | Mind MHIRC",
    desc: "Program kesehatan mental maternal komprehensif: psikoedukasi, konsultasi, dan terapi CBT untuk ibu hamil dan pasca-nifas.",
  },
  {
    path: "spiritual-budaya",
    title: "Spiritual & Budaya | Mind MHIRC",
    desc: "Program intervensi berbasis kearifan spiritual dan budaya lokal Indonesia untuk kesehatan mental.",
  },
  {
    path: "hibrida-cbt",
    title: "Hibrida Naratif CBT | Mind MHIRC",
    desc: "Program terapi kognitif-perilaku berbasis naratif hibrida untuk pemulihan kesehatan mental.",
  },
  {
    path: "privacy",
    title: "Kebijakan Privasi | Mind MHIRC",
    desc: "Kebijakan privasi Mind MHIRC mengenai pengumpulan, penggunaan, dan perlindungan data pengguna.",
  },
  {
    path: "terms",
    title: "Syarat & Ketentuan | Mind MHIRC",
    desc: "Syarat dan ketentuan penggunaan layanan dan platform Mind MHIRC.",
  },
  {
    path: "cookies",
    title: "Kebijakan Cookie | Mind MHIRC",
    desc: "Informasi tentang penggunaan cookie pada platform Mind MHIRC.",
  },
  // Login tidak diindeks, tapi pre-render berguna agar social preview benar
  {
    path: "login",
    title: "Masuk | Mind MHIRC",
    desc: "Masuk ke akun Mind MHIRC Anda untuk mengakses layanan kesehatan mental.",
    noIndex: true,
  },
];

/**
 * Ganti nilai atribut content dari sebuah meta tag di HTML string.
 * Mendukung format:
 *   <meta name="..." content="...">
 *   <meta property="..." content="...">
 *   <link rel="..." href="...">
 */
function replaceMeta(html, attribute, value, valueAttr = "content") {
  // Escape karakter yang berpotensi merusak HTML
  const safeValue = value.replace(/"/g, "&quot;");
  const re = new RegExp(
    `(<(?:meta|link)[^>]*${attribute}[^>]*${valueAttr}=")[^"]*(")`,"i"
  );
  if (re.test(html)) {
    return html.replace(re, `$1${safeValue}$2`);
  }
  // Coba urutan atribut terbalik
  const re2 = new RegExp(
    `(<(?:meta|link)[^>]*${valueAttr}=")[^"]*("[^>]*${attribute})`, "i"
  );
  return html.replace(re2, `$1${safeValue}$2`);
}

const template = readFileSync(join(DIST, "index.html"), "utf-8");

let generatedCount = 0;
let errorCount = 0;

for (const page of PAGES) {
  try {
    const url = `${SITE}/${page.path}`;
    const ogImage = page.ogImage || DEFAULT_OG_IMAGE;
    const dir = join(DIST, page.path);
    mkdirSync(dir, { recursive: true });

    let html = template;

    // 1. <title>
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${page.title}</title>`);

    // 2. <meta name="description">
    html = replaceMeta(html, 'name="description"', page.desc);

    // 3. <link rel="canonical">
    html = replaceMeta(html, 'rel="canonical"', url, "href");

    // 4. Open Graph
    html = replaceMeta(html, 'property="og:title"', page.title);
    html = replaceMeta(html, 'property="og:description"', page.desc);
    html = replaceMeta(html, 'property="og:url"', url);
    html = replaceMeta(html, 'property="og:image"', ogImage);

    // 5. Twitter Card
    html = replaceMeta(html, 'name="twitter:title"', page.title);
    html = replaceMeta(html, 'name="twitter:description"', page.desc);
    html = replaceMeta(html, 'name="twitter:image"', ogImage);

    // 6. noindex jika diperlukan
    if (page.noIndex) {
      html = replaceMeta(html, 'name="robots"', "noindex, nofollow");
    }

    writeFileSync(join(dir, "index.html"), html, "utf-8");
    console.log(`  ✓  /${page.path}/index.html`);
    generatedCount++;
  } catch (err) {
    console.error(`  ✗  /${page.path} – ${err.message}`);
    errorCount++;
  }
}

console.log(
  `\n📄 Static pages: ${generatedCount} generated, ${errorCount} errors.\n`
);
