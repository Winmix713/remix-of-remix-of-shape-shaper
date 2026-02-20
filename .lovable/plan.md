
# Superellipse Generator Pro — Fejlesztési Koncepcióterv

## A Projekt Jelenlegi Állapota

Az alapos kódbázis-elemzés alapján a rendszer **nagyon érett állapotban** van. Az összes tervezett fejlesztés nagy része **már implementálva van**:

**Teljesen kész komponensek:**
- `CustomSlider.tsx` — pointer capture, local state, touch support, 16ms debounce
- `Dock.tsx` — Glow/Glass/Neo/Clay effekt presets, floating pill UI
- `CanvasContextMenu.tsx` — jobb-klikk menu: Copy SVG/CSS/Path, Export SVG/PNG, Reset
- `CanvasHUD.tsx` — felső és alsó HUD: WIDTH/HEIGHT/CURVE + zoom kijelzés
- `StatusBar.tsx` — Reset, Copy SVG, Export gombok
- `EffectsTab.tsx` — Quick Filters grid, Filters & Adjust, Glass Surface, Inner Shadow, Noise Distortion, Effect Stack, Stroke, Noise Overlay szekciók
- `GlowTab.tsx` — teljes OKLCH rendszer, 4-layer glow, Shape Config, Position, Animation
- `LayerPanel.tsx` — Layers/Assets/Library tabokkal, Favorites/Recent/Shapes presets
- `CustomStyleDesignerModal.tsx` — Templates/Custom Code/My Presets tabokkal
- `useSuperellipse.ts` — 806 sor, 40+ state mező, brightness/contrast/saturate/hueRotate/frostBlur/tintColor stb.

**Azonosított Problémák és Fejlesztési Lehetőségek:**

Az elemzés során 6 konkrét területet azonosítottam, amelyek valóban fejleszthetők:

---

## 1. Library Tab — Preset Interakció Hiányos (KRITIKUS)

**Probléma:** A `LayerPanel.tsx` Library tabján a shape preset gombok (`Squircle iOS`, `Hyperellipse` stb.) **nem csinálnak semmit** — hiányzik az `onClick` handler, nem hívnak meg semmiféle `updateState`-et.

**Megoldás:** Valódi preset adatokat kell hozzárendelni minden shape-hez és az `onApplyShapePreset` callback prop-ot kell átadni a `LayerPanel`-nek.

```
LayerPanel props bővítése:
  + onApplyShapePreset: (updates: Partial<SuperellipseState>) => void

Shape preset adatok (n érték + tipikus méretek):
  Squircle iOS  → { exp: 4.0, width: 320, height: 320 }
  Hyperellipse  → { exp: 2.8, width: 300, height: 300 }
  Soft Circle   → { exp: 2.0, width: 280, height: 280 }
  Rounded Rect  → { exp: 6.0, width: 400, height: 300 }
  Diamond       → { exp: 1.0, width: 300, height: 300 }
  Pill          → { exp: 10.0, width: 400, height: 180 }
  Blob          → { exp: 1.5, width: 320, height: 360 }
```

**Érintett fájlok:** `LayerPanel.tsx`, `Index.tsx`

---

## 2. Auto-Save + Ctrl+S Toast Visszajelzés (KÖZEPES)

**Probléma:** A `useSuperellipse.ts` tárolja az állapothistóriát (50 elem), de **nincs auto-save** localStorage-ba és **nincs Ctrl+S** shortcut toast visszajelzéssel. Az oldal újratöltésekor elvész minden munka.

**Megoldás:**

```
useSuperellipse.ts bővítése:
  1. useEffect: state változáskor 1s debounce → localStorage.setItem
  2. Betöltéskor: localStorage.getItem → loadState (ha érvényes)

useKeyboardShortcuts.ts bővítése:
  + saveState: () => void  (Ctrl+S handler)

Index.tsx:
  + handleSave callback → toast.success('Design saved')
```

**Érintett fájlok:** `useSuperellipse.ts`, `useKeyboardShortcuts.ts`, `Index.tsx`

---

## 3. ShapeTab — Belső CustomSlider Csere (KÖZEPES)

**Probléma:** A `ShapeTab.tsx` saját `CustomSlider` és `CollapsibleSection` komponenseket definiál lokálisan (110-211. sor), amelyek duplikálják a már meglévő `src/components/generator/CustomSlider.tsx` és `CollapsibleSection.tsx` fájlokat. Ez karbantarthatósági problémát jelent — két slider implementáció él egymás mellett.

**Megoldás:** A `ShapeTab.tsx`-ben lévő lokális `CustomSlider` és `CollapsibleSection` definíciókat le kell cserélni a globális importokra.

```
Törlendő ShapeTab.tsx-ből:
  - interface CustomSliderProps (70-118. sor)
  - const CustomSlider komponens (120-211. sor)
  - interface CollapsibleSectionProps (71-76. sor)
  - const CollapsibleSection komponens (77-108. sor)

Hozzáadandó importok:
  import { CustomSlider } from '../CustomSlider';
  import { CollapsibleSection } from '../CollapsibleSection';
```

**Érintett fájlok:** `ShapeTab.tsx`

---

## 4. Header Export Gomb — Nem Kötött (ALACSONY)

