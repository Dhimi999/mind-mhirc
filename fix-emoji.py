#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

files_to_fix = [
    r"d:\Dhimas's Files\Documents\GitHub\mind-mhirc-draft-112\src\pages\spiritual-budaya\intervensi\SpiritualIntervensiUnified.tsx",
    r"d:\Dhimas's Files\Documents\GitHub\mind-mhirc-draft-112\src\pages\spiritual-budaya\psikoedukasi\SpiritualPsikoedukasiUnified.tsx"
]

emoji_fixes = {
    'â†': '←',
    'â†'': '→',
    'ðŸ'¡': '💡',
    'ðŸ"–': '📖',
    'ðŸ"…': '📅',
    'ðŸ'¤': '👤',
    'ðŸ•': '🕐',
    'ðŸ"—': '🔗',
    'ðŸ"Œ': '📌',
    'ðŸš€': '🚀',
    'ðŸ"': '📝',
    'ðŸ"‹': '📋',
    'ðŸ'ï¸': '👁️',
    'âž•': '➕',
    'ðŸ"¤': '📤',
    'ðŸ"': '🔒',
}

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    print(f"Processing: {filepath}")
    
    # Read file with UTF-8 encoding
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace broken emojis
    for broken, fixed in emoji_fixes.items():
        if broken in content:
            count = content.count(broken)
            content = content.replace(broken, fixed)
            print(f"  Fixed {count} occurrences of '{broken}' → '{fixed}'")
    
    # Write back with UTF-8 encoding (with BOM for Windows)
    with open(filepath, 'w', encoding='utf-8-sig') as f:
        f.write(content)
    
    print(f"✓ Fixed: {filepath}\n")

print("All files fixed!")
