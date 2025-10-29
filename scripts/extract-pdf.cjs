const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node scripts/extract-pdf.cjs <path-to-pdf>');
    process.exit(1);
  }
  const abs = path.resolve(process.cwd(), input);
  if (!fs.existsSync(abs)) {
    console.error('File not found:', abs);
    process.exit(1);
  }
  const dataBuffer = fs.readFileSync(abs);
  try {
    const data = await pdfParse(dataBuffer);
    // Print text content; trim excessive whitespace
    const text = data.text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n');
    console.log(text);
  } catch (e) {
    console.error('Failed to parse PDF:', e.message);
    process.exit(1);
  }
}

main();
