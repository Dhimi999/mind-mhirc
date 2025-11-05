# 🎨 Theme Color Differentiation - CBT Programs

## 📋 Overview

Portal CBT sekarang memiliki skema warna yang berbeda untuk membedakan setiap program, dengan layout dan struktur desain yang konsisten.

## 🎨 Color Themes

### 1. Spiritual & Budaya 🟠
**Theme:** Warm Amber/Orange  
**Purpose:** Memberikan nuansa hangat, spiritual, dan cultural

**Color Palette:**
```css
/* Hero Gradient */
from-amber-600 via-orange-700 to-amber-800

/* Primary Colors */
bg-amber-600, bg-amber-700, bg-amber-800
text-amber-100, text-amber-800

/* Accent & UI */
bg-amber-50 (backgrounds)
border-amber-200, border-amber-700
focus:border-amber-500, focus:ring-amber-500
```

**Visual Identity:**
- Warm, welcoming, comfortable
- Represents tradition and cultural values
- Suitable for spiritual healing context

---

### 2. Hibrida Naratif 🔵
**Theme:** Cool Teal/Cyan  
**Purpose:** Memberikan nuansa profesional, calm, dan therapeutic

**Color Palette:**
```css
/* Hero Gradient */
from-teal-600 via-cyan-700 to-teal-800

/* Primary Colors */
bg-teal-600, bg-teal-700, bg-teal-800
text-teal-100, text-teal-800

/* Accent & UI */
bg-teal-50 (backgrounds)
border-teal-200, border-teal-700
focus:border-teal-500, focus:ring-teal-500
```

**Visual Identity:**
- Professional, clinical, trustworthy
- Represents modern therapeutic approach
- Calming and conducive to reflection

---

## 📊 Shared Design System

Meskipun warna berbeda, kedua program share design patterns yang sama:

### Layout Structure
```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
  {/* Left Sidebar (1 column) */}
  <div className="lg:col-span-1 space-y-6">
    <div className="rounded-lg border border-[theme]-200 bg-[theme]-50 p-4">
      {/* Tips Box */}
    </div>
    <div className="rounded-lg bg-white border border-gray-200 p-5 sticky top-28">
      {/* Sticky Progress Card */}
    </div>
  </div>
  
  {/* Main Content (3 columns) */}
  <div className="lg:col-span-3 space-y-6">
    {/* Content Cards */}
  </div>
</div>
```

### Card Header Pattern
```tsx
<Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
  <div className="p-5 bg-[theme]-600 text-white border-b border-[theme]-700">
    <div className="flex items-center gap-3">
      <span className="text-2xl">[emoji]</span>
      <div>
        <h3 className="text-lg font-semibold">[Title]</h3>
        <p className="text-xs text-[theme]-100 mt-0.5">[Subtitle]</p>
      </div>
    </div>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</Card>
```

### Button Patterns
```tsx
{/* Primary Action */}
<Button className="bg-[theme]-600 hover:bg-[theme]-700 text-white">
  Action
</Button>

{/* Boolean Selection */}
<Button className={(selected ? 'bg-[theme]-600 text-white' : '')}>
  Ya/Tidak
</Button>
```

### Input Focus States
```tsx
<textarea
  className={`
    border-gray-300 
    focus:border-[theme]-500 
    focus:ring-1 
    focus:ring-[theme]-500
  `}
/>
```

---

## 🎯 Benefits of Theme Differentiation

### 1. Program Identity
- ✅ Users instantly recognize which program they're in
- ✅ Each program has distinct personality
- ✅ Reduces confusion when switching between programs

### 2. Visual Hierarchy
- ✅ Color coding helps mental organization
- ✅ Easier navigation between different CBT programs
- ✅ Clear visual boundaries

### 3. Psychological Impact
- 🟠 **Amber/Orange (Spiritual):** Warmth, comfort, tradition
- 🔵 **Teal/Cyan (Hibrida):** Calm, professional, modern

### 4. Consistency
- ✅ Same layout patterns = familiar UX
- ✅ Same interaction patterns = reduced learning curve
- ✅ Different colors = clear distinction

---

## 📁 Files Using Each Theme

### Spiritual & Budaya (Amber/Orange)
```
src/pages/spiritual-budaya/
├── psikoedukasi/SpiritualPsikoedukasiUnified.tsx
└── intervensi/SpiritualIntervensiUnified.tsx
```

### Hibrida Naratif (Teal/Cyan)
```
src/pages/hibrida-naratif/
├── psikoedukasi/HibridaPsikoedukasiUnified.tsx
└── HibridaIntervensiUnified.tsx
```

---

## 🔍 Implementation Details

### Where [theme] is Applied:

1. **Hero Section**
   - Gradient background
   - Text colors

2. **Sidebar**
   - Tips box background & border
   - Progress bar fill color
   - Skeleton loading states

3. **Card Headers**
   - Primary card header (Panduan Sesi)
   - Header text colors
   - Border colors

4. **Interactive Elements**
   - Button backgrounds (primary actions)
   - Button hover states
   - Selected states (boolean buttons)
   - Input focus rings
   - Navigation buttons

5. **Accent Elements**
   - Notes boxes
   - Status indicators
   - Badge backgrounds

---

## ✅ Build Status

**Status:** ✅ SUCCESS  
**Build Time:** 17.04s  
**No Errors:** ✓  
**CSS Size:** 117.26 kB (gzipped: 18.62 kB)

---

## 🎓 Design Guidelines

### When to Use Amber/Orange
- Spiritual & Budaya program
- Content related to tradition, culture, spirituality
- Warm, personal, community-focused contexts

### When to Use Teal/Cyan
- Hibrida Naratif program
- Clinical, therapeutic content
- Professional, structured interventions

### Shared Colors (Program-Neutral)
- **Blue** (`bg-blue-600`): Informasi Pertemuan
- **Purple** (`bg-purple-600`): Panduan Penugasan
- **Orange** (`bg-orange-600`): Penugasan card (different from hero)
- **Green** (`bg-green-600`): Respons Konselor, Success states
- **Gray**: Neutral UI elements

---

## 📈 Next Steps (Optional)

If expanding the design system:

1. **Create Design Tokens**
   ```typescript
   const themes = {
     spiritual: {
       primary: 'amber',
       gradient: 'from-amber-600 via-orange-700 to-amber-800'
     },
     hibrida: {
       primary: 'teal',
       gradient: 'from-teal-600 via-cyan-700 to-teal-800'
     }
   }
   ```

2. **Consider Future Programs**
   - Safe Mother: Green/Mint?
   - Other programs: Purple, Indigo, etc.

3. **Accessibility Check**
   - Ensure color contrast ratios meet WCAG standards
   - Test with colorblind simulators

---

**Last Updated:** 2025-01-05  
**Maintained By:** Development Team  
**Status:** Active Implementation
