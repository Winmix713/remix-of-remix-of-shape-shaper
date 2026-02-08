import { useState, useCallback, useEffect } from 'react';
import { ViewMode, DeviceType } from '@/types/editor';

const STORAGE_KEY_VIEW = 'nexus-view-mode';
const STORAGE_KEY_DEVICE = 'nexus-device-type';

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VIEW);
    return (saved as ViewMode) || 'canvas';
  });

  const [device, setDevice] = useState<DeviceType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DEVICE);
    return (saved as DeviceType) || 'desktop';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DEVICE, device);
  }, [device]);

  const changeViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const changeDevice = useCallback((d: DeviceType) => {
    setDevice(d);
  }, []);

  return {
    viewMode,
    setViewMode: changeViewMode,
    device,
    setDevice: changeDevice,
  };
}
