"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useHotkey, useKeyHold } from "@tanstack/react-hotkeys";

interface NumberInputProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
}

export function NumberInput({
  value: controlledValue,
  defaultValue = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  label,
  disabled = false,
  className,
  ...props
}: NumberInputProps) {
  // STATES
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const current = controlledValue ?? internalValue;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isShiftHeld = useKeyHold("Shift");
  const isCtrlHeld = useKeyHold("Control");

  // FUNCTIONS
  function update(toAdd: number) {
    const s = step * (isShiftHeld ? 100 : isCtrlHeld ? 10 : 1);
    const stepped = toAdd * s;
    const clamped = Math.min(max, Math.max(min, current + stepped));

    if (controlledValue === undefined) setInternalValue(clamped);
    onChange?.(clamped);
  }

  // HOOKS
  useHotkey("ArrowUp", () => update(step), {
    target: inputRef,
    enabled: !disabled,
  });
  useHotkey("ArrowDown", () => update(-step), {
    target: inputRef,
    enabled: !disabled,
  });

  return (
    <div
      data-slot="tron-number-input"
      className={cn("space-y-1", disabled && "opacity-40", className)}
      {...props}
    >
      {label && (
        <span className="block font-mono text-[9px] uppercase tracking-widest text-foreground/40">
          {label}
        </span>
      )}

      <div className="inline-flex items-stretch rounded border border-primary/20 bg-card/60 backdrop-blur-sm">
        <button
          type="button"
          disabled={disabled || current <= min}
          onClick={() => update(-step)}
          className="flex w-8 items-center justify-center border-r border-primary/15 text-foreground/30 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
            <path
              d="M0 1h8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={current}
          disabled={disabled}
          onChange={(e) => {
            const v = Number(e.target.value);

            if (!isNaN(v)) update(v - current);
          }}
          className="w-16 bg-transparent py-1.5 text-center font-mono text-xs tabular-nums text-foreground/70 outline-none"
        />

        <button
          type="button"
          disabled={disabled || current >= max}
          onClick={() => update(step)}
          className="flex w-8 items-center justify-center border-l border-primary/15 text-foreground/30 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M0 4h8M4 0v8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
