"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { selectableThemes, useTheme } from "@/components/theme";

import { GridScanOverlay, UplinkHeader } from "@/components/thegridcn";
import { type IEra, type IEvent, type LocalizedString } from "@/types/timeline";
import { GridMap } from "@/components/website";

const GodAvatar3D = dynamic(
  () => import("@/components/website/god-avatar").then((m) => m.GodAvatar3D),
  { ssr: false },
);

const Grid3D = dynamic(
  () => import("@/components/thegridcn/grid").then((m) => m.Grid3D),
  { ssr: false },
);

// ─── Tag styling config ────────────────────────────────────────────────────────
const TAG_CONFIG: Record<string, { cls: string; label: string }> = {
  MILITARY: {
    cls: "border-red-500/30    bg-red-500/10    text-red-400",
    label: "Military",
  },
  CONFLICT: {
    cls: "border-red-500/30    bg-red-500/10    text-red-400",
    label: "Conflict",
  },
  TRAGEDY: {
    cls: "border-red-500/30    bg-red-500/10    text-red-400",
    label: "Tragedy",
  },
  POLITICAL: {
    cls: "border-amber-500/30  bg-amber-500/10  text-amber-400",
    label: "Political",
  },
  CULTURE: {
    cls: "border-amber-500/30  bg-amber-500/10  text-amber-400",
    label: "Culture",
  },
  EXPLORATION: {
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    label: "Exploration",
  },
  DIPLOMACY: {
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    label: "Diplomacy",
  },
  CIVILIZATION: {
    cls: "border-primary/30    bg-primary/10    text-primary",
    label: "Civilization",
  },
  TECHNOLOGY: {
    cls: "border-primary/30    bg-primary/10    text-primary",
    label: "Technology",
  },
  HISTORY: {
    cls: "border-foreground/20 bg-foreground/5  text-foreground/50",
    label: "History",
  },
  RELIGION: {
    cls: "border-foreground/20 bg-foreground/5  text-foreground/50",
    label: "Religion",
  },
  ARCHEOLOGY: {
    cls: "border-foreground/20 bg-foreground/5  text-foreground/50",
    label: "Archeology",
  },
};

