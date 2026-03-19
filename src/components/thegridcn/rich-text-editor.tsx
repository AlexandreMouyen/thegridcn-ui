"use client";

import * as React from "react";
import { Eye, EyeOff, Bold, Italic, BookOpen, Loader2 } from "lucide-react";
import { formatForDisplay } from "@tanstack/hotkeys";
import { useHotkey } from "@tanstack/react-hotkeys";
import { cn } from "@/lib/utils";
import { RichContent } from "@/components/ui/glossary";
import { Tooltip } from "@/components/thegridcn/tooltip";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip HTML tags and replace {glossary:slug|display} tokens with display text */
function getPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\{glossary:[^|{}]+\|([^{}]+)\}/g, "$1");
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GlossaryHit {
  slug: string;
  term: string;
}

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** CSS min-height for the textarea / preview area */
  minHeight?: string;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  label,
  required,
  placeholder,
  hint,
  error,
  disabled = false,
  minHeight = "120px",
  className,
}: RichTextEditorProps) {
  // REFS
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const savedSelectionRef = React.useRef<{ start: number; end: number } | null>(
    null,
  );
  const pickerRef = React.useRef<HTMLDivElement>(null);

  // STATES
  const [preview, setPreview] = React.useState(false);
  const [glossaryOpen, setGlossaryOpen] = React.useState(false);
  const [glossaryQuery, setGlossaryQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [glossaryResults, setGlossaryResults] = React.useState<GlossaryHit[]>(
    [],
  );
  const [glossaryLoading, setGlossaryLoading] = React.useState(false);

  // DEBOUNCE glossary query
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(glossaryQuery), 250);
    return () => clearTimeout(t);
  }, [glossaryQuery]);

  // FETCH glossary terms
  React.useEffect(() => {
    if (!glossaryOpen) {
      setGlossaryResults([]);
      return;
    }

    const controller = new AbortController();

    setGlossaryLoading(true);
    const url =
      `/api/glossary?locale=en&limit=10` +
      (debouncedQuery.trim()
        ? `&q=${encodeURIComponent(debouncedQuery.trim())}`
        : "");
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) =>
        setGlossaryResults(
          (d?.data ?? []).map((t: { slug: string; term: string }) => ({
            slug: t.slug,
            term: t.term,
          })),
        ),
      )
      .catch((err) => {
        if ((err as Error)?.name !== "AbortError") setGlossaryResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setGlossaryLoading(false);
      });
    return () => controller.abort();
  }, [glossaryOpen, debouncedQuery]);

  // CLOSE picker on outside click
  React.useEffect(() => {
    if (!glossaryOpen) return;
    function handlePointerDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setGlossaryOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [glossaryOpen]);

  // FUNCTIONS

  /** Wrap current textarea selection (or cursor) with before/after strings. */
  function wrapSelection(before: string, after: string) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const raw = value.slice(start, end);
    const inner = raw.trim();
    const leadingSpaces = raw.length - raw.trimStart().length;
    const trailingSpaces = raw.length - raw.trimEnd().length;
    onChange(
      value.slice(0, start) +
        (leadingSpaces > 0 ? raw.slice(0, leadingSpaces) : "") +
        before +
        inner +
        after +
        (trailingSpaces > 0 ? raw.slice(-trailingSpaces) : "") +
        value.slice(end),
    );
    requestAnimationFrame(() => {
      el.focus();
      const cursor = inner
        ? start + leadingSpaces + before.length + inner.length + after.length
        : start + before.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  /** Insert a glossary token at the saved (or current) cursor position. */
  function insertGlossaryTerm(slug: string, term: string) {
    const el = textareaRef.current;
    const saved = savedSelectionRef.current;
    const start = saved?.start ?? el?.selectionStart ?? 0;
    const end = saved?.end ?? el?.selectionEnd ?? 0;
    const token = `{glossary:${slug}|${term}}`;
    onChange(value.slice(0, start) + token + value.slice(end));
    setGlossaryOpen(false);
    setGlossaryQuery("");
    savedSelectionRef.current = null;
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      }
    });
  }

  // HOOKS
  useHotkey("Mod+B", () => wrapSelection("<strong>", "</strong>"), {
    target: textareaRef,
    enabled: !disabled && !preview,
    preventDefault: true,
  });
  useHotkey("Mod+I", () => wrapSelection("<em>", "</em>"), {
    target: textareaRef,
    enabled: !disabled && !preview,
    preventDefault: true,
  });
  useHotkey("Mod+Shift+P", () => setPreview((v) => !v), {
    target: textareaRef,
    enabled: !disabled,
    preventDefault: true,
  });

  // COUNTS (based on visible text, not raw markup)
  const plainText = getPlainText(value).trim();
  const wordCount = plainText
    ? plainText.split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = plainText.length;

  // RENDER
  return (
    <div
      data-slot="tron-rich-text-editor"
      className={cn("space-y-1", disabled && "opacity-40", className)}
    >
      {/* ── Label row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-1.5">
        {label ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">
            {label}
            {required && " *"}
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPreview((v) => !v)}
          className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors disabled:pointer-events-none"
        >
          {preview ? (
            <>
              <EyeOff className="h-3 w-3 mb-px" /> Edit
            </>
          ) : (
            <>
              <Eye className="h-3 w-3 mb-px" /> Preview
            </>
          )}
        </button>
      </div>

      {/* ── Editor shell ──────────────────────────────────────────────────── */}
      <div
        className={cn(
          "rounded border bg-card/60 backdrop-blur-sm transition-all",
          error ? "border-red-500/40" : "border-primary/20",
          !preview &&
            "focus-within:border-primary/40 focus-within:shadow-[0_0_8px_rgba(var(--primary-rgb,0,180,255),0.1)]",
        )}
      >
        {/* Toolbar — edit mode only */}
        {!preview && (
          <div className="flex items-center gap-0.5 border-b border-primary/10 px-2 py-1.5">
            {/* Bold */}
            <Tooltip
              content={`Bold · ${formatForDisplay("Mod+b")}`}
              side="bottom"
            >
              <button
                type="button"
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  wrapSelection("<strong>", "</strong>");
                }}
                className="p-1 rounded text-foreground/30 hover:text-primary hover:bg-primary/10 transition-colors disabled:cursor-not-allowed"
                aria-label="Bold"
              >
                <Bold className="h-3 w-3" />
              </button>
            </Tooltip>

            {/* Italic */}
            <Tooltip
              content={`Italic · ${formatForDisplay("Mod+i")}`}
              side="bottom"
            >
              <button
                type="button"
                disabled={disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  wrapSelection("<em>", "</em>");
                }}
                className="p-1 rounded text-foreground/30 hover:text-primary hover:bg-primary/10 transition-colors disabled:cursor-not-allowed"
                aria-label="Italic"
              >
                <Italic className="h-3 w-3" />
              </button>
            </Tooltip>

            {/* Separator */}
            <div className="w-px h-3.5 bg-primary/10 mx-1 shrink-0" />

            {/* Glossary term insert */}
            <div className="relative" ref={pickerRef}>
              <Tooltip content="Insert glossary term" side="bottom">
                <button
                  type="button"
                  disabled={disabled}
                  onMouseDown={() => {
                    // Save textarea selection before focus moves to picker
                    if (textareaRef.current) {
                      savedSelectionRef.current = {
                        start: textareaRef.current.selectionStart,
                        end: textareaRef.current.selectionEnd,
                      };
                    }
                  }}
                  onClick={() => {
                    setGlossaryOpen((v) => !v);
                    if (!glossaryOpen) setGlossaryQuery("");
                  }}
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-1 rounded transition-colors disabled:cursor-not-allowed font-mono text-[9px] uppercase tracking-widest",
                    glossaryOpen
                      ? "text-primary bg-primary/10"
                      : "text-foreground/30 hover:text-primary hover:bg-primary/10",
                  )}
                  aria-label="Insert glossary term"
                >
                  <BookOpen className="h-3 w-3" />
                  <span>Glossary</span>
                </button>
              </Tooltip>

              {/* Picker dropdown */}
              {glossaryOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded border border-primary/20 bg-card shadow-lg overflow-hidden">
                  {/* Search row */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/10">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="shrink-0 text-foreground/30"
                    >
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
                    <input
                      autoFocus
                      type="text"
                      value={glossaryQuery}
                      onChange={(e) => setGlossaryQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setGlossaryOpen(false);
                      }}
                      placeholder="Search terms…"
                      className="flex-1 bg-transparent font-mono text-xs text-foreground/80 placeholder:text-foreground/25 outline-none"
                    />
                    {glossaryLoading && (
                      <Loader2 className="h-3 w-3 animate-spin text-primary/40 shrink-0" />
                    )}
                  </div>

                  {/* Results */}
                  <div className="max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb:hover]:bg-primary/60">
                    {!glossaryLoading && glossaryResults.length === 0 ? (
                      <p className="font-mono text-[9px] text-foreground/30 text-center py-5 uppercase tracking-widest">
                        No terms found
                      </p>
                    ) : (
                      glossaryResults.map((t) => (
                        <button
                          key={t.slug}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            insertGlossaryTerm(t.slug, t.term);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-primary/10 transition-colors border-b border-border/15 last:border-0"
                        >
                          <span className="font-rajdhani text-sm text-foreground/80 truncate">
                            {t.term}
                          </span>
                          <span className="font-mono text-[9px] text-foreground/35 shrink-0 ml-2">
                            {t.slug}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard hint */}
            <span className="ml-auto font-mono text-[9px] text-foreground/20 pr-1 shrink-0">
              {formatForDisplay("Mod+b")} · {formatForDisplay("Mod+i")} ·{" "}
              {formatForDisplay("Mod+Shift+p")}
            </span>
          </div>
        )}

        {/* Content area */}
        {preview ? (
          <div
            className="font-rajdhani text-sm text-foreground/80 px-3 py-2.5 [&_strong]:font-semibold [&_em]:italic"
            style={{ minHeight }}
          >
            {value.trim() ? (
              <RichContent html={value} />
            ) : (
              <span className="italic text-foreground/30">
                Nothing to preview yet…
              </span>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent font-rajdhani text-sm text-foreground/80 px-3 py-2.5 outline-none resize-y placeholder:text-foreground/20 disabled:cursor-not-allowed"
            style={{ minHeight }}
          />
        )}
      </div>

      {/* ── Footer: hint/error + word/char counter ────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <p
          className={cn(
            "font-mono text-[9px]",
            error ? "text-red-400" : "text-foreground/25",
          )}
        >
          {error || hint || ""}
        </p>
        <p className="font-mono text-[9px] text-foreground/25 tabular-nums shrink-0">
          {wordCount} word{wordCount !== 1 ? "s" : ""} · {charCount} char
          {charCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
