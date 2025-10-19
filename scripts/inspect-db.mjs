import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gfeuhclekmdxaatyyiez.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZXVoY2xla21keGFhdHl5aWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5NDI2MzIsImV4cCI6MjA1NjUxODYzMn0.zl3T3J2a8cCJxq5OI9IdAnWEYXSwdUwcJ6D_5MglXCI';

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
