

# Fejlesztesi Koncepcio Terv - 7 Referenciakep Alapjan

## Attekintes

A 7 kep harom kulonbozo professzionalis design tool megoldasat mutatja be. Az alabbiakban osszesitem, mit latunk rajtuk, es hogyan alkalmazhatjuk a jelenlegi Superellipse Generator Pro rendszerunkben.

---

## Kepek Elemzese

### Kep 1 (image-2): Framer-stilusu Design Editor
- Layers panel balra (Desktop > Navigation > Hero Image > Hero Title > Subtitle > CTA Button) fastrukturaban
- Canvas kozepen: lila hatteru kartya komponens szelekcios handleekkel (kek sarokpontok)
- Properties panel jobbra: X/Y pozicio, W/H meretezis, Rotation, Typography (font, suly, meret, sorkozt), Pixelation/Brightness/Quantization sliderek, Fill szin + opacity, Optimizer szekcion
- Preview/Code kapcsolo a jobb felso sarokban

### Kep 2 (image-3): Superellipse Generator Pro v7 - FX Tab
- macOS menusor tetejin (File, Edit, View, Object, Text)
- Layers panel balra: Glow Layers, Superellipse, Effects, Text Label
- Canvas kozepen: lila superellipse sotetkek hattteren, also HUD-dal (SIZE 200x200, POS 0,0, ROT 0deg)
- Jobbra: DESIGN | GLOW | **FX** | TEXT tabokkal
- FX tab tartalma: **Quick Filters** (Vintage, Hi-Con, Dreamy, Noir, Warm, Cool, Fade, Reset grid), **Filters & Blur** (Blur, Backdrop Blur, Brightness, Contrast, Saturate, Hue Rotate sliderek)

### Kep 3 (image-4): Superellipse Generator Pro v7 - Design Tab
- macOS menusor, traffic light gombok
- Bal sidebar: Library (Favorites 12, Recent), Shapes presetek (Squircle iOS n=4.0, Hyperellipse n=2.8, Soft Circle n=2.0, Rounded Rect n=6.0, Diamond n=1.0, New Preset)
- Canvas: rozsaszin superellipse, felso HUD (WIDTH 512px, HEIGHT 512px, CURVE 6.62)
- Jobb panel DESIGN tab: Shape (Exponent slider), Width/Height sliderek, Rotation, Corner Smoothing, Fill szinpaletta, OKLCH Color (Lightness, Chroma, Hue sliderek ertekekkel)
- Also Dock: 5 gomb ikonokkal
- Also statusbar: Reset, Copy SVG, Export gombok

### Kep 4 (image-5): Aether CSS - Liquid Glass Generator
- Harom effekt mod: Liquid Glass (new), Glassmorphism, Neumorphism
- Preset grid: Liquid Crystal, Fluid Amber, Ice Ripple, Mercury Drop, Ocean Wave, Crystal Mist, Molten Glass, Silk Veil, Plasma Flow, Frost Lens, Aurora Gel, Nebula Prism
- Live Preview: kartya komponens (Jane Doe, Styled Component, Get Started gomb)
- Preview/Code toggle

### Kep 5 (image-6): Custom Style Designer Modal
- Templates | Custom Code | My Presets tabfuul
- 6 template: Glassmorphism, Inner Glow, Retro 80s, Rainbow Gradient, Spinning Animation, Morphing Shape
- Live Preview: lila superellipse
- Preset nev input + "Save as Preset" + "Apply to Canvas" gombok

