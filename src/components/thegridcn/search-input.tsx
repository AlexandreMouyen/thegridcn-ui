"use client";

import * as React from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  loading?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value: controlledValue,
      onChange,
      onSearch,
      loading = false,
      placeholder = "Search…",
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    // STATES
    const [internalValue, setInternalValue] = React.useState("");
    const current = controlledValue ?? internalValue;
    const innerRef = React.useRef<HTMLInputElement>(null);

    // FUNCTIONS
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const v = e.target.value;
      if (controlledValue === undefined) setInternalValue(v);
      onChange?.(v);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === "Enter") {
        e.preventDefault();
        onSearch?.(current);
      }
    }

    function handleClear() {
      if (controlledValue === undefined) setInternalValue("");
      onChange?.("");
    }

    // HOOKS
    useHotkey(
      "Escape",
      () => {
        if (current) handleClear();
      },
      { target: innerRef, enabled: !disabled },
    );

    // RENDER
    return (
      <div
        data-slot="tron-search-input"
        className={cn("relative", disabled && "opacity-40", className)}
        ref={innerRef}
      >
        {/* Search icon */}
        <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-foreground/25 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle
              cx="5.5"
              cy="5.5"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M9 9l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          ref={ref}
          type="text"
          value={current}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded border border-primary/20 bg-card/60 py-2 pl-9 font-mono text-xs text-foreground/80 outline-none backdrop-blur-sm transition-all placeholder:text-foreground/20",
            "focus:border-primary/40 focus:shadow-[0_0_8px_rgba(var(--primary-rgb,0,180,255),0.1)]",
            current ? "pr-8" : "pr-3",
            loading && current ? "pr-14" : "",
            disabled && "cursor-not-allowed",
          )}
          {...props}
        />

        {/* Loading spinner */}
        {loading && current && (
          <span className="absolute right-8 top-1/2 z-10 -translate-y-1/2 text-primary/50 pointer-events-none">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="animate-spin"
            >
              <circle
                cx="6"
                cy="6"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.25"
              />
              <path
                d="M6 1a5 5 0 014.33 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}

        {/* Clear button */}
        {current && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 text-foreground/25 transition-colors hover:text-primary"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 1l8 8M9 1l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