**Probléma:** A `Header.tsx`-ben az "Export" gomb (`Download` ikon) **nem nyitja meg** az `ExportCodeModal`-t — nincs `onClick` handler és nincs prop átadva.

**Megoldás:** Az Export gomb összekapcsolása az `ExportCodeModal`-lal:

```
Header props bővítése:
  + onExport?: () => void

Header.tsx:
  Export button → onClick={onExport}

Index.tsx:
  <Header onExport={() => setShowExportModal(true)} ... />
```

**Érintett fájlok:** `Header.tsx`, `Index.tsx`

---

## 5. Tint Color Overlay — Renderelés Hiányos (KÖZEPES)

**Probléma:** A `PreviewArea.tsx` alkalmazza a `backdropFilter`, `filter`, `boxShadow` (inner shadow) tulajdonságokat a phone frame-en, de a **Glass Surface tint color overlay** (félig átlátszó szín overlay az alakzaton) **nem jelenik meg** — nincs renderelve az a réteg.

**Megoldás:** Egy abszolút pozicionált `div` overlay hozzáadása a phone frame belsejébe:

```
PreviewArea.tsx bővítése:
  {state.tintOpacity > 0 && (
    <div
      className="absolute inset-0 pointer-events-none z-[5]"
      style={{
        backgroundColor: state.tintColor,
        opacity: state.tintOpacity / 100,
        mixBlendMode: 'overlay',
      }}
      aria-hidden="true"
    />
  )}
```

**Érintett fájlok:** `PreviewArea.tsx`

---

## 6. Noise Distortion — SVG Filter Nincs Implementálva (MAGAS)

**Probléma:** Az `EffectsTab.tsx` tartalmaz `noiseFrequency` és `distortionStrength` slidereket, és az állapot is tárolja ezeket az értékeket, de a `PreviewArea.tsx`-ben **nincs SVG feTurbulence/feDisplacementMap filter** renderelve — a distortion vizuálisan nem jelenik meg.

**Megoldás:** SVG filter definíció hozzáadása és alkalmazása:

```
PreviewArea.tsx bővítése:
  1. SVG defs blokk az alakzat fölé:
     <svg style={{ position: 'absolute', width: 0, height: 0 }}>
       <defs>
         <filter id="noise-distortion">
           <feTurbulence
             type="fractalNoise"
             baseFrequency={state.noiseFrequency / 1000}
             numOctaves={3}
           />
           <feDisplacementMap
             in="SourceGraphic"
             scale={state.distortionStrength}
             xChannelSelector="R"
             yChannelSelector="G"
           />
         </filter>
       </defs>
     </svg>

  2. Phone frame style-ba:
     if (state.distortionStrength > 0) {
       filters.push(`url(#noise-distortion)`);
     }
```

**Érintett fájlok:** `PreviewArea.tsx`

---

## Implementációs Sorrend és Fájlok

```text
Prioritás  Fejlesztés                          Fájl(ok)                      Komplexitás
---------  ----------------------------------  ----------------------------  -----------
KRITIKUS   Library shape preset onClick         LayerPanel.tsx, Index.tsx     ~30 perc
KÖZEPES    Tint color overlay renderelés        PreviewArea.tsx               ~20 perc
MAGAS      Noise distortion SVG filter          PreviewArea.tsx               ~30 perc
KÖZEPES    Auto-save + Ctrl+S toast             useSuperellipse.ts, Index.tsx ~45 perc
KÖZEPES    ShapeTab duplikált slider csere      ShapeTab.tsx                  ~30 perc
ALACSONY   Header Export gomb kötése            Header.tsx, Index.tsx         ~10 perc
```

---

## Technikai Összefoglaló

### Érintett Fájlok

| Fájl | Változás |
|------|----------|
| `src/components/generator/layers/LayerPanel.tsx` | onApplyShapePreset prop + shape onClick handlerek |
| `src/components/generator/PreviewArea.tsx` | tint overlay div + SVG noise filter |
| `src/hooks/useSuperellipse.ts` | auto-save useEffect + localStorage visszatöltés |
| `src/hooks/useKeyboardShortcuts.ts` | saveState handler (Ctrl+S) |
| `src/components/generator/tabs/ShapeTab.tsx` | lokális slider/section törlés → globális importok |
| `src/components/layout/Header.tsx` | onExport prop + onClick kötés |
| `src/pages/Index.tsx` | új propok átadása: onApplyShapePreset, onExport, handleSave |

### Nem Szükséges Fejlesztések

A következők **már teljesen implementálva** vannak, nem kell megvalósítani:
- CustomSlider pointer capture + touch — kész
- Dock effect presets — kész
- Canvas Context Menu — kész
- Canvas HUD (felső + alsó) — kész
- StatusBar gombok — kész
- EffectsTab szekciók — kész
- GlowTab OKLCH rendszer — kész
- CustomStyleDesignerModal — kész

### Várható Eredmény

A fenti 6 fejlesztés implementálása után a Superellipse Generator Pro:
- Teljesen funkcionális Library presets rendszerrel rendelkezik (kattintható shape presetek)
- Elveszett munkát nem okoz (auto-save minden állapotváltozáskor)
- Konzisztens kódbázissal bír (nincs duplikált slider implementáció)
- Vizuálisan megjeleníti az összes effektet (tint overlay + noise distortion)
- Teljes Export workflow-t kínál a Header-ből is
