"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TagOption {
  value: string;
  label: string;
}

interface TagsComboboxProps {
  options: TagOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function TagsCombobox({
  options,
  value,
  onChange,
  placeholder = "Select tags…",
  label,
  className,
}: TagsComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(val: string) {
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
    );
  }

  function remove(val: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  }

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search input when opening
  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setSearch("");
  }, [open]);

  const selectedLabels = value.map(
    (v) => options.find((o) => o.value === v)?.label ?? v,
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      {label && (
        <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-foreground/40">
          {label}
        </span>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-9 w-full flex-wrap items-center gap-1 rounded border bg-card/60 px-3 py-1.5 text-left backdrop-blur-sm transition-all",
          open
            ? "border-primary/40 shadow-[0_0_8px_rgba(var(--primary-rgb,0,180,255),0.1)]"
            : "border-primary/20 hover:border-primary/30",
        )}
      >
        {selectedLabels.length === 0 ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/25">
            {placeholder}
          </span>
        ) : (
          selectedLabels.map((label, i) => (
            <span
              key={value[i]}
              className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary"
            >
              {label}
              <span
                role="button"
                onClick={(e) => remove(value[i], e)}
                className="cursor-pointer text-primary/50 hover:text-primary transition-colors"
                aria-label={`Remove ${label}`}
              >
                <X className="h-2.5 w-2.5" />
              </span>
            </span>
          ))
        )}
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          fill="none"
          className={cn(
            "ml-auto shrink-0 text-foreground/30 transition-transform",
            open && "rotate-180",
          )}
        >
          <path
            d="M2 3l2 2 2-2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded border border-primary/30 bg-card/95 py-1 shadow-[0_0_20px_rgba(var(--primary-rgb,0,180,255),0.06)] backdrop-blur-md">
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)]" />

          {/* Search */}
          <div className="relative border-b border-primary/15 px-3 py-1.5">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter…"
              className="w-full bg-transparent font-mono text-[10px] uppercase tracking-widest text-foreground/70 placeholder:text-foreground/25 outline-none"
            />
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb:hover]:bg-primary/40">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-foreground/30">
                No results
              </p>
            ) : (
              filtered.map((option) => {
                const selected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={cn(
                      "relative flex w-full items-center gap-2.5 px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-widest transition-colors",
                      selected
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/50 hover:bg-primary/5 hover:text-foreground/70",
                    )}
                  >
                    {/* Checkmark */}
                    <span
                      className={cn(
                        "flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        selected
                          ? "border-primary bg-primary/20"
                          : "border-primary/20",
                      )}
                    >
                      {selected && (
                        <svg
                          viewBox="0 0 8 8"
                          fill="none"
                          className="h-2 w-2 text-primary"
                        >
                          <path
                            d="M1 4l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    {option.label}
                  </button>
                );
              })
            )}
          </div>

          {/* Clear all */}
          {value.length > 0 && (
            <div className="border-t border-primary/15 px-3 py-1.5">
              <button
                type="button"
                onClick={() => onChange([])}
                className="font-mono text-[9px] uppercase tracking-widest text-foreground/35 hover:text-destructive transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
