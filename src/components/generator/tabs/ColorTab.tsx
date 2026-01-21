import React, { useState } from "react";
import type { FC } from "react";
import { Copy, Plus, Trash2, Check, Palette, Droplet } from "lucide-react";
import {
  SuperellipseState,
  GradientStop,
} from "../../../hooks/useSuperellipse";
import { tailwindColors } from "../../../utils/colorPalette";
import { CustomSlider } from "../CustomSlider";

interface ColorTabProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  updateGradientStop: (index: number, updates: Partial<GradientStop>) => void;
}

// Helper function to validate hex color
const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
};

// ColorInput mini-component for reusability
interface ColorInputProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  size?: "sm" | "md";
}

const ColorInput: FC<ColorInputProps> = ({
  value,
  onChange,
  label,
  size = "md",
}) => {
  const [internalValue, setInternalValue] = useState(value.toUpperCase());
  const [isValid, setIsValid] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInternalValue(newValue);
    const valid = isValidHex(newValue);
    setIsValid(valid);
    if (valid) {
      onChange(newValue);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInternalValue(newValue);
    setIsValid(true);
    onChange(newValue);
  };

  const copyColor = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses =
    size === "sm"
      ? {
          container: "p-0.5",
          swatch: "size-5",
          input: "text-[10px]",
          icon: "w-3 h-3",
        }
      : {
          container: "p-1",
          swatch: "size-7",
          input: "text-sm",
          icon: "w-3.5 h-3.5",
        };

  const inputId = React.useId();
  const errorId = React.useId();

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-[0.625rem] ${sizeClasses.container}`}
      >
        <div
          className={`relative ${sizeClasses.swatch} mr-3 rounded-md border overflow-hidden transition-all ${
            isValid
              ? "border-zinc-200/50 dark:border-zinc-700/50"
              : "border-red-400 dark:border-red-600 ring-2 ring-red-400/20"
          }`}
        >
          <input
            type="color"
            value={value}
            onChange={handleColorPickerChange}
            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10"
            aria-label={label ? `${label} color picker` : "Color picker"}
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: isValid ? value : "#ff0000" }}
            aria-hidden="true"
          />
        </div>
        <input
          id={inputId}
          type="text"
          value={internalValue}
          onChange={handleInputChange}
          className={`flex-1 bg-transparent border-none font-mono uppercase focus:outline-none transition-colors ${sizeClasses.input} ${
            isValid
              ? "text-zinc-700 dark:text-zinc-300"
              : "text-red-500 dark:text-red-400"
          }`}
          placeholder="#FFFFFF"
          maxLength={7}
          aria-label={label ? `${label} hex code` : "Hex color code"}
          aria-invalid={!isValid}
          aria-describedby={!isValid ? errorId : undefined}
        />
        <button
          onClick={copyColor}
          disabled={!isValid}
          className={`p-1.5 rounded transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            copied
              ? "bg-green-100 dark:bg-green-900/30"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Copy color code to clipboard"
        >
          {copied ? (
            <Check
              className={`${sizeClasses.icon} text-green-600`}
              aria-hidden="true"
            />
          ) : (
            <Copy
              className={`${sizeClasses.icon} text-zinc-500`}
              aria-hidden="true"
            />
          )}
        </button>
      </div>
      {!isValid && (
        <p
          id={errorId}
          className="text-[9px] text-red-500 dark:text-red-400 px-1 animate-fade-in"
          role="alert"
          aria-live="polite"
        >
          Invalid hex format (e.g., #FF5733)
        </p>
      )}
    </div>
  );
};

