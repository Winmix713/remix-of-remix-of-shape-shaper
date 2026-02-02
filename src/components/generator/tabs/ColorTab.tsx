import React, { useState } from "react";
import type { FC } from "react";
import { Copy, Check, Palette, Droplet } from "lucide-react";
import {
  SuperellipseState,
  GradientStop,
} from "../../../hooks/useSuperellipse";
import { tailwindColors } from "../../../utils/colorPalette";
import { CustomSlider } from "../CustomSlider";
import { GradientEditor } from "../GradientEditor";

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
          className="text-xs font-medium text-muted-foreground px-1"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center bg-muted rounded-[0.625rem] ${sizeClasses.container}`}
      >
        <div
          className={`relative ${sizeClasses.swatch} mr-3 rounded-md border overflow-hidden transition-all ${
            isValid
              ? "border-border"
              : "border-destructive ring-2 ring-destructive/20"
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
              ? "text-foreground"
              : "text-destructive"
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
          className={`p-1.5 rounded transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
            copied
              ? "bg-primary/10"
              : "hover:bg-muted-foreground/10"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Copy color code to clipboard"
        >
          {copied ? (
            <Check
              className={`${sizeClasses.icon} text-primary`}
              aria-hidden="true"
            />
          ) : (
            <Copy
              className={`${sizeClasses.icon} text-muted-foreground`}
              aria-hidden="true"
            />
          )}
        </button>
      </div>
      {!isValid && (
        <p
          id={errorId}
          className="text-[9px] text-destructive px-1 animate-fade-in"
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mode Tabs */}
      <div className="p-1 bg-muted rounded-lg flex border border-border">
        {modes.map((mode) => (
          <button
            key={mode}
            onClick={() => updateState({ colorMode: mode })}
            className={`flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all capitalize focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              state.colorMode === mode
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
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
              <Palette className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">
                Color Palette
              </p>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {tailwindColors.map((colorDef) => (
                <button
                  key={colorDef.hex}
                  onClick={() => updateState({ solidColor: colorDef.hex })}
                  className={`w-full aspect-square rounded-md hover:scale-110 transition-transform border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    state.solidColor === colorDef.hex
                      ? "border-foreground ring-2 ring-offset-2 ring-foreground"
                      : "border-border"
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
              <Droplet className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">
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
          {/* Enhanced Gradient Editor */}
          <GradientEditor
            stops={state.gradientStops}
            angle={state.gradientAngle}
            type={state.colorMode as 'linear' | 'radial' | 'conic'}
            onStopsChange={(stops) => updateState({ gradientStops: stops })}
            onAngleChange={(angle) => updateState({ gradientAngle: angle })}
          />

          {/* Gradient Preview */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground px-1">
              Preview
            </p>
            <div
              className="w-full h-20 rounded-lg border border-border shadow-inner"
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
