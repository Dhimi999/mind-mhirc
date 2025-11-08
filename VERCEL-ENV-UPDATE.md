# 🔧 Vercel Environment Variables Update

## ❌ HAPUS Variable Ini (Tidak Digunakan)

**Variable:** `PRERENDER`

**Kenapa dihapus:**
- Prerendering disabled karena Puppeteer dependency issue di Vercel
- Tidak ada gunanya lagi untuk set `PRERENDER=1`
- Build tidak akan prerender routes

**Cara hapus:**
1. Buka Vercel Dashboard → Project → Settings
2. Pilih "Environment Variables"
3. Cari `PRERENDER`
4. Klik icon delete/trash
5. Save changes

---

## ✅ PASTIKAN Variable Ini ADA (Untuk Dynamic Sitemap)

Jika Anda punya blog posts di Supabase dan ingin muncul di sitemap:

**Variable:** `VITE_SUPABASE_URL`
- **Value:** URL Supabase project Anda
- **Environment:** Production
- **Contoh:** `https://xxxxx.supabase.co`

**Variable:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Service role key dari Supabase (secret!)
- **Environment:** Production
- **Catatan:** Ini untuk server-side API, bukan client-side

**Cara set:**
1. Buka Vercel Dashboard → Project → Settings
2. Pilih "Environment Variables"
3. Tambahkan variable baru
4. Pilih "Production" environment
5. Save

---

## ℹ️ Catatan

**Jika tidak set Supabase env variables:**
- Build tetap sukses
- Static sitemap tetap ada (~25 core URLs)
- Dynamic sitemap `/api/sitemap` fallback ke minimal sitemap
- Google tetap bisa crawl dari static sitemap

**Jadi optional!** Prioritas deploy dulu, optimize kemudian.
