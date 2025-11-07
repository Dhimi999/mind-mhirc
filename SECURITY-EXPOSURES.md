# Potential Secret and Sensitive References (Audit)

Date: 2025-11-07

This document lists potential secret exposures or sensitive references found in the repository. No secrets are removed in this pass; this serves as an inventory to remediate safely.

## Findings

1. Supabase anon key hardcoded fallback (removed in this session)
   - File: `src/hooks/useProgramServices.ts`
   - What: Previously included a hardcoded `VITE_SUPABASE_ANON_KEY` fallback.
   - Action: Removed fallback; now requires env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Recommendation: Ensure these env vars are set in all environments (local, staging, prod).

2. Server-side secret usage in Edge/Functions (expected)
   - Files:
     - `supabase/functions/chat-ai/index.ts` → `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`
     - `supabase/functions/notify-parent/index.ts` → `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
     - `supabase/functions/start-consultation/index.ts` → `SUPABASE_SERVICE_ROLE_KEY`
     - `supabase/functions/submit-contact-form/index.ts` → CORS mentions `apikey`
     - `supabase/functions/summarize-inactive-chats/index.ts` → `SUPABASE_SERVICE_ROLE_KEY`
     - `supabase/functions/test-caller/index.ts` → `SUPABASE_SERVICE_ROLE_KEY`
   - Status: Accessed via `Deno.env.get()`. Safe if configured as runtime env variables; never expose on client.
   - Recommendation: Keep these secrets in Supabase/Vercel project environment; rotate periodically.

3. Dynamic Sitemap secret access (server-only)
   - File: `api/sitemap.js`
   - What: Uses `SUPABASE_SERVICE_ROLE_KEY` or anon key if present to fetch blog slugs.
   - Risk: Minimal if the API route runs server-side (Vercel). Ensure it is never bundled client-side.
   - Recommendation: Prefer using anon key + RLS for public tables if feasible. Service role key should be used sparingly.

4. Allowed origins configuration
   - File: `public/callengineer.js`
   - What: Previously allowed `localhost` and `vercel.app` with postMessage. Restricted to `https://mind-mhirc.my.id` now.
   - Risk: Not a secret, but origin sprawl increases risk.
   - Recommendation: If local development is needed, temporarily add the dev origin only in local builds.

## General Recommendations

- Do not hardcode API keys or tokens in source code. Load via environment variables.
- Avoid using `SERVICE_ROLE_KEY` in any code path that could run on the client.
- Use RLS (Row Level Security) with anon keys for public reads when feasible.
- Enable secret scanning in your GitHub repository settings.
- Consider adding a pre-commit hook to grep for `API_KEY|SECRET|SERVICE_ROLE`.
