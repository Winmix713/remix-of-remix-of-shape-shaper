# 🔷 Superellipse Generator Pro

## Dokumentáció v3.0

> Professzionális WebGL-alapú kreatív eszköz superellipse alakzatok, glow effektek és rétegkompozíciók létrehozására.

---

## 📋 Tartalomjegyzék

1. [Áttekintés](#áttekintés)
2. [Rendszerkövetelmények](#rendszerkövetelmények)
3. [Felhasználói felület](#felhasználói-felület)
4. [Funkciók részletesen](#funkciók-részletesen)
5. [Rétegrendszer](#rétegrendszer)
6. [Billentyűparancsok](#billentyűparancsok)
7. [Technikai architektúra](#technikai-architektúra)
8. [API referencia](#api-referencia)

---

## Áttekintés

A **Superellipse Generator Pro** egy böngészőalapú vizuális tervezőeszköz, amely lehetővé teszi:

- **Superellipse alakzatok** létrehozását egyedi sarokgörbületekkel
- **Progresszív glow effektek** konfigurálását OKLCH színtérben
- **Többrétegű kompozíciók** kezelését 16 blend móddal
- **CSS/SVG/React kód exportálását** production-ready formátumban

### Főbb jellemzők

| Funkció | Leírás |
|---------|--------|
| Aszimmetrikus sarkok | Minden sarok külön görbületi exponenssel |
| 4-rétegű Glow rendszer | Progresszív elmosódás OKLCH színekkel |
| Rétegkezelés | Drag & drop, csoportosítás, blend módok |
| Valós idejű előnézet | Zoom, pan, grid overlay |
| Undo/Redo | 50 lépéses history stack |

---

## Rendszerkövetelmények

### Böngésző támogatás

| Böngésző | Minimum verzió |
|----------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

### Ajánlott hardver

- **Kijelző**: 1920×1080 vagy nagyobb
- **Memória**: 4GB+ RAM
- **GPU**: WebGL 2.0 támogatás

---

## Felhasználói felület

### 3 oszlopos elrendezés

```
┌─────────────┬────────────────────────┬─────────────┐
│   LAYERS    │        CANVAS          │   CONTROLS  │
│   Panel     │        Preview         │   Panel     │
│             │                        │             │
│  - Rétegek  │  - Superellipse        │  - Shape    │
│  - Blend    │  - Glow effektek       │  - Color    │
│  - Transform│  - Zoom/Pan            │  - Glow     │
│  - Effects  │  - Grid overlay        │  - Effects  │
│             │                        │  - Presets  │
│             │                        │  - CSS      │
│             │                        │  - Export   │
└─────────────┴────────────────────────┴─────────────┘
```

### Bal oldali panel: Rétegek

- **Réteg lista**: Drag & drop átrendezés
- **Láthatóság**: Szem ikon toggle
- **Zárolás**: Lakat ikon toggle
- **Blend mód**: 16 CSS mix-blend-mode
- **Opacity**: 0-100% átlátszóság
- **Transform**: X, Y, Rotation, Scale, Anchor

### Középső terület: Canvas

- **Valós idejű előnézet**: Az alakzat és effektek megjelenítése
- **Zoom vezérlők**: 25%-400% tartomány
- **Pan navigáció**: Space + Drag
- **Fit to View**: Automatikus méretezés

### Jobb oldali panel: Vezérlők

Fülrendszer 7 modullal:
1. **Shape** - Alakzat paraméterek
2. **Color** - Kitöltés és gradiens
3. **Glow** - Fényeffektek
4. **Effects** - Blur, stroke, noise
5. **Presets** - Mentett beállítások
6. **CSS** - Kódgenerálás
7. **Export** - Fájl exportálás

---

## Funkciók részletesen

### 1. Shape (Alakzat)

#### Alap paraméterek

| Paraméter | Tartomány | Leírás |
|-----------|-----------|--------|
| Width | 50-800px | Alakzat szélessége |
| Height | 50-800px | Alakzat magassága |
| Exponent | 0.5-10 | Globális görbületi exponens |
| Lock Ratio | Toggle | Szélesség-magasság arány zárolása |

#### Aszimmetrikus sarkok

Minden sarok külön `n` exponenssel:

```
┌─── n₁ ────────── n₂ ───┐
│                        │
n₄                      n₃
│                        │
└─── n₄ ────────── n₃ ───┘
```

- **n = 2**: Tökéletes kör/ellipszis
- **n = 4**: iOS-stílusú squircle
- **n > 6**: Lekerekített téglalap
- **n < 2**: Csillag-szerű behúzás

#### SVG Path generálás

A rendszer a `getPerCornerSuperellipsePath()` utility-t használja:

```typescript
function getPerCornerSuperellipsePath(
  width: number,
  height: number,
  corners: { tl: number; tr: number; br: number; bl: number }
): string
```

### 2. Color (Szín)

#### Kitöltési típusok

| Típus | Leírás |
|-------|--------|
| Solid | Egyszínű kitöltés |
| Linear Gradient | Lineáris átmenet |
| Radial Gradient | Sugárirányú átmenet |
| Conic Gradient | Kúpos átmenet |

#### Gradiens szerkesztő

- **Stops**: Tetszőleges számú színpont
- **Position**: 0-100% közötti pozíció
- **Angle**: Gradiens szöge (lineárisnál)
- **OKLCH támogatás**: Perceptuálisan egységes színek

#### Színválasztó

```typescript
interface GradientStop {
  id: string;
  color: string;      // HEX formátum
  position: number;   // 0-100
}
```

### 3. Glow (Fényeffekt)

#### 4-rétegű progresszív rendszer

| Réteg | Blur | Opacity | Szerep |
|-------|------|---------|--------|
| Layer 1 | 8px | 80% | Belső fény |
| Layer 2 | 24px | 60% | Közepes szórás |
| Layer 3 | 48px | 40% | Külső derengés |
| Layer 4 | 96px | 20% | Ambient halo |

#### Glow paraméterek

| Paraméter | Tartomány | Leírás |
|-----------|-----------|--------|
| Intensity | 0-200% | Összesített erősség |
| Color | OKLCH | Fény színe |
| Spread | 0-100px | Kiterjedés |
| Animation | Toggle | Pulzálás engedélyezése |

#### OKLCH színtér

```css
/* OKLCH előnyei */
oklch(70% 0.15 250)  /* Lightness, Chroma, Hue */
/* Egyenletes fényességváltozás */
/* Jobb gradiens átmenetek */
```

### 4. Effects (Effektek)

#### Gaussian Blur

- **Radius**: 0-50px elmosódás
- **Alkalmazás**: Teljes alakzatra

#### Backdrop Blur (Glassmorphism)

- **Radius**: 0-30px háttér elmosódás
- **Requires**: `backdrop-filter` támogatás

#### Stroke (Körvonal)

| Paraméter | Leírás |
|-----------|--------|
| Width | 0-20px vastagság |
| Color | Körvonal színe |
| Style | Solid, Dashed, Dotted |
| Position | Inside, Center, Outside |

#### Noise Texture

- **Opacity**: 0-50% zaj intenzitás
- **Type**: Grain, Perlin (tervezett)
- **Scale**: Zaj méretezése

### 5. Presets (Előbeállítások)

#### Preset kezelés

| Művelet | Leírás |
|---------|--------|
| Save | Jelenlegi állapot mentése |
| Load | Preset betöltése |
| Duplicate | Preset másolása |
| Delete | Preset törlése |
| Export JSON | Fájlba exportálás |
| Import JSON | Fájlból importálás |

#### Preset struktúra

```typescript
interface Preset {
  id: string;
  name: string;
  createdAt: string;
  state: SuperellipseState;
  thumbnail?: string;  // Base64 mini-preview
}
```

#### Beépített preset könyvtár

| Preset | Leírás |
|--------|--------|
| iOS Icon | Apple-stílusú app ikon |
| Rounded | Lágy, kerekített téglalap |
| Square | Éles sarkú négyzet |
| Pill | Kapszula forma |
| Blob | Organikus, aszimmetrikus |

### 6. CSS (Kódgenerálás)

#### Generált kód típusok

| Formátum | Tartalom |
|----------|----------|
| Pure CSS | Natív CSS custom properties |
| SCSS | Változók és mixinek |
| Tailwind | Utility osztályok |
| CSS-in-JS | Styled-components kompatibilis |

#### Példa kimenet

```css
.superellipse {
  --se-width: 200px;
  --se-height: 200px;
  --se-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --se-glow-color: oklch(70% 0.2 280);
  --se-glow-blur: 48px;
  
  width: var(--se-width);
  height: var(--se-height);
  background: var(--se-bg);
  clip-path: url(#superellipse-path);
  filter: drop-shadow(0 0 var(--se-glow-blur) var(--se-glow-color));
}
```

#### Browser compatibility

```css
@supports (backdrop-filter: blur(10px)) {
  .glass-effect {
    backdrop-filter: blur(10px);
  }
}

@supports not (backdrop-filter: blur(10px)) {
  .glass-effect {
    background: rgba(255, 255, 255, 0.8);
  }
}
```

### 7. Export (Exportálás)

#### Támogatott formátumok

| Formátum | Kiterjesztés | Felhasználás |
|----------|--------------|--------------|
| SVG | .svg | Vektorgrafika |
| PNG | .png | Raszterkép |
| PNG @2x | .png | Retina kijelzők |
| PNG @4x | .png | High-res print |
| CSS | .css | Stíluslap |
| JSON | .json | Preset backup |
| React | .tsx | Komponens |

#### SVG export opciók

- **Inline styles**: Beágyazott stílusok
- **CSS classes**: Külső stíluslap referencia
- **Optimized**: SVGO optimalizálás

#### React komponens export

```tsx
import React from 'react';

interface SuperellipseProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Superellipse: React.FC<SuperellipseProps> = ({
  width = 200,
  height = 200,
  className = ''
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 200 200"
    className={className}
  >
    <path d="..." fill="url(#gradient)" />
    <defs>
      <linearGradient id="gradient">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
  </svg>
);
```

---

## Rétegrendszer

### Layer típusok

| Típus | Ikon | Tartalom |
|-------|------|----------|
| Shape | ◇ | Superellipse alakzat |
| Image | 🖼 | Importált kép |
| Text | T | Szöveges elem |
| Group | 📁 | Rétegcsoport |

### Blend módok

A rendszer 16 CSS `mix-blend-mode` értéket támogat:

| Mód | Hatás |
|-----|-------|
| Normal | Nincs keverés |
| Multiply | Sötétítő szorzás |
| Screen | Világosító |
| Overlay | Kontraszt növelő |
| Darken | Legfeketebbnek megtartása |
| Lighten | Legvilágosabbnak megtartása |
| Color Dodge | Világosító kikerülés |
| Color Burn | Sötétítő beégetés |
| Hard Light | Kemény fény |
| Soft Light | Lágy fény |
| Difference | Különbség |
| Exclusion | Kizárás |
| Hue | Árnyalat átvétel |
| Saturation | Telítettség átvétel |
| Color | Szín átvétel |
| Luminosity | Fényesség átvétel |

### Transform vezérlők

#### Pozíció és méret

| Paraméter | Egység | Leírás |
|-----------|--------|--------|
| X | px | Vízszintes eltolás |
| Y | px | Függőleges eltolás |
| Rotation | ° | Forgatás (0-360) |
| Scale X | % | Vízszintes méretezés |
| Scale Y | % | Függőleges méretezés |

#### Anchor pont (9-pontos rács)

```
┌───┬───┬───┐
│ ○ │ ○ │ ○ │  top-left, top-center, top-right
├───┼───┼───┤
│ ○ │ ● │ ○ │  center-left, center, center-right
├───┼───┼───┤
│ ○ │ ○ │ ○ │  bottom-left, bottom-center, bottom-right
└───┴───┴───┘
```

---

## Billentyűparancsok

### Általános

| Parancs | Művelet |
|---------|---------|
| `Ctrl + Z` | Visszavonás |
| `Ctrl + Shift + Z` | Újra |
| `Ctrl + S` | Preset mentése |
| `Ctrl + E` | Exportálás |
| `Delete` | Réteg törlése |

### Rétegkezelés

| Parancs | Művelet |
|---------|---------|
| `Ctrl + D` | Réteg duplikálása |
| `Ctrl + G` | Csoportosítás |
| `Ctrl + Shift + G` | Csoport bontása |
| `[` | Réteg hátra |
| `]` | Réteg előre |

### Canvas navigáció

| Parancs | Művelet |
|---------|---------|
| `Space + Drag` | Pan (mozgatás) |
| `Ctrl + Scroll` | Zoom |
| `Ctrl + 0` | Fit to view |
| `Ctrl + 1` | Zoom 100% |
| `Ctrl + +` | Zoom in |
| `Ctrl + -` | Zoom out |

---

## Technikai architektúra

### Mappastruktúra

```
src/
├── components/
│   ├── generator/
│   │   ├── tabs/           # Vezérlő panelek
│   │   │   ├── ShapeTab.tsx
│   │   │   ├── ColorTab.tsx
│   │   │   ├── GlowTab.tsx
│   │   │   ├── EffectsTab.tsx
│   │   │   ├── PresetsTab.tsx
│   │   │   ├── CssTab.tsx
│   │   │   └── ExportTab.tsx
│   │   ├── layers/         # Rétegrendszer
│   │   │   ├── LayerPanel.tsx
│   │   │   ├── LayerItem.tsx
│   │   │   ├── BlendModeSelector.tsx
│   │   │   └── TransformControls.tsx
│   │   ├── CanvasContainer.tsx
│   │   ├── ControlPanel.tsx
│   │   └── PreviewArea.tsx
│   └── ui/                 # shadcn/ui komponensek
├── hooks/
│   ├── useSuperellipse.ts    # Alakzat állapot
│   ├── useLayerManager.ts    # Réteg műveletek
│   ├── useCanvasNavigation.ts # Zoom/Pan
│   ├── usePresets.ts         # Preset kezelés
│   └── useAssetLibrary.ts    # Asset management
├── types/
│   └── layers.ts             # TypeScript típusok
├── utils/
│   ├── math.ts               # Geometria számítások
│   └── colorPalette.ts       # Színkezelés
└── pages/
    └── Index.tsx             # Főoldal
```

### Fő hookok

#### useSuperellipse

```typescript
interface UseSuperellipseReturn {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  updateGradientStop: (id: string, updates: Partial<GradientStop>) => void;
  resetState: () => void;
  loadState: (state: SuperellipseState) => void;
  randomizeGlow: () => void;
  pathData: string;
}
```

#### useLayerManager

```typescript
interface UseLayerManagerReturn {
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayer: Layer | undefined;
  addLayer: (type: LayerType) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  duplicateLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  setBlendMode: (id: string, mode: BlendMode) => void;
  setOpacity: (id: string, opacity: number) => void;
  updateTransform: (id: string, transform: Partial<Transform>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

#### useCanvasNavigation

```typescript
interface UseCanvasNavigationReturn {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  zoomTo100: () => void;
}
```

### State management

A rendszer React hookokon alapuló állapotkezelést használ:

```
┌─────────────────────────────────────────────┐
│                  Index.tsx                   │
│  ┌─────────────┐ ┌──────────────────────┐   │
│  │useSuperellipse│ │  useLayerManager   │   │
│  └──────┬──────┘ └──────────┬───────────┘   │
│         │                   │               │
│         ▼                   ▼               │
│  ┌──────────────────────────────────────┐   │
│  │           useCanvasNavigation         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│              Child Components                │
│  LayerPanel | CanvasContainer | ControlPanel │
└─────────────────────────────────────────────┘
```

---

## API referencia

### SuperellipseState

```typescript
interface SuperellipseState {
  // Alakzat
  width: number;
  height: number;
  exponent: number;
  cornerExponents: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  };
  useIndividualCorners: boolean;
  lockAspectRatio: boolean;
  
  // Kitöltés
  fillType: 'solid' | 'linear' | 'radial' | 'conic';
  solidColor: string;
  gradientStops: GradientStop[];
  gradientAngle: number;
  
  // Glow
  glowEnabled: boolean;
  glowIntensity: number;
  glowColor: string;
  glowLayers: GlowLayer[];
  
  // Effektek
  blur: number;
  backdropBlur: number;
  strokeWidth: number;
  strokeColor: string;
  noiseOpacity: number;
  
  // Háttér
  backgroundColor: string;
}
```

### Layer

```typescript
interface Layer {
  id: string;
  name: string;
  type: 'shape' | 'image' | 'text' | 'group';
  visible: boolean;
  locked: boolean;
  solo: boolean;
  opacity: number;
  blendMode: BlendMode;
  transform: Transform;
  effects: LayerEffect[];
  parentId: string | null;
  zIndex: number;
  content?: LayerContent;
}
```

### Transform

```typescript
interface Transform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  anchor: AnchorPoint;
}

type AnchorPoint =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';
```

---

## Verziókövetés

| Verzió | Dátum | Változások |
|--------|-------|------------|
| 3.0.0 | 2025 Q1 | Layer system, Undo/Redo, OKLCH |
| 2.5.0 | 2024 Q4 | Aszimmetrikus sarkok, Path preview |
| 2.0.0 | 2024 Q3 | 4-layer glow, Canvas navigation |
| 1.0.0 | 2024 Q2 | Első kiadás |

---

## Támogatás

- **Dokumentáció**: [docs.lovable.dev](https://docs.lovable.dev)
- **GitHub Issues**: Bug reportok és feature requestek
- **Discord**: Közösségi támogatás

---

*© 2025 Superellipse Generator Pro. Minden jog fenntartva.*
