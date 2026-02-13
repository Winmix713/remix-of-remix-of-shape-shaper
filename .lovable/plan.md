

# Javasolt Fejlesztesek - Osszesitett Prioritasos Lista

## Attekintes

A harom fejlesztesi javaslat (v7 integracio, Nexus Editor, Comprehensive Visual Editor) osszesen ~80+ kulonbozo feature-t tartalmazott. Az alabbiakban ezeket **mar megvalosult**, **javasolt**, es **nem javasolt** kategoriakba soroltam a jelenlegi kodbazis alapjan.

---

## Mar Megvalosult Fejlesztesek (NEM kell implementalni)

Ezek a funkciok mar mukodnek a rendszerben:

- Harom oszlopos layout (LayerPanel | Canvas | ControlPanel)
- Layer rendszer: drag-and-drop, visibility, lock, solo, blend mode, opacity, context menu
- Canvas zoom/pan (25%-500%) billentyuparancsokkal
- View Mode Switcher (Canvas/Code/Preview) a Header-ben
- Device Selector (Mobile/Tablet/Desktop) DeviceFrame-mel
- Inspector Mode (hover/select overlay)
- StatusBar (dimenziok, zoom, aktiv reteg)
- Keyboard Shortcuts rendszer + modal (Ctrl+/)
- Asymmetrikus sarok szerkesztes (CornerControls)
- Gradient Editor (linear, radial, conic) draggable stop-okkal
- Effects Stack (Blur, Drop Shadow, Inner Shadow, Inner Glow, Noise)
- Quick Presets Grid (iOS, Pill, Squircle, stb.)
- Preset save/load/delete JSON export/import-tal
- Export Modal (SVG, CSS, React, Vue kod)
- Glow animaciok (Pulse, Rotate, Wave) CSS exporttal
- Scene Settings (Global Scale, Gradient Mask, Noise)
- CSS/SCSS/Tailwind kimenet a CssTab-ban
- Tema valtas (dark/light)

---

## Javasolt Fejlesztesek (IMPLEMENT)

Az alabbi 6 feature hozza a legtobb ertekethat a legkevesebb komplexitassal:

### 1. iOS-stilusu CustomSlider Frissites
**Prioritas: MAGAS | Komplexitas: Kozepes | ~3 ora**

A jelenlegi `CustomSlider.tsx` mar letezik es jo alapokat ad, de a v7 teljesitmeny-optimalizacioi hianyoznak belole:
- **Pointer capture** hasznalata a megbizhato drag-ert (jelenleg mousemove/mouseup)
- **Lokalis state drag kozben**: Csak pointerUp-ra kuldi a vegleges erteket a szulonek
- **Touch support**: pointerdown/pointermove/pointerup a touch eszkozokhoz
- **Gradient track hatter**: Mar tamogatott (`gradient` prop), de nem hasznalt minden relevan helyen

**Fajlok:** `src/components/generator/CustomSlider.tsx` modositasa

### 2. Dock - Effekt Gyorsmenu
**Prioritas: MAGAS | Komplexitas: Kozepes | ~3-4 ora**

A canvas alja kozepen egy floating pill formaju gyorsmenu 4 eloredefinalt effekt preset-tel. Ez az egyik leglatvanasabb UX javitas:
- **Glow**: Glow bekapcsolas + OKLCH szin + gradiens
- **Glass**: Atlatszo hatter + backdrop blur + stroke
- **Neo**: Neumorphism + iranyitott arnyek
- **Clay**: Clay stilus + inset arnyek

Minden gomb animalt hover effekttel (translateY, scale). Egy kattintassal alkalmazhatoak.

**Uj fajl:** `src/components/generator/Dock.tsx`

### 3. Canvas Context Menu
**Prioritas: KOZEPES | Komplexitas: Alacsony | ~2-3 ora**

Jobb-klikk kontextus menu a canvas-on a leggyakoribb muveletekhez:
- Copy SVG / Copy CSS
- Export SVG / Export PNG
- Duplicate Shape
- Flip Horizontal / Vertical
- Reset Position / Reset All

A Radix UI `ContextMenu` primitiv mar elerheto a shadcn/ui-ban.

**Uj fajl:** `src/components/generator/CanvasContextMenu.tsx`

### 4. Canvas HUD - Vaszon Info Overlay
**Prioritas: KOZEPES | Komplexitas: Alacsony | ~2 ora**

Az alakzat mereteit es poziciojat kozvetlenul a vasznon megjelenitio glass-style info karta:
- Meret: `320 x 400`
- Pozicio: `x: 0, y: 0`
- Forgatas szog
- Flip jelzok

A canvas also kozepere kerul, atlatszo/blur hatterrel.

**Uj fajl:** `src/components/generator/CanvasHUD.tsx`

