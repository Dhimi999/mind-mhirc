import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'spiritual-budaya', 'intervensi', 'SpiritualIntervensiUnified.tsx');

// Baca file dengan UTF-8
let content = fs.readFileSync(filePath, 'utf8');

// Clean up all corrupted emoji artifacts first
content = content.replace(/ðŸ"‹\{\"\\u\{1F4CB\}\"\}/g, '');
content = content.replace(/\{\"\\u\{1F4CB\}\"\}📖📖/g, '');
content = content.replace(/ðŸ"‹/g, '');
content = content.replace(/\{\"\\u\{1F4CB\}\"\}/g, '');
content = content.replace(/📖📖/g, '');

// Now add clean emojis
content = content.replace(/(\s+)Riwayat Jawaban(\s*<)/g, '$1📋 Riwayat Jawaban$2');
content = content.replace(/(\s+)Riwayat Jawaban \(/g, '$1📖 Riwayat Jawaban (');

// Tulis kembali dengan UTF-8
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Emoji telah dibersihkan dan diperbaiki!');