export const ColorTab: FC<ColorTabProps> = ({
  state,
  updateState,
  updateGradientStop,
}) => {
  const modes = ["solid", "linear", "radial", "conic"] as const;

  // Improved gradient stop addition with smart positioning
  const addGradientStop = () => {
    const newStops = [...state.gradientStops];

    if (newStops.length === 0) {
      // Initialize with two default stops if none exist
      newStops.push({ color: "#FFFFFF", position: 0 });
      newStops.push({ color: "#000000", position: 100 });
    } else if (newStops.length === 1) {
      // Add a second stop at the end
      newStops.push({ color: newStops[0].color, position: 100 });
    } else {
      // Insert between last two stops or at the end
      const lastStop = newStops[newStops.length - 1];
      const secondLastStop = newStops[newStops.length - 2];

      // Calculate midpoint position
      const midPosition = Math.round(
        (secondLastStop.position + lastStop.position) / 2,
      );

      if (lastStop.position < 100 && midPosition === lastStop.position) {
        // If at 100, just add with same color and increment position
        newStops.push({
          color: lastStop.color,
          position: Math.min(lastStop.position + 10, 100),
        });
      } else {
        // Insert at midpoint
        newStops.splice(newStops.length - 1, 0, {
          color: lastStop.color,
          position: midPosition,
        });
      }
    }

    updateState({ gradientStops: newStops });
  };

  const removeGradientStop = (index: number) => {
    if (state.gradientStops.length > 2) {
      const newStops = state.gradientStops.filter((_, i) => i !== index);
      updateState({ gradientStops: newStops });
    }
  };

  // Validate and update gradient stop position
  const updateStopPosition = (index: number, value: string) => {
    const parsed = parseInt(value);
    if (!isNaN(parsed)) {
      const clamped = Math.max(0, Math.min(100, parsed));
      updateGradientStop(index, { position: clamped });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mode Tabs */}
      <div className="p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex border border-zinc-200 dark:border-zinc-800">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => updateState({ colorMode: mode })}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              state.colorMode === mode
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
            aria-pressed={state.colorMode === mode}
          >
            {mode}
          </button>
        ))}
      </div>

      {state.colorMode === "solid" ? (
        <div className="space-y-6">
          {/* Color Grid */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Palette className="w-3.5 h-3.5 text-zinc-500" />
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Color Palette
              </p>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {tailwindColors.map((colorDef) => (
                <button
                  key={colorDef.hex}
                  onClick={() => updateState({ solidColor: colorDef.hex })}
                  className={`w-full aspect-square rounded-md hover:scale-110 transition-transform border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    state.solidColor === colorDef.hex
                      ? "border-zinc-900 dark:border-white ring-2 ring-offset-2 ring-zinc-900 dark:ring-white"
                      : "border-black/5 dark:border-white/5"
                  }`}
                  style={{ backgroundColor: colorDef.hex }}
                  aria-label={`Select color ${colorDef.name}`}
                  aria-pressed={state.solidColor === colorDef.hex}
                />
              ))}
            </div>
          </div>

          {/* Color Picker with validation */}
          <ColorInput
            value={state.solidColor}
            onChange={(color) => updateState({ solidColor: color })}
            label="Custom Color"
          />

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Droplet className="w-3.5 h-3.5 text-zinc-500" />
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Opacity
              </p>
            </div>
            <CustomSlider
              label="Opacity"
              value={state.solidOpacity}
              min={0}
              max={100}
              step={1}
              onChange={(val) => updateState({ solidOpacity: val })}
              unit="%"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Gradient Stops */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-300">
                Color Stops ({state.gradientStops.length})
              </span>
              <button
                onClick={addGradientStop}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="Add gradient stop"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stop
              </button>
            </div>

            <div className="space-y-2">
              {state.gradientStops.map((stop, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="w-10 text-[9px] font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">
                    {index === 0
                      ? "Start"
                      : index === state.gradientStops.length - 1
                        ? "End"
                        : `Stop ${index}`}
                  </span>

                  {/* Color picker (compact) */}
                  <div className="relative w-8 h-8 rounded-full shadow-inner ring-1 ring-black/5 dark:ring-white/10 overflow-hidden flex-shrink-0">
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) =>
                        updateGradientStop(index, { color: e.target.value })
                      }
                      className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer opacity-0 z-10"
                      aria-label={`Color for stop ${index + 1}`}
                    />
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: stop.color }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Hex input */}
                  <input
                    type="text"
                    value={stop.color.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (isValidHex(val)) {
                        updateGradientStop(index, { color: val });
                      }
                    }}
                    className="flex-1 h-7 px-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
                    maxLength={7}
                    placeholder="#FFFFFF"
                    aria-label={`Hex code for stop ${index + 1}`}
                  />

                  {/* Position input */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      value={stop.position}
                      onChange={(e) =>
                        updateStopPosition(index, e.target.value)
                      }
                      min={0}
                      max={100}
                      className="w-14 h-7 px-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-mono text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-right"
                      aria-label={`Position for stop ${index + 1}`}
                    />
                    <span className="text-[10px] text-zinc-400">%</span>
                  </div>

                  {/* Delete button */}
                  {state.gradientStops.length > 2 && (
                    <button
                      onClick={() => removeGradientStop(index)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label={`Remove gradient stop ${index + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Angle for linear/conic */}
          {(state.colorMode === "linear" || state.colorMode === "conic") && (
            <CustomSlider
              label={`${state.colorMode === "linear" ? "Linear" : "Conic"} Angle`}
              value={state.gradientAngle}
              min={0}
              max={360}
              step={1}
              onChange={(val) => updateState({ gradientAngle: val })}
              unit="°"
            />
          )}

          {/* Gradient Preview */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
              Preview
            </p>
            <div
              className="w-full h-20 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-inner"
              style={{
                background: (() => {
                  const stops = state.gradientStops
                    .map((s) => `${s.color} ${s.position}%`)
                    .join(", ");

                  switch (state.colorMode) {
                    case "linear":
                      return `linear-gradient(${state.gradientAngle}deg, ${stops})`;
                    case "radial":
                      return `radial-gradient(circle, ${stops})`;
                    case "conic":
                      return `conic-gradient(from ${state.gradientAngle}deg, ${stops})`;
                    default:
                      return stops;
                  }
                })(),
              }}
              aria-label="Gradient preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
