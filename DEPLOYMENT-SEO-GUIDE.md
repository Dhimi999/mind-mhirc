# 🚀 SEO & Indexing - Deployment Guide

## ✅ Yang Sudah Diimplementasikan (Solusi Komprehensif)

### 1. **Triple Sitemap Strategy** 🎯

**A. Sitemap Index** (`/sitemap.xml`)
- Sitemap utama yang menjadi entry point untuk Google
- Mengarah ke 2 sitemap:
  1. Static sitemap (selalu available, cepat)
  2. Dynamic sitemap (blog posts terbaru dari Supabase)

**B. Static Sitemap** (`/sitemap-static.xml`)
- Generate saat build time
- Berisi semua halaman core/service/landing
- **Selalu tersedia** bahkan jika serverless function error
- Fast & reliable

**C. Dynamic Sitemap** (`/api/sitemap`)
- Serverless function dengan robust error handling
- Fetch blog posts dari Supabase dengan timeout protection (3s max)
- Fallback ke minimal sitemap jika error
- **Tidak pernah return 500** ke Google

### 2. **Prerendering Aktif** ✨

**Perubahan di `vite.config.ts`:**
```typescript
// SEBELUM (prerender disabled di Vercel):
const shouldPrerender = mode === 'production' && !isVercel && process.env.PRERENDER === '1'

// SEKARANG (prerender enabled karena Anda sudah set PRERENDER=1):
const shouldPrerender = mode === 'production' && process.env.PRERENDER === '1'
```

**Hasil:**
- Halaman-halaman utama akan di-prerender menjadi HTML static
- Google crawler dapat langsung baca konten tanpa execute JS
- Meta tags dari Helmet terlihat oleh crawler
- Canonical URLs, OG tags, structured data terekstrak

**Halaman yang di-prerender:**
- `/` (homepage)
- `/about`
- `/privacy`, `/cookies`, `/tests`, `/services`
- `/spiritual-budaya/*` (semua tabs)
- `/hibrida-cbt/*` (semua tabs)
- `/safe-mother`
- `/blog` (landing)

### 3. **Routing Configuration Fixed** 🔧

**`vercel.json` diperbaiki:**
- ❌ **DIHAPUS:** Redirect 302 dari `/sitemap.xml` → `/api/sitemap`
- ✅ **DITAMBAH:** Direct rewrites untuk semua sitemap endpoints
- ✅ **URUTAN TEPAT:** API routes sebelum catch-all SPA rewrite

**Struktur baru:**
```json
{
  "redirects": [],  // No more redirects!
  "rewrites": [
    { "source": "/sitemap.xml", "destination": "/sitemap.xml" },
    { "source": "/sitemap-static.xml", "destination": "/sitemap-static.xml" },
    { "source": "/api/sitemap", "destination": "/api/sitemap" },
    // ... API routes
    { "source": "/:path*", "destination": "/index.html" }  // Catch-all terakhir
  ]
}
```

### 4. **Error Handling & Resilience** 🛡️

**Di `/api/sitemap.js`:**
- ✅ Headers set **sebelum** try-catch (ensure XML response)
- ✅ Timeout protection untuk Supabase query (3s max)
- ✅ Graceful fallback jika Supabase error
- ✅ Minimal valid sitemap sebagai last resort
- ✅ Never return 500 - always valid XML

**Benefit:**
- Google **selalu** dapat valid sitemap
- Tidak ada "cannot fetch sitemap" error
- Robust terhadap cold start/timeout

### 5. **Build Process Updated** 🔨

**`package.json` scripts:**
```json
{
  "build": "npm run generate:sitemap && vite build && ..."
}
```

**Flow:**
1. Generate static sitemap → `public/sitemap-static.xml`
2. Vite build (dengan prerender aktif)
3. Cleanup duplicate sitemap.xml dari dist

---

## 📋 CHECKLIST PRE-DEPLOYMENT

### A. Environment Variables di Vercel

Pastikan sudah set:

- [x] `PRERENDER=1` (Production) - **Sudah Anda set**
- [ ] `VITE_SUPABASE_URL` - URL Supabase project
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key untuk server-side

