import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Lock, Unlock, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  SuperellipseState,
  CornerExponents,
} from "../../../hooks/useSuperellipse";
import { CornerControls } from "../CornerControls";
import {
  getSuperellipsePath,
  getPerCornerSuperellipsePath,
} from "../../../utils/math";

// ============================================================================
// TYPES
// ============================================================================

interface ShapeTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_DIMENSION = 16;
const MAX_DIMENSION = 2000;
const MIN_EXPONENT = 0.5;
const MAX_EXPONENT = 10;

const SIZE_PRESETS = [
  { label: "Tiny", w: 64, h: 64, category: "icon" },
  { label: "Small", w: 120, h: 120, category: "icon" },
  { label: "Medium", w: 200, h: 200, category: "icon" },
  { label: "Card", w: 320, h: 400, category: "ui" },
  { label: "Wide", w: 400, h: 280, category: "ui" },
  { label: "Banner", w: 480, h: 200, category: "ui" },
  { label: "Mobile", w: 390, h: 844, category: "device" },
  { label: "Tablet", w: 768, h: 1024, category: "device" },
  { label: "Desktop", w: 1920, h: 1080, category: "device" },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const clampDimension = (value: number): number => {
  return Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, Math.round(value)));
};

const parseDimension = (input: string, fallback: number): number => {
  const parsed = parseInt(input);
  if (isNaN(parsed) || parsed <= 0) return fallback;
  return clampDimension(parsed);
};

const getExponentDescription = (exp: number): string => {
  if (exp < 1.5) return "Very rounded, almost elliptical";
  if (exp < 2.5) return "Ellipse";
  if (exp < 3.5) return "Subtle rounding";
  if (exp < 4.5) return "iOS-style squircle";
  if (exp < 6) return "Strong corners";
  if (exp < 8) return "Almost rectangular";
  return "Nearly perfect rectangle";
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionId = React.useId();

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors px-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
        aria-expanded={isOpen}
        aria-controls={sectionId}
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${title} section`}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        )}
      </button>
      {isOpen && (
        <div id={sectionId} className="space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

interface CustomSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  description,
}) => {
  const [localValue, setLocalValue] = useState(value.toString());
  const sliderId = React.useId();
  const descriptionId = React.useId();

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleInputBlur = () => {
    const parsed = parseFloat(localValue);
    if (isNaN(parsed)) {
      setLocalValue(value.toString());
    } else {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
      setLocalValue(clamped.toString());
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label
          htmlFor={sliderId}
          className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
        <input
          id={`${sliderId}-input`}
          type="number"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min}
          max={max}
          step={step}
          className="w-16 px-2 py-1 text-xs text-right bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
          aria-label={`${label} value input`}
        />
      </div>
      <div className="relative">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          style={{
            background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${percentage}%, rgb(228 228 231) ${percentage}%, rgb(228 228 231) 100%)`,
          }}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-describedby={description ? descriptionId : undefined}
        />
      </div>
      {description && (
        <p
          id={descriptionId}
          className="text-[10px] text-zinc-500 dark:text-zinc-400 px-1 leading-relaxed"
        >
          {description}
        </p>
      )}
    </div>
  );
};

// PathPreview komponens beágyazva (mivel az import problémás)
interface PathPreviewProps {
  width: number;
  height: number;
  exp: number;
  useAsymmetric: boolean;
  cornerExponents: CornerExponents;
  pathData: string;
}

