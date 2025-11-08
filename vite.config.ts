import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
// Load prerender plugin via CJS to avoid ESM require issues
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _prerenderMod = require('vite-plugin-prerender')
const prerender = _prerenderMod.default || _prerenderMod

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true'
  // Disable prerender di Vercel karena Puppeteer dependency issue
  // Rely on sitemap untuk SEO (sudah robust dengan static + dynamic)
  const shouldPrerender = mode === 'production' && process.env.PRERENDER === '1' && !isVercel
  
  return ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Enable SPA prerender for SEO only when explicitly enabled and not on Vercel
    shouldPrerender && prerender({
      staticDir: path.resolve(__dirname, 'dist'),
      routes: [
        '/',
        '/about',
        '/privacy',
        '/cookies',
        '/tests',
        '/services',
        '/spiritual-budaya',
        '/hibrida-cbt',
        '/safe-mother',
        '/blog',
        // tab variants for better coverage (optional but helpful for SEO)
        '/spiritual-budaya/pengantar',
        '/spiritual-budaya/jelajah',
        '/spiritual-budaya/intervensi',
        '/spiritual-budaya/psikoedukasi',
        '/hibrida-cbt/pengantar',
        '/hibrida-cbt/jelajah',
        '/hibrida-cbt/intervensi-hibrida',
        '/hibrida-cbt/psikoedukasi',
      ],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Shim legacy core-js module paths imported by canvg to no-ops (modern browsers don't need them)
      "core-js/modules/es.promise.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.string.match.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.string.replace.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.string.starts-with.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.array.iterator.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/web.dom-collections.iterator.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.array.reduce.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.string.ends-with.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.string.split.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.string.trim.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.array.index-of.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.string.includes.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.array.reverse.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
      "core-js/modules/es.regexp.to-string.js": path.resolve(__dirname, "src/shims/corejs-empty.js"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          charts: ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    // Avoid pre-bundling canvg which references legacy core-js module paths
    exclude: ['canvg'],
  },
  })
});