**Cara set di Vercel:**
1. Buka Vercel Dashboard → Project → Settings
2. Pilih "Environment Variables"
3. Tambahkan variable untuk "Production" environment

### B. Vercel Build Configuration

Di **Vercel Dashboard → Project → Settings → Build & Development Settings**:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### C. Git Commit & Push

```bash
git add .
git commit -m "fix: comprehensive SEO indexing improvements

- Implement triple sitemap strategy (index + static + dynamic)
- Enable prerendering for all major routes
- Fix Vercel routing config (remove redirects)
- Add robust error handling to sitemap API
- Add timeout protection for Supabase queries
- Generate static sitemap at build time"
git push origin main
```

---

## 🧪 TESTING SETELAH DEPLOY

### 1. Test Sitemap Endpoints

**A. Sitemap Index:**
```
https://mind-mhirc.my.id/sitemap.xml
```
**Expected:** XML dengan 2 sitemap child (static + dynamic)

**B. Static Sitemap:**
```
https://mind-mhirc.my.id/sitemap-static.xml
```
**Expected:** XML dengan ~25 core URLs

**C. Dynamic Sitemap:**
```
https://mind-mhirc.my.id/api/sitemap
```
**Expected:** XML dengan core URLs + blog posts (jika ada)

### 2. Test Prerendered Pages

**Cek View Page Source:**
```
https://mind-mhirc.my.id/
https://mind-mhirc.my.id/about
https://mind-mhirc.my.id/spiritual-budaya
https://mind-mhirc.my.id/hibrida-cbt
```

**Expected di HTML source:**
- ✅ Title tag berisi judul halaman (bukan generic)
- ✅ Meta description sesuai halaman
- ✅ Canonical link tag ada
- ✅ OG tags (og:title, og:description, og:image)
- ✅ Twitter card tags
- ✅ Konten HTML terrender (bukan hanya `<div id="root"></div>`)

**Jika prerender berhasil:**
- Anda akan lihat konten React sudah ter-inject dalam HTML
- Meta tags dari Helmet sudah ada di `<head>`

**Jika prerender gagal:**
- Hanya ada meta tags generic dari `index.html`
- Body hanya `<div id="root"></div>` kosong

### 3. Google Rich Results Test

**URL:** https://search.google.com/test/rich-results

Test URL berikut:
```
https://mind-mhirc.my.id/
https://mind-mhirc.my.id/blog
https://mind-mhirc.my.id/spiritual-budaya
```

**Expected:**
- ✅ Page dapat di-render
- ✅ Structured data terdeteksi (jika ada JSON-LD)
- ✅ Meta tags terbaca

---

## 🔍 SUBMIT KE GOOGLE SEARCH CONSOLE

### 1. Submit Sitemap

**URL untuk submit:**
```
https://mind-mhirc.my.id/sitemap.xml
```

**Langkah:**
1. Buka Google Search Console
2. Pilih property `mind-mhirc.my.id`
3. Sidebar → Sitemaps
4. Masukkan: `sitemap.xml` (tanpa domain)
5. Klik "Submit"

**Expected result:**
- Status: "Success" atau "Couldn't fetch"
- Jika "Couldn't fetch":
  - Wait 24 hours
  - Google perlu waktu untuk re-crawl
  - Pastikan sitemap accessible (test manual di browser)

### 2. Request Indexing untuk Homepage

**Langkah:**
1. Google Search Console → URL Inspection
2. Masukkan: `https://mind-mhirc.my.id/`
3. Klik "Request Indexing"
4. Wait beberapa hari untuk indexing

### 3. Monitor Indexing Status

**Check setelah 3-7 hari:**
- Google Search Console → Coverage
- Lihat berapa halaman yang terindeks
- Check error messages jika ada

---

## 🚨 TROUBLESHOOTING

### Issue: "Couldn't fetch sitemap"

**Possible causes:**
1. Sitemap belum deployed
2. Routing config belum apply
3. DNS propagation delay
4. Vercel deployment issue

