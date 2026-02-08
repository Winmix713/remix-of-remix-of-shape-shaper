/**
 * Editor mode and inspector type definitions for Nexus Editor integration
 */

export type ViewMode = 'canvas' | 'code' | 'preview';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceConfig {
  type: DeviceType;
  width: number;
  height: number;
  label: string;
  icon: string;
}

export const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  mobile: { type: 'mobile', width: 375, height: 812, label: 'Mobile', icon: 'Smartphone' },
  tablet: { type: 'tablet', width: 768, height: 1024, label: 'Tablet', icon: 'Tablet' },
  desktop: { type: 'desktop', width: 0, height: 0, label: 'Desktop', icon: 'Monitor' },
};

export interface InspectorState {
  active: boolean;
  hoveredElement: string | null;
  selectedElement: string | null;
  boundingBox: DOMRect | null;
}

export interface StatusBarInfo {
  tool: string;
  dimensions: { width: number; height: number };
  zoom: number;
  activeLayer: string | null;
}
