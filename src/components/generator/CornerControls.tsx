import React, { memo, useCallback } from "react";
import { Link, RotateCcw } from "lucide-react";
import { CornerExponents } from "../../hooks/useSuperellipse";

interface CornerControlsProps {
  useAsymmetric: boolean;
  uniformExp: number;
  cornerExponents: CornerExponents;
  onToggleAsymmetric: (value: boolean) => void;
  onUniformChange: (value: number) => void;
  onCornerChange: (corner: keyof CornerExponents, value: number) => void;
}

const MIN_EXP = 0.5;
const MAX_EXP = 10;

const CornerSlider = memo<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  position: "tl" | "tr" | "bl" | "br";
}>(({ label, value, onChange, position }) => {
  const percentage = ((value - MIN_EXP) / (MAX_EXP - MIN_EXP)) * 100;
  const sliderId = React.useId();

  // Ensure value is a valid number
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 4;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label
          htmlFor={sliderId}
          className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400"
        >
          {label}
        </label>
        <span
          className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500"
          aria-live="polite"
        >
          {safeValue.toFixed(1)}
        </span>
      </div>
      <div className="relative">
        <input
          id={sliderId}
          type="range"
          min={MIN_EXP}
          max={MAX_EXP}
          step={0.1}
          value={safeValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          style={{
            background: `linear-gradient(to right, rgb(99 102 241) 0%, rgb(99 102 241) ${percentage}%, rgb(228 228 231) ${percentage}%, rgb(228 228 231) 100%)`,
          }}
          aria-label={`${label} corner exponent`}
          aria-valuemin={MIN_EXP}
          aria-valuemax={MAX_EXP}
          aria-valuenow={safeValue}
          aria-valuetext={safeValue.toFixed(1)}
        />
      </div>
    </div>
  );
});

CornerSlider.displayName = "CornerSlider";

export const CornerControls = memo<CornerControlsProps>(
  ({
    useAsymmetric,
    uniformExp,
    cornerExponents,
    onToggleAsymmetric,
    onUniformChange,
    onCornerChange,
  }) => {
    // Ensure uniformExp is a valid number
    const safeUniformExp = typeof uniformExp === 'number' && !isNaN(uniformExp) ? uniformExp : 4;

    const handleApplyToAll = useCallback(() => {
      onCornerChange("topLeft", safeUniformExp);
      onCornerChange("topRight", safeUniformExp);
      onCornerChange("bottomLeft", safeUniformExp);
      onCornerChange("bottomRight", safeUniformExp);
    }, [safeUniformExp, onCornerChange]);

    return (
      <div className="space-y-4">
        {/* Toggle between uniform and asymmetric */}
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-zinc-900 dark:text-white">
              Asymmetric Corners
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Control each corner independently
            </p>
          </div>
          <button
            onClick={() => onToggleAsymmetric(!useAsymmetric)}
            role="switch"
            aria-checked={useAsymmetric}
            aria-label="Toggle asymmetric corners mode"
            className={`relative w-10 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              useAsymmetric ? "bg-indigo-500" : "bg-zinc-200 dark:bg-zinc-700"
            }`}
          >
            <span
              className="block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{
                transform: useAsymmetric
                  ? "translateX(1.25rem)"
                  : "translateX(0.125rem)",
                margin: "0.25rem",
              }}
              aria-hidden="true"
            />
          </button>
        </div>

        {useAsymmetric ? (
          <>
            {/* Corner grid visualization */}
            <div className="grid grid-cols-2 gap-3">
              <CornerSlider
                label="Top Left"
                value={cornerExponents.topLeft}
                onChange={(val) => onCornerChange("topLeft", val)}
                position="tl"
              />
              <CornerSlider
                label="Top Right"
                value={cornerExponents.topRight}
                onChange={(val) => onCornerChange("topRight", val)}
                position="tr"
              />
              <CornerSlider
                label="Bottom Left"
                value={cornerExponents.bottomLeft}
                onChange={(val) => onCornerChange("bottomLeft", val)}
                position="bl"
              />
              <CornerSlider
                label="Bottom Right"
                value={cornerExponents.bottomRight}
                onChange={(val) => onCornerChange("bottomRight", val)}
                position="br"
              />
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={handleApplyToAll}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={`Apply uniform value ${safeUniformExp.toFixed(1)} to all corners`}
              >
                <Link className="w-3 h-3" aria-hidden="true" />
                <span>Apply uniform ({safeUniformExp.toFixed(1)}) to all</span>
              </button>
            </div>

            {/* Preset corner styles */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-1">
                Corner Presets
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onCornerChange("topLeft", 2);
                    onCornerChange("topRight", 2);
                    onCornerChange("bottomLeft", 6);
                    onCornerChange("bottomRight", 6);
                  }}
                  className="px-2 py-1.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Apply top soft preset: rounded top corners, sharp bottom corners"
                >
                  Top Soft
                </button>
                <button
                  onClick={() => {
                    onCornerChange("topLeft", 6);
                    onCornerChange("topRight", 6);
                    onCornerChange("bottomLeft", 2);
                    onCornerChange("bottomRight", 2);
                  }}
                  className="px-2 py-1.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Apply bottom soft preset: sharp top corners, rounded bottom corners"
                >
                  Bottom Soft
                </button>
                <button
                  onClick={() => {
                    onCornerChange("topLeft", 2);
                    onCornerChange("topRight", 8);
                    onCornerChange("bottomLeft", 8);
                    onCornerChange("bottomRight", 2);
                  }}
                  className="px-2 py-1.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Apply diagonal preset: alternating rounded and sharp corners"
                >
                  Diagonal
                </button>
                <button
                  onClick={() => {
                    onCornerChange("topLeft", 2);
                    onCornerChange("topRight", 2);
                    onCornerChange("bottomLeft", 2);
                    onCornerChange("bottomRight", 8);
                  }}
                  className="px-2 py-1.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Apply notched preset: three rounded corners, one sharp corner"
                >
                  Notched
                </button>
                <button
                  onClick={() => {
                    onCornerChange("topLeft", 1);
                    onCornerChange("topRight", 1);
                    onCornerChange("bottomLeft", 4);
                    onCornerChange("bottomRight", 4);
                  }}
                  className="px-2 py-1.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Apply droplet preset: very rounded top, moderately rounded bottom"
                >
                  Droplet
                </button>
                <button
                  onClick={() => {
                    onCornerChange("topLeft", 4);
                    onCornerChange("topRight", 4);
                    onCornerChange("bottomLeft", 4);
                    onCornerChange("bottomRight", 4);
                  }}
                  className="px-2 py-1.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Reset all corners to default value of 4"
                >
                  <div className="flex items-center justify-center gap-1">
                    <RotateCcw className="w-3 h-3" aria-hidden="true" />
                    <span>Reset</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Enable asymmetric corners to control each corner's curvature
              independently. The uniform exponent is controlled in the Curvature
              section above.
            </p>
          </div>
        )}
      </div>
    );
  },
);

CornerControls.displayName = "CornerControls";