**Fix:**
1. Test manual: buka `https://mind-mhirc.my.id/sitemap.xml` di browser
2. Pastikan return valid XML (bukan HTML/error page)
3. Check response headers: `Content-Type: application/xml`
4. Wait 24-48 hours, Google re-crawl otomatis

### Issue: Prerender tidak jalan

**Symptoms:**
- View source masih kosong (`<div id="root"></div>`)
- Meta tags masih generic

**Check:**
1. Vercel environment variable `PRERENDER=1` sudah set?
2. Build logs di Vercel ada mention "prerender"?
3. Puppeteer dependencies terinstall?

**Fix jika Puppeteer error di Vercel:**
```json
// package.json - tambahkan dependencies
{
  "dependencies": {
    "puppeteer-core": "^21.0.0",
    "chrome-aws-lambda": "^10.1.0"
  }
}
```

Atau **fallback plan:** Disable prerender sementara, rely on sitemap dulu.

### Issue: API Sitemap timeout

**Symptoms:**
- `/api/sitemap` slow atau error 500/timeout

**Check:**
1. Vercel function logs untuk error messages
2. Supabase query performance
3. Blog posts table size

**Fix:**
- Timeout sudah di-set 3s
- Fallback ke static sitemap otomatis
- Jika tetap issue, bisa kurangi timeout ke 2s:
  ```javascript
  setTimeout(() => reject(new Error('timeout')), 2000)
  ```

### Issue: Blog posts tidak muncul di sitemap

**Check:**
1. Environment variables Supabase sudah set?
2. `SUPABASE_SERVICE_ROLE_KEY` valid?
3. Permissions table `blog_posts`?

**Debug:**
- Lihat Vercel function logs
- Harusnya ada log: `✅ Loaded X blog posts for sitemap`
- Atau warning: `Blog fetch failed...`

**Fallback:**
- Jika blog posts tidak critical, biarkan fetch gagal
- Static sitemap tetap available untuk core pages

---

## 📊 EXPECTED TIMELINE

| Waktu | Status |
|-------|--------|
| **T+0 (Deploy)** | Sitemap submitted, prerendered pages live |
| **T+1 day** | Google mulai crawl sitemap |
| **T+3 days** | Beberapa halaman mulai terindeks |
| **T+7 days** | Mayoritas halaman terindeks |
| **T+14 days** | Full indexing coverage |

---

## ✅ SUCCESS METRICS

**Indicators bahwa SEO fix berhasil:**

1. ✅ **Sitemap Status:** "Success" di Google Search Console
2. ✅ **Indexed Pages:** >15 pages dalam 7 hari
3. ✅ **Coverage:** Tidak ada "Discovered - not indexed" untuk halaman penting
4. ✅ **Rich Results:** Structured data terdeteksi di test tools
5. ✅ **View Source:** Meta tags dinamis terlihat di HTML source
6. ✅ **Search Appearance:** Halaman muncul di Google Search dengan title/description yang tepat

---

## 🎯 NEXT STEPS (OPTIONAL)

### A. Monitor & Optimize

1. **Google Search Console:**
   - Monitor "Performance" untuk impressions/clicks
   - Check "Coverage" untuk indexing issues
   - Review "Enhancements" untuk structured data

2. **Google Analytics:**
   - Track organic search traffic
   - Monitor landing pages performance

### B. Advanced SEO

1. **Structured Data:**
   - Add JSON-LD for Organization
   - Add BreadcrumbList for navigation
   - Add FAQ schema untuk halaman layanan

2. **Image SEO:**
   - Optimize OG images (1200x630px)
   - Add alt text untuk semua images
   - Use WebP format untuk faster load

3. **Performance:**
   - Optimize Lighthouse scores
   - Improve Core Web Vitals
   - Reduce bundle size

---

## 📞 SUPPORT

Jika ada masalah setelah deploy:
1. Check Vercel deployment logs
2. Inspect sitemap di browser (view source)
3. Test dengan Google Rich Results Test
4. Wait 24-48 hours before panic (Google butuh waktu crawl)

**Remember:** Indexing adalah proses bertahap, bukan instant. Kesabaran adalah kunci! 🚀
