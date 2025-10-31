import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'spiritual-budaya', 'intervensi', 'SpiritualIntervensiUnified.tsx');

// Baca file dengan UTF-8
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Clean ALL corrupted characters
const corruptedPatterns = [
  /ðŸ"‹/g,
  /ï¿½/g,
  /â†/g,
  /âœ•/g,
  /âœ…/g,
  /â€"/g,
  /ðŸ'ï¸/g,
  /•/g, // bullet point
  /\{\"\\u\{1F4CB\}\"\}/g,
  /\{\"\\u2795\"\}/g,
];

corruptedPatterns.forEach(pattern => {
  content = content.replace(pattern, '');
});

// Step 2: Apply clean emojis at correct places
const fixes = [
  // Buttons
  { search: /(\s+)Buat Jawaban Baru(\s*<)/g, replace: '$1➕ Buat Jawaban Baru$2' },
  { search: /(\s+)Riwayat Jawaban(\s*<)/g, replace: '$1📋 Riwayat Jawaban$2' },
  { search: /(\s+)Kembali ke Jawaban Terakhir(\s*<)/g, replace: '$1← Kembali ke Jawaban Terakhir$2' },
  { search: /(\s+)Lihat Detail(\s*<)/g, replace: '$1👁️ Lihat Detail$2' },
  { search: /(\s+)Tutup(\s*<)/g, replace: '$1✖ Tutup$2' },
  
  // Headers and labels
  { search: /(\s+)Riwayat Jawaban \(/g, replace: '$1📖 Riwayat Jawaban (' },
  { search: /(\s+)Jawaban #/g, replace: '$1📋 Jawaban #' },
  { search: /(\s+)Sudah Ada Respons Konselor(\s*<)/g, replace: '$1✅ Sudah Ada Respons Konselor$2' },
  
  // Status messages
  { search: /(\s+)<strong>Jawaban Terakhir<\/strong> — Gunakan/g, replace: '$1🔒 <strong>Jawaban Terakhir</strong> — Gunakan' },
];

fixes.forEach(({ search, replace }) => {
  content = content.replace(search, replace);
});

// Tulis kembali dengan UTF-8
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Semua emoji telah dibersihkan dan diperbaiki!');
