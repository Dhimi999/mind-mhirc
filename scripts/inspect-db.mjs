import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[inspect-db] ERROR: Set SUPABASE_URL dan SUPABASE_ANON_KEY sebagai environment variables.');
  console.error('Contoh: SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=eyJ... node scripts/inspect-db.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const targetTables = [
  'profiles',
  'blog_posts',
  'test_results',
  'ai_conversations',
  'broadcasts',
  'program_services'
];

async function inspect() {
  console.log('Inspecting tables (public anon scope)...');
  for (const table of targetTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`• ${table}: ERROR -> ${error.message}`);
        continue;
      }
      if (!data || data.length === 0) {
        console.log(`• ${table}: OK (0 rows, atau tidak ada row yang visible karena RLS)`);
      } else {
        const sample = data[0];
        console.log(`• ${table}: OK, sample columns =>`, Object.keys(sample));
      }
    } catch (e) {
      console.log(`• ${table}: EXCEPTION -> ${e.message}`);
    }
  }
  console.log('\nSelesai. Jika program_services ERROR relation not found, jalankan migrasinya di Supabase.');
}

inspect();
