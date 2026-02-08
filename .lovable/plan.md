
# Nexus Editor Feature Integration - Implementation Plan

## Overview

Integrating the Nexus Editor capabilities into the existing Superellipse Generator Pro. The current system already has a solid three-column layout, layer management, and export system. This plan focuses on adding the missing Nexus Editor features while preserving the existing architecture.

## What Already Exists (No Changes Needed)

- Three-column layout (LayerPanel | Canvas | ControlPanel)
- Layer system with drag-and-drop, visibility, lock, blend modes, opacity
- Canvas zoom/pan with keyboard shortcuts
- Export (SVG, PNG, CSS, JSON)
- Keyboard shortcuts system with modal
- Theme toggle (dark/light)
- Preset save/load with JSON export/import
- Gradient editor (linear, radial, conic)
- Effects stack (blur, shadow, glow, noise)

## Implementation Phases

### Phase 1: Enhanced Header / Top Navigation Bar
**File to modify:** `src/components/layout/Header.tsx`

Add the Nexus Editor-style top navigation with:
- **Left section**: Quick action buttons (Add Element, Layout, Type, Component)
- **Center section**: View Mode Switcher (Code | Split | Design) - In our context: Canvas | Split | Fullscreen Preview
- **Right section**: Device preview selector (Mobile 375px | Tablet 768px | Desktop 100%), Settings gear, Export button, Publish button
- **Inspector toggle**: Pointer/Select tool for element inspection mode

### Phase 2: View Mode System
**New file:** `src/hooks/useViewMode.ts`
**Files to modify:** `src/pages/Index.tsx`, `src/components/layout/Header.tsx`

Implement three view modes:
- **Canvas**: Current default three-column layout
- **Code**: Show generated CSS/SVG code in full-width Monaco-style code viewer (read-only, using a styled `<pre>` block with syntax highlighting)
- **Preview**: Full-screen preview of the superellipse without panels

State management via a new `useViewMode` hook with localStorage persistence.

### Phase 3: Device Preview Selector
**New file:** `src/components/generator/DeviceFrame.tsx`
**Files to modify:** `src/components/generator/PreviewArea.tsx`, `src/components/layout/Header.tsx`

Add device frame simulation:
- **Mobile**: 375x812 viewport frame
- **Tablet**: 768x1024 viewport frame
- **Desktop**: Full-width (no frame)

The device selector buttons go in the Header. The PreviewArea wraps content in the appropriate device frame mockup.

### Phase 4: Inspector Mode
**New file:** `src/hooks/useInspector.ts`
**New file:** `src/components/generator/InspectorOverlay.tsx`
**Files to modify:** `src/components/generator/PreviewArea.tsx`, `src/pages/Index.tsx`

When Inspector mode is active:
- Hovering over the superellipse shape highlights it with a blue border
- Clicking selects the element and populates the Properties panel (ControlPanel) with its current values
- Shows element dimensions and position as tooltip overlays
- The Inspector state tracks: selected element tag, computed styles, bounding box

### Phase 5: Sidebar Enhancement - Pages/Layers/Assets Tabs
**Files to modify:** `src/components/generator/layers/LayerPanel.tsx`

Add tabbed navigation to the LayerPanel:
- **Layers** (current functionality - already implemented)
- **Assets**: Asset library browser (already exists as AssetsTab, relocate to sidebar)
- **Pages**: Future-ready placeholder for multi-page support

### Phase 6: Properties Panel Enhancement
**New file:** `src/components/generator/PropertiesSection.tsx`
**Files to modify:** `src/components/generator/ControlPanel.tsx`

Add Nexus Editor-style properties sections as a new tab or integrated into existing tabs:
- **Position**: Relative/Absolute/Fixed selector
- **Size**: Width/Height with unit selector (px, %, fr, auto)
- **Layout**: Flexbox direction, distribute, align, wrap, gap controls
- **Effects**: Appear animation, overlay, cursor effects
- **Tailwind Output**: Live Tailwind class generation from current shape settings with copy button

### Phase 7: Tailwind CSS Output Generator
**New file:** `src/utils/tailwindGenerator.ts`
**Files to modify:** `src/components/generator/tabs/CssTab.tsx`

