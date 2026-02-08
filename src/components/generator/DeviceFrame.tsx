import { memo, useMemo, type FC, type ReactNode, type CSSProperties } from 'react';
import { DeviceType, DEVICE_CONFIGS } from '@/types/editor';
import { cn } from '@/lib/utils';

interface DeviceFrameProps {
  device: DeviceType;
  children: ReactNode;
}

const DeviceFrameInner: FC<DeviceFrameProps> = ({ device, children }) => {
  const config = DEVICE_CONFIGS[device];

  const frameStyle = useMemo<CSSProperties>(() => ({
    width: device === 'desktop' ? '100%' : `${config.width}px`,
    maxHeight: device === 'desktop' ? '100%' : `${config.height}px`,
  }), [config, device]);

  if (device === 'desktop') {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        className={cn(
          "relative bg-background border-2 border-border rounded-[2rem] shadow-2xl overflow-hidden",
          "transition-all duration-300 ease-out"
        )}
        style={frameStyle}
        role="presentation"
        aria-label={`${config.label} device preview (${config.width}×${config.height})`}
      >
        {/* Device notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-border rounded-b-xl z-10" aria-hidden="true" />
        
        {/* Content area */}
        <div className="w-full h-full overflow-auto pt-6">
          {children}
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-border rounded-full" aria-hidden="true" />
      </div>
    </div>
  );
};

export const DeviceFrame = memo(DeviceFrameInner);
DeviceFrame.displayName = 'DeviceFrame';