### Kep 6 (image-7): Advanced Controls Panel
- Noise Distortion szekcion: Noise Frequency (25), Distortion Strength (65)
- Glass Surface szekcion: Frost Blur (6), Tint Color Grayscale (255 + #ffffff), Tint Opacity (0)
- Inner Shadow szekcion: Shadow Spread (-2), Shadow Blur (12), Shadow Color Grayscale (255 + #ffffff)

### Kep 7 (image-8): Jelenlegi rendszerunk - Glow Tab
- Ez a sajat alkalmazasunk jelenlegi allpota a Glow tabbal: Base Color OKLCH, Shape Configuration, Glow Scale, Dock (Glow, Glass, Neo, Clay)
- Canvas: narancssarga glow-s kartya komponens
- Layers panel balra Properties szekcional

---

## Javasolt Fejlesztesek - 5 Fejlesztesi Csomag

### 1. Quick Filters / FX Tab Bovites
**Referencia:** Kep 2 (v7 FX tab), Kep 7 (Noise controls)

A jelenlegi EffectsTab-ot bovitjuk egy **Quick Filters** grid-del es CSS filter sliderek-kel:

**Quick Filters Grid (2x4):**
- Vintage: sepia brightness contrast beallitas
- Hi-Contrast: magas kontraszt, elesites
- Dreamy: blur + vilagositas + telitettseg csokkentes
- Noir: grayscale + magas kontraszt
- Warm: hue-rotate melegebb arnyalat fele
- Cool: hue-rotate hidegebb arnyalat fele
- Fade: csokkenotett telitettseg + vilagositas
- Reset: minden filter alapertelemezetre

**Uj CSS Filter sliderek:**
- Brightness (0-200%)
- Contrast (0-200%)
- Saturate (0-200%)
- Hue Rotate (0-360deg)

**Noise Distortion bovites:**
- Noise Frequency slider (1-100)
- Distortion Strength slider (0-100)

**Glass Surface uj szekcion:**
- Frost Blur (0-30px)
- Tint Color (szinvalaszto + opacity)

**Inner Shadow uj szekcion:**
- Shadow Spread (-20 to 20)
- Shadow Blur (0-50px)
- Shadow Color (szinvalaszto)

**Fajlok:**
- `src/components/generator/tabs/EffectsTab.tsx` - Teljes ujrastruktalas
- `src/hooks/useSuperellipse.ts` - Uj state mezo k: brightness, contrast, saturate, hueRotate, frostBlur, tintColor, tintOpacity, innerShadowSpread, innerShadowBlur, innerShadowColor, noiseFrequency, distortionStrength

---

### 2. Custom Style Designer Modal
**Referencia:** Kep 5 (Aether presets), Kep 6 (Custom Style Designer)

Uj modal ablak, ami style template-eket, egyedi CSS kodot, es mentes/betoltes funkciokat tartalmaz:

**Harom tab:**
1. **Templates**: 6 eloredefinalt stilus keszlet kartyakon (Glassmorphism, Inner Glow, Retro 80s, Rainbow Gradient, Spinning Animation, Morphing Shape) — mindegyik ikonnal, nevvel, rovid lerassal
2. **Custom Code**: CSS textarea, ahol a felhasznalo sajat CSS-t irhat
3. **My Presets**: A felhasznalo altal mentett egyedi presetek listaja

**Funkciok:**
- Bal oldalon template kartyak / editor
- Jobb oldalon Live Preview (kicsi superellipse megjelenites a jelenlegi state alapjan)
- "Preset name..." input mezo
- "Save as Preset" gomb (localStorage-ba mentes)
- "Apply to Canvas" gomb (a kivalasztott template alkalmazasa)

**Uj fajlok:**
- `src/components/generator/modals/CustomStyleDesignerModal.tsx`
- `src/types/styleTemplates.ts` — StyleTemplate tipusok es preset adatok

**Modositando fajlok:**
- `src/components/generator/ControlPanel.tsx` — Uj gomb az FX tabban a modal megnyitasahoz
- `src/pages/Index.tsx` — Modal allapot es megjelenites

---

### 3. Preset Sidebar Fejlesztes (Library System)
**Referencia:** Kep 3 (v7 bal sidebar), Kep 5 (Aether presets)

A jelenlegi LayerPanel sidebar-t bovitjuk egy professzionalis preset konyvtar rendszerrel:

**Library szekcion (az "assets" tab helyere vagy mellette):**
- **Favorites**: Kedvenc presetek listaja badge-dzsel (pl. "12")
- **Recent**: Legutobb hasznalt presetek
- **Shapes**: Eloredefinalt alakzat presetek ikonokkal es n ertek kijelzessel:
  - Squircle iOS (n=4.0)
  - Hyperellipse (n=2.8)
  - Soft Circle (n=2.0)
  - Rounded Rect (n=6.0)
  - Diamond (n=1.0)
  - Pill (magas exp + keskeny)
  - Blob (alacsony exp + aszimmetrikus)
- **New Preset** gomb uj menteshez
- Kereses input mezo a presetek szuresere

**Fajlok:**
- `src/components/generator/layers/LayerPanel.tsx` — A "pages" tab lecserelese "Library" tabra
- `src/hooks/usePresets.ts` — Bovites favorites/recent kezelsessel

---

### 4. Footer Toolbar (Reset, Copy SVG, Export)
**Referencia:** Kep 3 (v7 also statusbar), Kep 4 (Aether control panel)

A jelenlegi StatusBar-t bovitjuk gyors akciogombokkal:

**Bal oldalon (jelenlegi info megmarad):**
- Ready jelzo (zold pont)
- Meretek (320 x 400)

**Jobb oldalon uj gombok:**
- **Reset** gomb (RotateCcw ikon) — allapot visszaallitas
- **Copy SVG** gomb (Copy ikon) — SVG kod vagolap
- **Export** gomb (Download ikon, piros/primary szin) — ExportCodeModal megnyitas

**Fajlok:**
- `src/components/layout/StatusBar.tsx` — Uj akciogombok
- `src/pages/Index.tsx` — Callback propok (resetState, pathData, state) tovabbitasa StatusBar-nak

---

### 5. Canvas Felso HUD Bovites
**Referencia:** Kep 3 (v7 felso HUD: WIDTH, HEIGHT, CURVE ertekkel)

A jelenlegi also CanvasHUD mellette egy felso info savot is adunk:

**Felso HUD tartalom:**
- WIDTH: `512px` (szinezett ertek, pl. pink/primary)
- HEIGHT: `512px`
- CURVE: `6.62` (az aktualis exp ertek)

Ez a canvas felso kozeperere kerul, a jelenlegi also HUD stilusaban (glass card).

**Fajlok:**
- `src/components/generator/CanvasHUD.tsx` — Bovites felso info savval, vagy kulon `CanvasTopHUD` komponens
- `src/pages/Index.tsx` — Uj HUD integracio

---

## Technikai Reszletek

### Uj SuperellipseState Mezok

```text
// CSS Filters
brightness: number;       // 100 (0-200)
contrast: number;          // 100 (0-200)
saturate: number;          // 100 (0-200)
hueRotate: number;         // 0 (0-360)

// Glass Surface
frostBlur: number;         // 0 (0-30)
tintColor: string;         // '#ffffff'
tintOpacity: number;       // 0 (0-100)

// Inner Shadow
innerShadowSpread: number; // 0 (-20 to 20)
innerShadowBlur: number;   // 0 (0-50)
innerShadowColor: string;  // '#000000'

// Noise Distortion
noiseFrequency: number;    // 25 (1-100)
distortionStrength: number; // 0 (0-100)
```

### Uj Fajlok

| Fajl | Cel |
|------|-----|
| `src/components/generator/modals/CustomStyleDesignerModal.tsx` | Stilus sablon valaszto modal |
| `src/types/styleTemplates.ts` | Template tipusok es eloredefinalt stilusok |

### Modositando Fajlok

| Fajl | Valtozas |
|------|----------|
| `src/components/generator/tabs/EffectsTab.tsx` | Quick Filters grid, CSS filter sliderek, Glass Surface, Inner Shadow szekciok |
| `src/hooks/useSuperellipse.ts` | Uj state mezok (brightness, contrast, stb.) es alapertelmezes |
| `src/components/generator/PreviewArea.tsx` | CSS filter alkalmazasa, inner shadow, glass surface rendereles |
| `src/components/generator/layers/LayerPanel.tsx` | Library tab a preset rendszerrel |
| `src/components/layout/StatusBar.tsx` | Reset, Copy SVG, Export akciogombok |
| `src/components/generator/CanvasHUD.tsx` | Felso info sav (WIDTH, HEIGHT, CURVE) |
| `src/components/generator/ControlPanel.tsx` | Custom Style Designer gomb |
| `src/pages/Index.tsx` | Uj modal allapot, StatusBar propok, felso HUD |

### Implementacios Sorrend

1. SuperellipseState bovites uj mezokkel + alapertelmezeisekkel
2. EffectsTab ujrastruktalas (Quick Filters + CSS filter sliderek + Glass + Inner Shadow)
3. PreviewArea bovites (CSS filterek + inner shadow + glass surface rendereles)
4. Custom Style Designer Modal
5. Canvas Felso HUD
6. StatusBar akciogombok
7. Library tab a LayerPanel-ben