### 5. Hook Architektura Refaktor
**Prioritas: KOZEPES | Komplexitas: Magas | ~5-7 ora**

A `useSuperellipse.ts` (724 sor) felbontasa kisebb, specializalt hook-okra:
- `useShapeState.ts` - Alakzat parameter kezeles (width, height, exp, corners)
- `useHistoryState.ts` - Undo/Redo + auto-save (1s debounce, localStorage)
- `useExportActions.ts` - SVG/PNG/CSS export logika
- `useTransformActions.ts` - Flip, rotate, nudge

A fo `useSuperellipse` hook orchestratorkent mukodik tovabbra is. Ez javitja a tesztelheto seget, karbantarthatosagot, es a jovobeni bovites lehetosegeit.

### 6. Auto-Save es Undo/Redo Javitas
**Prioritas: KOZEPES | Komplexitas: Alacsony | ~2-3 ora**

- 1 masodperces debounce-szal localStorage-ba auto-mentes
- Undo/Redo: 500ms debounce, max 50 bejegyzes, duplikatum szures
- Ctrl+S shortcut kezi menteshez toast visszajelzessel
- Allapot visszaallitas oldal ujratolteskor

**Fajlok:** `src/hooks/useSuperellipse.ts` (vagy az uj `useHistoryState.ts`)

---

## NEM Javasolt Fejlesztesek (SKIP)

### macOS MenuBar es TitleBar
**Ok:** A jelenlegi Header mar tartalmazza a szukseges funkcionalitast (View Mode, Device Selector, Inspector, Export). Egy macOS menusor es kulon TitleBar felesleges komplexitast adna, kevesebb gyakorlati ertek mellett. A Header ket reszre bontasa vizualisan szebb lenne, de a meglevo egysoros megoldas funkcionalis es tiszta.

### Selection Handles (Resize/Rotate a canvason)
**Ok:** Magas komplexitas (~6-8 ora), es a jelenlegi slider-alapu meretvaltozatas mar jol mukodik a ControlPanel-ben. A canvas-on torteno resize drag megvalositasa sok edge case-t hoz (aspect ratio lock, snap, multi-layer), es a ROI alacsony.

### Snap-to-Grid es Ruler Guides
**Ok:** A Superellipse Generator elsodlegesen egyetlen alakzat finomhangolasara szolgal, nem egy altalanos design tool. A grid/ruler funkciok multi-shape canvas-nel lennenek igazan hasznosak - ami egy jovobeli fazisban jonnte szoba.

### Properties Section (Position/Size/Layout/Flexbox)
**Ok:** Ezek a webes layout tulajdonsagok (position, flexbox direction, gap) nem relevansak egy SVG shape generatornal. A jelenlegi ControlPanel tabjai (Shape, Color, Glow, Effects) pont a megfelelo absztrakciot nyujtjak.

### ZIP Export
**Ok:** Kicsi hasznossag - a felhasznalok jellemzoen egyetlen SVG-t vagy CSS kodotreszletet masolnak, nem teljes projekteket toltenek le. A jelenlegi export modal (SVG, CSS, React, Vue) lefedte a fo use case-eket.

### Onboarding Overlay
**Ok:** A rendszer mar intuitive hasznaelhato, es a Keyboard Shortcuts Modal (Ctrl+/) eleg tajekoztatas. Egy first-run overlay inkabb irritalo lenne, mint hasznos.

---

## Implementacios Sorrend

| # | Feature | Komplexitas | Becsult ido |
|---|---------|-------------|-------------|
| 1 | CustomSlider pointer capture + touch | Kozepes | 3 ora |
| 2 | Dock effekt gyorsmenu | Kozepes | 3-4 ora |
| 3 | Canvas Context Menu | Alacsony | 2-3 ora |
| 4 | Canvas HUD | Alacsony | 2 ora |
| 5 | Hook architektura refaktor | Magas | 5-7 ora |
| 6 | Auto-save + Undo/Redo javitas | Alacsony | 2-3 ora |
| **Osszesen** | | | **~17-22 ora** |

## Technikai Reszletek

### Uj Fajlok
- `src/components/generator/Dock.tsx`
- `src/components/generator/CanvasContextMenu.tsx`
- `src/components/generator/CanvasHUD.tsx`
- `src/hooks/useShapeState.ts`
- `src/hooks/useHistoryState.ts`
- `src/hooks/useExportActions.ts`
- `src/hooks/useTransformActions.ts`

### Modositando Fajlok
- `src/components/generator/CustomSlider.tsx` - Pointer capture, touch, lokalis state
- `src/components/generator/CanvasContainer.tsx` - Context menu es HUD integralasa
- `src/hooks/useSuperellipse.ts` - Refaktor kisebb hook-okra, auto-save
- `src/pages/Index.tsx` - Dock es uj hook-ok integralasa