Generate Tailwind utility classes from the current superellipse state:
- Dimensions: `w-[320px] h-[400px]`
- Border radius approximation: `rounded-[40px]`
- Colors: `bg-[#FF9F00]`
- Shadows: `shadow-[0_0_40px_oklch(...)]`
- Opacity: `opacity-80`
- Copy-to-clipboard with visual feedback

### Phase 8: Status Bar
**New file:** `src/components/layout/StatusBar.tsx`
**Files to modify:** `src/pages/Index.tsx`

Bottom status bar showing:
- Active tool indicator (green dot)
- Current shape dimensions (W x H)
- Zoom level percentage
- Active layer name
- Export format indicator
- Keyboard shortcut hint for current context

### Phase 9: Enhanced Export with ZIP Download
**Files to modify:** `src/components/generator/tabs/ExportTab.tsx`, `src/components/generator/modals/ExportCodeModal.tsx`

Add project ZIP export:
- Bundle all generated files (HTML, CSS, SVG, JSON config) into a ZIP
- Use JSZip library (needs to be added as dependency)
- Include: `index.html` with embedded shape, `styles.css`, `shape.svg`, `config.json`
- Download as `superellipse-project-{timestamp}.zip`

---

## Technical Details

### New Dependencies
- No new dependencies required for core features (existing stack covers all needs)
- Optional: JSZip for ZIP export (Phase 9)

### New Type Definitions

```text
// src/types/editor.ts
type ViewMode = 'canvas' | 'code' | 'preview';
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceConfig {
  type: DeviceType;
  width: number;
  height: number;
  label: string;
}

interface InspectorState {
  active: boolean;
  hoveredElement: string | null;
  selectedElement: string | null;
  boundingBox: DOMRect | null;
  computedStyles: Record<string, string>;
}

interface StatusBarInfo {
  tool: string;
  dimensions: { width: number; height: number };
  zoom: number;
  activeLayer: string | null;
  exportFormat: string;
}
```

### File Creation Summary

| File | Purpose |
|------|---------|
| `src/types/editor.ts` | Editor mode and inspector type definitions |
| `src/hooks/useViewMode.ts` | View mode state management |
| `src/hooks/useInspector.ts` | Inspector mode logic |
| `src/components/generator/DeviceFrame.tsx` | Device mockup frames |
| `src/components/generator/InspectorOverlay.tsx` | Inspector selection UI |
| `src/components/generator/PropertiesSection.tsx` | Nexus-style property controls |
| `src/components/layout/StatusBar.tsx` | Bottom status bar |
| `src/utils/tailwindGenerator.ts` | Tailwind class generator |

### File Modification Summary

| File | Changes |
|------|---------|
| `src/components/layout/Header.tsx` | Full redesign: action buttons, view mode switch, device selector, inspector toggle |
| `src/pages/Index.tsx` | View mode integration, inspector provider, status bar |
| `src/components/generator/PreviewArea.tsx` | Device frame wrapper, inspector overlay |
| `src/components/generator/layers/LayerPanel.tsx` | Pages/Layers/Assets tab navigation |
| `src/components/generator/ControlPanel.tsx` | Properties section integration |
| `src/components/generator/tabs/CssTab.tsx` | Tailwind output format |
| `src/components/generator/tabs/ExportTab.tsx` | ZIP export option |
| `src/components/generator/modals/ExportCodeModal.tsx` | Tailwind format addition |

### Implementation Order

1. Editor types definition
2. Header redesign with view mode switcher and device selector
3. View mode system (useViewMode hook + Index.tsx integration)
4. Device frame component and preview integration
5. Status bar
6. Inspector mode (hook + overlay)
7. Sidebar tabs (Pages/Layers/Assets)
8. Properties section
9. Tailwind generator
10. ZIP export

### Design Principles

- Maintain the existing dark theme aesthetic
- All new controls follow the existing component patterns (Radix UI, Tailwind, cn() utility)
- Responsive: panels collapse on narrow screens
- Full keyboard accessibility maintained
- Performance: memoized components, useCallback/useMemo for expensive operations