// ─── Significance config ────────────────────────────────────────────────────────
const SIG_CONFIG = {
  critical: {
    label: "CRITICAL EVENT",
    cls: "border-red-500/40 bg-red-500/10 text-red-400",
  },
  major: {
    label: "MAJOR EVENT",
    cls: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  standard: {
    label: "EVENT",
    cls: "border-foreground/20 bg-foreground/5 text-foreground/40",
  },
};

// ─── Locale helper ──────────────────────────────────────────────────────────────
// Falls back: requested locale → "en" → first available → ""
function t(ls: LocalizedString | undefined, locale: string): string {
  if (!ls) return "";
  return ls[locale] ?? ls["en"] ?? Object.values(ls)[0] ?? "";
}

// ─── Date formatting ────────────────────────────────────────────────────────────
function formatDate(date: IEvent["date"]): string {
  const { year, month, day } = date;
  if (day && month) {
    const d = new Date(year, month - 1, day);
    const m = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${m} ${year} SE`;
  }
  if (month) {
    const d = new Date(year, month - 1, 1);
    const m = d.toLocaleDateString("en-US", { month: "long" });
    return `${m} ${year} SE`;
  }
  return `${year} SE`;
}

// ─── Corner brackets decoration ─────────────────────────────────────────────────
function HUDCorners({ size = "sm" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-3 w-3 border-[1.5px]" : "h-5 w-5 border-2";
  return (
    <>
      <span
        className={cn(
          "absolute -top-px -left-px border-t border-l border-primary",
          s,
        )}
      />
      <span
        className={cn(
          "absolute -top-px -right-px border-t border-r border-primary",
          s,
        )}
      />
      <span
        className={cn(
          "absolute -bottom-px -left-px border-b border-l border-primary",
          s,
        )}
      />
      <span
        className={cn(
          "absolute -bottom-px -right-px border-b border-r border-primary",
          s,
        )}
      />
    </>
  );
}

// ─── Scanline overlay ────────────────────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)",
      }}
    />
  );
}

// ─── Timeline Card ────────────────────────────────────────────────────────────────
interface TimelineCardProps {
  event: IEvent;
  era: IEra;
  locale: string;
  indexDiff: number;
  cardOffset: number;
  isActive: boolean;
  onActivate: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
  cardRef?: React.RefCallback<HTMLDivElement>;
}

function TimelineCard({
  event,
  era,
  locale,
  indexDiff,
  cardOffset,
  isActive,
  onActivate,
  expanded,
  onToggleExpand,
  cardRef,
}: TimelineCardProps) {
  const absIdx = Math.abs(indexDiff);
  if (absIdx > 3) return null;

  const scale = absIdx === 0 ? 1 : absIdx === 1 ? 0.88 : 0.76;
  const opacity = absIdx === 0 ? 1 : absIdx === 1 ? 0.6 : 0.25;
  const xOffset = indexDiff * cardOffset;
  const zIndex = absIdx === 0 ? 10 : absIdx === 1 ? 5 : 1;

  const sigConf = SIG_CONFIG[event.significance ?? "standard"];

  return (
    <div
      ref={isActive ? cardRef : undefined}
      onClick={absIdx === 1 && !isActive ? onActivate : undefined}
      className={cn(
        "absolute top-0 w-[min(calc(100vw-2.5rem),496px)]",
        absIdx === 1 && "cursor-pointer",
        absIdx > 1 && "pointer-events-none",
      )}
      style={{
        left: "50%",
        transform: `translateX(calc(-50% + ${xOffset}px)) scale(${scale})`,
        opacity,
        transition:
          "transform 0.42s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.35s ease",
        zIndex,
        transformOrigin: "center top",
        willChange: "transform, opacity",
      }}
    >
      {/* Outer HUD corners */}
      <HUDCorners size="md" />

      <div
        className={cn(
          "relative overflow-hidden border bg-card/90 backdrop-blur-sm rounded-sm",
          isActive
            ? "border-primary/50 shadow-[0_0_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "border-border/35",
        )}
      >
        <Scanlines />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* ── Card header ───────────────────── */}
        <div className="relative px-5 pt-5 pb-3.5 border-b border-border/25">
          {/* Era + significance row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border border-primary/25 bg-primary/8 text-primary/70 shrink-0">
              {t(era.shortName, locale)}
            </span>
            {event.significance && event.significance !== "standard" && (
              <span
                className={cn(
                  "inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border shrink-0",
                  sigConf.cls,
                )}
              >
                {sigConf.label}
              </span>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/55" />
            <span className="font-mono text-[11px] tracking-widest text-foreground/50 select-none">
              {formatDate(event.date)}
            </span>
          </div>

          {/* Title */}
          <h2 className="font-orbitron text-[1.05rem] leading-snug font-semibold text-foreground">
            {t(event.title, locale)}
          </h2>
        </div>

        {/* ── Tags ─────────────────────────── */}
        {event.tags.length > 0 && (
          <div className="relative px-5 py-2.5 flex flex-wrap gap-1.5 border-b border-border/20">
            {event.tags.map((tag) => {
              const conf = TAG_CONFIG[tag];
              return (
                <span
                  key={tag}
                  className={cn(
                    "inline-flex rounded-sm px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest border",
                    conf?.cls ??
                      "border-foreground/20 bg-foreground/5 text-foreground/50",
                  )}
                >
                  {conf?.label ?? tag}
                </span>
              );
            })}
          </div>
        )}

        {/* ── Content ──────────────────────── */}
        <div className="relative px-5 pt-4 pb-4">
          <div
            className={cn(
              "relative font-rajdhani text-[0.9rem] text-foreground/78 leading-relaxed transition-[max-height] duration-500",
              expanded
                ? "max-h-none overflow-visible pr-1"
                : "max-h-[9.5rem] overflow-hidden",
            )}
          >
            {/* Fade mask when collapsed */}
            {!expanded && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-card/90 to-transparent" />
            )}

            {/* Content HTML — static trusted developer data, no XSS risk */}
            <div
              className="[&>p]:mb-3 [&>p:last-child]:mb-0 [&_strong]:text-foreground/90 [&_em]:text-primary/80 [&_em]:not-italic [&_em]:font-medium"
              dangerouslySetInnerHTML={{ __html: t(event.content, locale) }}
            />
          </div>

          {/* Expand/collapse toggle — only on active card */}
          {isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary/55 hover:text-primary transition-colors duration-200"
            >
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-300",
                  expanded && "rotate-180",
                )}
              />
              {expanded ? "Collapse entry" : "Read full entry"}
            </button>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </div>
  );
}

// ─── Era Navigator ─────────────────────────────────────────────────────────────
interface EraNavigatorProps {
  currentIndex: number;
  onGoTo: (index: number) => void;
  eras: IEra[];
  events: IEvent[];
  locale: string;
}

function EraNavigator({
  currentIndex,
  onGoTo,
  eras,
  events,
  locale,
}: EraNavigatorProps) {
  const currentEvent = events[currentIndex];
  const currentEra =
    eras.find((e) => e.slug === currentEvent.eraSlug) ?? eras[0];
  const eraEvents = events.filter((e) => e.eraSlug === currentEra.slug);
  const indexInEra = eraEvents.findIndex((e) => e.slug === currentEvent.slug);

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* ── Era bracket ( "englobe" for active era events ) ── */}
      <div className="relative border border-primary/30 rounded-sm px-5 py-4">
        <HUDCorners size="sm" />
        <Scanlines />

        {/* Era name + position counter */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/40 mb-0.5">
              Current Era
            </p>
            <h3 className="font-orbitron text-sm font-semibold uppercase tracking-wider text-primary">
              {t(currentEra.name, locale)}
            </h3>
            <p className="font-mono text-[9px] text-foreground/35 tracking-wider mt-0.5">
              {currentEra.startYear} SE —{" "}
              {currentEra.endYear ? `${currentEra.endYear} SE` : "Present"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/40 mb-0.5">
              Event
            </p>
            <p className="font-mono text-sm font-semibold text-foreground/70">
              {indexInEra + 1}
              <span className="text-foreground/30 text-[10px]">
                {" "}
                / {eraEvents.length}
              </span>
            </p>
          </div>
        </div>

        {/* Era description */}
        <p className="font-rajdhani text-[0.8rem] text-foreground/40 mb-4 leading-snug">
          {t(currentEra.description, locale)}
        </p>

        {/* ── Event dots for active era ── */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 py-1">
          {eraEvents.map((ev, i) => {
            const globalIdx = events.findIndex((e) => e.slug === ev.slug);
            const isActiveDot = i === indexInEra;
            return (
              <button
                key={ev.slug}
                data-active={isActiveDot ? "true" : undefined}
                onClick={() => onGoTo(globalIdx)}
                title={t(ev.title, locale)}
                className="group flex flex-col items-center gap-1.5 shrink-0 focus-visible:outline-none"
                aria-label={`Go to: ${t(ev.title, locale)}`}
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-300",
                    isActiveDot
                      ? "h-3.5 w-3.5 bg-primary shadow-[0_0_10px_var(--primary),0_0_4px_var(--primary)]"
                      : "h-2 w-2 bg-primary/25 group-hover:bg-primary/55 group-hover:scale-125",
                  )}
                />
                {isActiveDot && (
                  <span className="block h-px w-[18px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Era tab bar ──────────────────────── */}
      <div
        className="flex gap-1.5 mt-3 flex-wrap justify-center"
        role="tablist"
        aria-label="Historical Eras"
      >
        {eras.map((era) => {
          const isActive = era.slug === currentEra.slug;
          const firstIdx = events.findIndex((e) => e.eraSlug === era.slug);
          return (
            <button
              key={era.slug}
              role="tab"
              aria-selected={isActive}
              onClick={() => onGoTo(firstIdx)}
              className={cn(
                "relative px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest rounded-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                isActive
                  ? "border border-primary/55 bg-primary/14 text-primary shadow-[0_0_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]"
                  : "border border-foreground/12 text-foreground/35 hover:text-foreground/65 hover:border-foreground/25",
              )}
            >
              {t(era.shortName, locale)}
              {isActive && (
                <span className="absolute -top-1.5 -right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const MIN_HEIGHT = 420;

// ─── Theme Selector ───────────────────────────────────────────────────────────
function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-center gap-2 mt-5">
      {selectableThemes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            aria-label={`Switch to ${t.name} theme`}
            className={cn(
              "group relative flex flex-col items-center rounded-sm transition-all duration-200 focus-visible:outline-none",
              isActive ? "opacity-100" : "opacity-35 hover:opacity-65",
            )}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-sm transition-all duration-200",
                isActive
                  ? "ring-1 ring-offset-1 ring-offset-background"
                  : "group-hover:scale-110",
              )}
              style={{
                backgroundColor: `${t.color}15`,
                boxShadow: isActive
                  ? `0 0 0 1px ${t.color}90, 0 0 8px ${t.color}60`
                  : undefined,
              }}
            >
              <GodAvatar3D themeId={t.id} color={t.color} size={32} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
interface ScTimelineProps {
  eras: IEra[];
  events: IEvent[];
  locale?: string;
}

export function ScTimeline({ eras, events, locale = "en" }: ScTimelineProps) {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const [stageMinH, setStageMinH] = useState(MIN_HEIGHT);
  const roRef = useRef<ResizeObserver | null>(null);

  // Observe the active card's element and sync the stage height to it
  const activeCardRef = useCallback((node: HTMLDivElement | null) => {
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      // Add a small bottom clearance so the card never clips into content below
      setStageMinH(
        Math.max(Math.ceil(entry.contentRect.height) + 16, MIN_HEIGHT),
      );
    });
    ro.observe(node);
    roRef.current = ro;
  }, []);

  // Spacing between card centers — wider on desktop to show adjacent cards
  const cardOffset = isMobile ? 370 : 524;

  const prevSlide = useCallback(() => {
    if (currentIndex === 0) return;
    setExpanded(false);
    setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const nextSlide = useCallback(() => {
    if (currentIndex === events.length - 1) return;
    setExpanded(false);
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, events.length]);

  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(events.length - 1, index));
      setExpanded(false);
      setCurrentIndex(clamped);
    },
    [events.length],
  );

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevSlide, nextSlide]);

  // Touch / pointer swipe
  function handlePointerDown(e: React.PointerEvent) {
    pointerStart.current = e.clientX;
  }
  function handlePointerUp(e: React.PointerEvent) {
    if (pointerStart.current === null) return;
    const delta = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(delta) > 48) {
      if (delta > 0) prevSlide();
      else nextSlide();
    }
  }
  function handlePointerCancel() {
    pointerStart.current = null;
  }

  const currentEvent = events[currentIndex];
  const progress = (currentIndex / (events.length - 1)) * 100;
  const currentEraName = t(
    eras.find((e) => e.slug === currentEvent?.eraSlug)?.name,
    locale,
  );
  const currentYear = currentEvent?.date.year ?? "";

  return (
    <main className="flex-1">
      {/* Uplink header bar */}
      <UplinkHeader
        leftText={`ERA: ${currentEraName.toUpperCase()} — ${currentYear} SE`}
        rightText={`THEME: ${theme.toUpperCase()} • ARCHIVE: ${events.length} ENTRIES`}
      />

      <div className="relative w-full overflow-x-hidden">
        {/* Large HUD corner frames — CTA style, offset below sticky header (h-16 = 64px) */}
        <div
          className="pointer-events-none fixed left-4 right-4 bottom-4 z-20 hidden lg:block"
          style={{ top: "108px" }}
        >
          <div className="absolute left-0 top-0 h-16 w-16 border-l-2 border-t-2 border-primary/50" />
          <div className="absolute right-0 top-0 h-16 w-16 border-r-2 border-t-2 border-primary/50" />
          <div className="absolute bottom-0 left-0 h-16 w-16 border-b-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 h-16 w-16 border-b-2 border-r-2 border-primary/50" />
        </div>

        {/* ── Page header ───────────────────────────────────── */}
        <div className="relative z-10 px-4 pt-10 pb-8 text-center">
          <div className="inline-flex items-center gap-2.5 mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-primary/55">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary/50" />
            UEE Historical Archive
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          <h1 className="font-orbitron text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Star Citizen Lore
          </h1>
          <p className="mt-3 font-rajdhani text-base text-foreground/50 max-w-md mx-auto">
            {events.length} archive entries &middot; {eras.length} historical
            eras &middot; 2075 SE – 2954 SE
          </p>

          {/* Theme dot-picker */}
          <ThemeSelector />

          {/* Progress bar */}
          <div className="mt-6 max-w-xs mx-auto">
            <div className="relative h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* Glow */}
              <div
                className="absolute top-0 h-full w-6 bg-primary/60 blur-sm transition-[left] duration-500 ease-out"
                style={{ left: `calc(${progress}% - 1.5rem)` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 font-mono text-[9px] text-foreground/28">
              <span>2075 SE</span>
              <span className="text-primary/60">
                {currentEvent.date.year} SE
              </span>
              <span>2954 SE</span>
            </div>
          </div>
        </div>

        {/* ── Carousel area ─────────────────────────────────── */}
        <div className="relative">
          {/* Nav arrows — hidden on very small screens, visible md+ */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 z-20 pointer-events-none hidden md:flex">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              aria-label="Previous event"
              className={cn(
                "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-sm border transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                currentIndex === 0
                  ? "border-foreground/8 text-foreground/18 cursor-not-allowed"
                  : "border-primary/28 bg-background/70 backdrop-blur-sm text-primary hover:border-primary/60 hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(0,0,0,0.3)]",
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={nextSlide}
              disabled={currentIndex === events.length - 1}
              aria-label="Next event"
              className={cn(
                "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-sm border transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                currentIndex === events.length - 1
                  ? "border-foreground/8 text-foreground/18 cursor-not-allowed"
                  : "border-primary/28 bg-background/70 backdrop-blur-sm text-primary hover:border-primary/60 hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(0,0,0,0.3)]",
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Cards stage — height driven by ResizeObserver on the active card */}
          <div
            className="relative flex items-start justify-center"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerCancel}
            onPointerCancel={handlePointerCancel}
            style={{
              minHeight: stageMinH,
              touchAction: "pan-y",
              transition: "min-height 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
            }}
          >
            {events.map((event, index) => {
              const diff = index - currentIndex;
              if (Math.abs(diff) > 3) return null;
              const era = eras.find((e) => e.slug === event.eraSlug) ?? eras[0];
              return (
                <TimelineCard
                  key={event.slug}
                  event={event}
                  era={era}
                  locale={locale}
                  indexDiff={diff}
                  cardOffset={cardOffset}
                  isActive={index === currentIndex}
                  onActivate={() => goToSlide(index)}
                  expanded={index === currentIndex && expanded}
                  onToggleExpand={() => setExpanded((v) => !v)}
                  cardRef={index === currentIndex ? activeCardRef : undefined}
                />
              );
            })}
          </div>

          {/* Mobile swipe hint / arrows (below cards) */}
          <div className="flex items-center justify-center gap-3 mt-4 md:hidden">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              aria-label="Previous event"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-sm border transition-all",
                currentIndex === 0
                  ? "border-foreground/8 text-foreground/18 cursor-not-allowed"
                  : "border-primary/30 text-primary hover:bg-primary/10",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-[10px] text-foreground/35">
              {currentIndex + 1} / {events.length}
            </span>
            <button
              onClick={nextSlide}
              disabled={currentIndex === events.length - 1}
              aria-label="Next event"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-sm border transition-all",
                currentIndex === events.length - 1
                  ? "border-foreground/8 text-foreground/18 cursor-not-allowed"
                  : "border-primary/30 text-primary hover:bg-primary/10",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Era Navigator ─────────────────────────────────── */}
        <div className="relative z-10 mt-4">
          <EraNavigator
            currentIndex={currentIndex}
            onGoTo={goToSlide}
            eras={eras}
            events={events}
            locale={locale}
          />
        </div>

        {/* bottom spacing */}
        <div className="pb-14" />
      </div>
    </main>
  );
}
