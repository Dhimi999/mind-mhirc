import codecs
import os

files_to_fix = [
    r"d:\Dhimas's Files\Documents\GitHub\mind-mhirc-draft-112\src\pages\spiritual-budaya\intervensi\SpiritualIntervensiUnified.tsx",
    r"d:\Dhimas's Files\Documents\GitHub\mind-mhirc-draft-112\src\pages\spiritual-budaya\psikoedukasi\SpiritualPsikoedukasiUnified.tsx"
]

# Unicode fixes - from broken to correct
emoji_fixes = [
    ('\u00c3\u00a2\u0086\u0090', '\u2190'),  # ← left arrow
    ('\u00c3\u00a2\u0086\u0092', '\u2192'),  # → right arrow  
    ('\u00c3\u00b0\u0178\u2018\u00a1', '\U0001f4a1'),  # 💡 bulb
    ('\u00c3\u00b0\u0178\u201c\u2013', '\U0001f4d6'),  # 📖 book
    ('\u00c3\u00b0\u0178\u201c\u00a5', '\U0001f4c5'),  # 📅 calendar
    ('\u00c3\u00b0\u0178\u2018\u00a4', '\U0001f464'),  # 👤 person
    ('\u00c3\u00b0\u0178\u2022', '\U0001f550'),  # 🕐 clock
    ('\u00c3\u00b0\u0178\u201c\u2014', '\U0001f517'),  # 🔗 link
    ('\u00c3\u00b0\u0178\u201c\u0152', '\U0001f4cc'),  # 📌 pin
    ('\u00c3\u00b0\u0178\u0161\u20ac', '\U0001f680'),  # 🚀 rocket
    ('\u00c3\u00b0\u0178\u201c', '\U0001f4dd'),  # 📝 memo
    ('\u00c3\u00b0\u0178\u201c\u2039', '\U0001f4cb'),  # 📋 clipboard
    ('\u00c3\u00b0\u0178\u2018\u00ef\u00c2\u00b8', '\U0001f441\ufe0f'),  # 👁️ eye
    ('\u00c3\u00a2\u017e\u2022', '\u2795'),  # ➕ plus
    ('\u00c3\u00b0\u0178\u201c\u00a4', '\U0001f4e4'),  # 📤 outbox
    ('\u00c3\u00b0\u0178\u201c', '\U0001f512'),  # 🔒 lock
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    print(f"Processing: {filepath}")
    
    # Read file
    with open(filepath, 'rb') as f:
        content = f.read()
    
    # Try to decode as UTF-8
    try:
        text = content.decode('utf-8')
    except:
        text = content.decode('latin-1')
    
    # Replace broken emojis
    for broken, fixed in emoji_fixes:
        if broken in text:
            count = text.count(broken)
            text = text.replace(broken, fixed)
            print(f"  Fixed {count} occurrences")
    
    # Write back with UTF-8 encoding
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)
    
    print(f"Done: {filepath}")

print("All files fixed!")