const PathPreview: React.FC<PathPreviewProps> = ({ pathData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(pathData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pathData]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          readOnly
          value={pathData}
          className="w-full h-32 p-3 text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="SVG path data"
        />
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Copy path to clipboard"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
        <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
          Use this path in SVG <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-[9px]">&lt;path d="..."&gt;</code> elements
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ShapeTab: React.FC<ShapeTabProps> = ({ state, updateState }) => {
  const [aspectLocked, setAspectLocked] = useState(false);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(
    state.width / state.height,
  );
  const [inputWidth, setInputWidth] = useState(state.width.toString());
  const [inputHeight, setInputHeight] = useState(state.height.toString());

  // Update aspect ratio when dimensions change externally
  useEffect(() => {
    if (state.height !== 0) {
      setCurrentAspectRatio(state.width / state.height);
    }
  }, [state.width, state.height]);

  // Update local input states when props change
  useEffect(() => {
    setInputWidth(state.width.toString());
    setInputHeight(state.height.toString());
  }, [state.width, state.height]);

  // Compute path data for preview
  const pathData = useMemo(() => {
    if (state.useAsymmetricCorners && state.cornerExponents) {
      return getPerCornerSuperellipsePath(
        state.width,
        state.height,
        state.cornerExponents
      );
    }
    return getSuperellipsePath(state.width, state.height, state.exp);
  }, [
    state.width,
    state.height,
    state.exp,
    state.useAsymmetricCorners,
    state.cornerExponents,
  ]);

  // Debounced dimension update
  const updateDimensions = useCallback(
    (width: number, height: number) => {
      updateState({
        width: clampDimension(width),
        height: clampDimension(height),
      });
    },
    [updateState],
  );

  const handleWidthChange = useCallback((value: string) => {
    setInputWidth(value);
  }, []);

  const handleHeightChange = useCallback((value: string) => {
    setInputHeight(value);
  }, []);

  const handleWidthBlur = useCallback(() => {
    const newWidth = parseDimension(inputWidth, state.width);
    if (aspectLocked && currentAspectRatio > 0) {
      const newHeight = Math.round(newWidth / currentAspectRatio);
      updateDimensions(newWidth, clampDimension(newHeight));
    } else {
      updateDimensions(newWidth, state.height);
    }
  }, [
    inputWidth,
    state.width,
    state.height,
    aspectLocked,
    currentAspectRatio,
    updateDimensions,
  ]);

  const handleHeightBlur = useCallback(() => {
    const newHeight = parseDimension(inputHeight, state.height);
    if (aspectLocked && currentAspectRatio > 0) {
      const newWidth = Math.round(newHeight * currentAspectRatio);
      updateDimensions(clampDimension(newWidth), newHeight);
    } else {
      updateDimensions(state.width, newHeight);
    }
  }, [
    inputHeight,
    state.width,
    state.height,
    aspectLocked,
    currentAspectRatio,
    updateDimensions,
  ]);

  const toggleAspectLock = useCallback(() => {
    setAspectLocked((prev) => !prev);
  }, []);

  const handleCornerChange = useCallback(
    (corner: keyof CornerExponents, value: number) => {
      updateState({
        cornerExponents: {
          ...state.cornerExponents,
          [corner]: value,
        },
      });
    },
    [state.cornerExponents, updateState],
  );

  const exponentDescription = useMemo(
    () => getExponentDescription(state.exp),
    [state.exp],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dimensions */}
      <CollapsibleSection title="Dimensions" defaultOpen={true}>
        <div className="space-y-3">
          <div className="flex items-center justify-end px-1">
            <button
              onClick={toggleAspectLock}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title={aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
              aria-label={
                aspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"
              }
            >
              {aspectLocked ? (
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">
              <div className="relative flex-1">
                <label htmlFor="width-input" className="sr-only">
                  Width
                </label>
                <input
                  id="width-input"
                  type="number"
                  value={inputWidth}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  onBlur={handleWidthBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleWidthBlur()}
                  min={MIN_DIMENSION}
                  max={MAX_DIMENSION}
                  className="w-full h-9 pl-7 pr-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-[0.625rem] text-sm text-zinc-900 dark:text-white outline-0 transition-colors focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500"
                  aria-label="Width in pixels"
                />
                <div
                  className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm pointer-events-none text-zinc-500"
                  aria-hidden="true"
                >
                  W
                </div>
              </div>
              <div className="relative flex-1">
                <label htmlFor="height-input" className="sr-only">
                  Height
                </label>
                <input
                  id="height-input"
                  type="number"
                  value={inputHeight}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  onBlur={handleHeightBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleHeightBlur()}
                  min={MIN_DIMENSION}
                  max={MAX_DIMENSION}
                  className="w-full h-9 pl-7 pr-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-[0.625rem] text-sm text-zinc-900 dark:text-white outline-0 transition-colors focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500"
                  aria-label="Height in pixels"
                />
                <div
                  className="absolute top-1/2 left-2.5 -translate-y-1/2 text-sm pointer-events-none text-zinc-500"
                  aria-hidden="true"
                >
                  H
                </div>
              </div>
            </div>
            <div className="shrink-0 w-8 text-center text-sm text-zinc-500">
              px
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 px-1">
            Aspect ratio:{" "}
            <span className="font-medium">{currentAspectRatio.toFixed(2)}</span>
            {aspectLocked && (
              <span className="ml-1 text-indigo-500">(locked)</span>
            )}
          </div>
        </div>
      </CollapsibleSection>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Curvature */}
      <CollapsibleSection title="Curvature" defaultOpen={true}>
        <div className="space-y-3">
          <CustomSlider
            label="Exponent (n)"
            value={state.exp}
            min={MIN_EXPONENT}
            max={MAX_EXPONENT}
            step={0.1}
            onChange={(val) => updateState({ exp: val })}
            description={exponentDescription}
          />
          <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>n=2:</strong> Perfect ellipse
              <br />
              <strong>n≈4:</strong> iOS-style squircle
              <br />
              <strong>Higher values:</strong> More rectangular
            </p>
          </div>
        </div>
      </CollapsibleSection>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Asymmetric Corners */}
      <CollapsibleSection title="Corner Control" defaultOpen={false}>
        <CornerControls
          useAsymmetric={state.useAsymmetricCorners || false}
          uniformExp={state.exp}
          cornerExponents={
            state.cornerExponents || {
              topLeft: 4,
              topRight: 4,
              bottomLeft: 4,
              bottomRight: 4,
            }
          }
          onToggleAsymmetric={(val) =>
            updateState({ useAsymmetricCorners: val })
          }
          onUniformChange={(val) => updateState({ exp: val })}
          onCornerChange={handleCornerChange}
        />
      </CollapsibleSection>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Path Preview */}
      <CollapsibleSection title="Path Preview" defaultOpen={true}>
        <PathPreview
          width={state.width}
          height={state.height}
          exp={state.exp}
          useAsymmetric={state.useAsymmetricCorners || false}
          cornerExponents={
            state.cornerExponents || {
              topLeft: 4,
              topRight: 4,
              bottomLeft: 4,
              bottomRight: 4,
            }
          }
          pathData={pathData}
        />
      </CollapsibleSection>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Quick Size Presets */}
      <CollapsibleSection title="Quick Sizes" defaultOpen={false}>
        <div className="space-y-3">
          {/* Icons */}
          <div>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 px-1">
              Icons
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_PRESETS.filter((p) => p.category === "icon").map(
                (preset) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      updateState({ width: preset.w, height: preset.h })
                    }
                    className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    title={`${preset.w}×${preset.h}px`}
                    aria-label={`Set size to ${preset.label}: ${preset.w} by ${preset.h} pixels`}
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div
                      className="text-[9px] text-zinc-500"
                      aria-hidden="true"
                    >
                      {preset.w}×{preset.h}
                    </div>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* UI Elements */}
          <div>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 px-1">
              UI Elements
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_PRESETS.filter((p) => p.category === "ui").map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    updateState({ width: preset.w, height: preset.h })
                  }
                  className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  title={`${preset.w}×${preset.h}px`}
                  aria-label={`Set size to ${preset.label}: ${preset.w} by ${preset.h} pixels`}
                >
                  <div className="font-semibold">{preset.label}</div>
                  <div className="text-[9px] text-zinc-500" aria-hidden="true">
                    {preset.w}×{preset.h}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div>
            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2 px-1">
              Devices
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SIZE_PRESETS.filter((p) => p.category === "device").map(
                (preset) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      updateState({ width: preset.w, height: preset.h })
                    }
                    className="px-3 py-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    title={`${preset.w}×${preset.h}px`}
                    aria-label={`Set size to ${preset.label}: ${preset.w} by ${preset.h} pixels`}
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div
                      className="text-[9px] text-zinc-500"
                      aria-hidden="true"
                    >
                      {preset.w}×{preset.h}
                    </div>
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
