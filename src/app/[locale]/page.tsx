"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { themes, useTheme } from "@/components/theme";
import {
  Reticle,
  GridScanOverlay,
  Radar,
  UplinkHeader,
} from "@/components/thegridcn";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  ThemeDossierSelector,
  StatusStrip,
  DerezCountdown,
  DossierCard,
  GridMap,
} from "@/components/website";
import { TronHeader, TheGridcnLogo } from "@/components/layout";

// Dynamic import for Three.js components (client-side only)
const Grid3D = dynamic(
  () => import("@/components/thegridcn/grid").then((mod) => mod.Grid3D),
  { ssr: false },
);

// Map for O(1) theme lookups
const themeById = new Map(themes.map((t) => [t.id, t]));

// Static props extracted to avoid re-creation on every render
const RADAR_TARGETS = [
  { x: 30, y: 35 },
  { x: 70, y: 60 },
];

const STATUS_STRIP_FEATURES = [
  { label: "SECTION", value: "CAPABILITIES", highlighted: true },
  { label: "MODULES", value: "6 ACTIVE" },
  { label: "INTEGRITY", value: "100%" },
];

const STATUS_STRIP_ARCHITECTURE = [
  { label: "SECTION", value: "ARCHITECTURE", highlighted: true },
  { label: "FRAMEWORKS", value: "6 INTEGRATED" },
  { label: "BUILD", value: "OPTIMIZED" },
];

const STATUS_STRIP_FAQ = [
  { label: "SECTION", value: "INTEL", highlighted: true },
  { label: "QUERIES", value: "8 INDEXED" },
  { label: "STATUS", value: "DECLASSIFIED" },
];

// Feature card component
function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded border border-border/50 bg-card/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-card/50">
      {/* Corner decorations */}
      <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-primary/40 transition-colors group-hover:border-primary" />
      <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-primary/40 transition-colors group-hover:border-primary" />
      <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-primary/40 transition-colors group-hover:border-primary" />
      <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-primary/40 transition-colors group-hover:border-primary" />

      {/* Hover glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 font-display text-sm font-bold tracking-wider text-foreground">
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-foreground/80">
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { theme } = useTheme();
  const currentTheme = themeById.get(theme);

  return (
    <div className="relative min-h-screen bg-background">
      {/* 3D Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grid3D
          className="h-full w-full"
          enableParticles
          enableBeams
          cameraAnimation
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
      </div>

      {/* Header */}
      <TronHeader />

      {/* Main content */}
      <main className="relative z-10">
        {/* Hero section */}
        <section className="relative flex min-h-[calc(100vh-65px)] flex-col overflow-hidden">
          {/* Grid map overlay */}
          <GridMap />
          <GridScanOverlay />

          {/* Uplink header bar - project info */}
          <UplinkHeader
            leftText={`THEME: ${currentTheme?.name.toUpperCase() || "ARES"} - ${currentTheme?.god.toUpperCase() || "GOD OF WAR"}`}
            rightText="COMPONENTS: 50+ MODULES • THEMES: 6 VARIANTS • STATUS: ACTIVE"
          />

          {/* HUD corner frames */}
          <div className="pointer-events-none absolute left-4 right-4 top-10 bottom-4 z-20 hidden lg:block">
            <div className="absolute left-0 top-0 h-24 w-24 border-l-2 border-t-2 border-primary/50" />
            <div className="absolute right-0 top-0 h-24 w-24 border-r-2 border-t-2 border-primary/50" />
            <div className="absolute bottom-0 left-0 h-24 w-24 border-b-2 border-l-2 border-primary/50" />
            <div className="absolute bottom-0 right-0 h-24 w-24 border-b-2 border-r-2 border-primary/50" />
          </div>

          {/* Main hero content */}
          <div className="container relative mx-auto flex flex-1 flex-col justify-center px-4 py-12 md:py-20">
            {/* Central content with HUD frame */}
            <div className="relative mx-auto max-w-4xl">
              {/* Outer scanning frame */}
              <div className="absolute -inset-4 md:-inset-8">
                <div className="absolute inset-0 border border-primary/20" />
                <div className="absolute -left-1 -top-1 h-10 w-10 border-l-2 border-t-2 border-primary" />
                <div className="absolute -right-1 -top-1 h-10 w-10 border-r-2 border-t-2 border-primary" />
                <div className="absolute -bottom-1 -left-1 h-10 w-10 border-b-2 border-l-2 border-primary" />
                <div className="absolute -bottom-1 -right-1 h-10 w-10 border-b-2 border-r-2 border-primary" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-4 font-mono text-[10px] tracking-[0.5em] text-primary">
                  [ TARGET ACQUIRED ]
                </div>
              </div>

              {/* Scanning reticle */}
              <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-20">
                <Reticle size={500} variant="scanning" />
              </div>

              {/* Title content */}
              <div className="relative z-10 py-12 text-center md:py-16">
                <div className="mb-3 font-mono text-[10px] tracking-[0.5em] text-foreground/80">
                  CLASSIFIED PROJECT
                </div>
                <h1 className="font-display text-6xl font-black tracking-[0.15em] text-primary md:text-8xl lg:text-[9rem] [text-shadow:0_0_80px_oklch(from_var(--primary)_l_c_h/0.5),0_0_160px_oklch(from_var(--primary)_l_c_h/0.3)]">
                  SC TIMELINE
                </h1>
                <div className="mt-4 font-mono text-sm tracking-[0.4em] text-primary md:text-base">
                  LORE EVENTS FOR THE STAR CITIZEN GAME
                </div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-foreground/80">
              An authentic <span className="text-primary">Tron: Ares</span>{" "}
              inspired theme featuring Greek god color schemes, movie UI
              components, and immersive 3D effects.
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/timeline"
                className="group relative overflow-hidden rounded border-2 border-primary bg-primary/20 px-10 py-4 font-mono text-sm font-bold tracking-wider text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_40px_var(--primary)]"
              >
                <span className="relative z-10">LEARN THE HISTORY</span>
                <div className="absolute inset-0 -z-10 translate-y-full bg-primary transition-transform group-hover:translate-y-0" />
              </Link>
            </div>

            {/* Side panels - Dossier card style (left) */}
            <div className="pointer-events-none absolute left-0 top-1/3 hidden xl:block">
              <DossierCard
                category="RECORDED SUBJECT"
                name={currentTheme?.name.toUpperCase() || "ARES"}
                fields={[
                  {
                    label: "DEITY",
                    value: currentTheme?.god.toUpperCase() || "GOD OF WAR",
                  },
                  {
                    label: "PRIMARY COLOR",
                    value: currentTheme?.color || "#FF3333",
                    highlighted: true,
                  },
                  { label: "STATUS", value: "ACTIVE" },
                  { label: "COMPONENTS", value: "50+ LOADED" },
                ]}
                className="w-64"
              />
            </div>

            {/* Side panel - De-resolution timer and radar (right) */}
            <div className="pointer-events-none absolute right-0 top-1/3 hidden flex-col items-end gap-4 xl:flex">
              <DerezCountdown time="16:48" milliseconds="50" />
              <div className="rounded border border-primary/30 bg-background/80 p-4 backdrop-blur-md">
                <div className="mb-2 font-mono text-[9px] tracking-widest text-foreground/80">
                  PROXIMITY SCAN
                </div>
                <Radar size={140} targets={RADAR_TARGETS} />
              </div>
            </div>
          </div>

          {/* Bottom scroll indicator */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex items-center justify-center gap-8 py-3">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary/50" />
              <div className="animate-bounce font-mono text-[9px] tracking-widest text-foreground/80">
                ↓ SCROLL ↓
              </div>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
          </div>
        </section>

        {/* Theme Selector */}
        <div id="themes">
          <ThemeDossierSelector />
        </div>

        {/* Features Section */}
        <section
          id="features"
          className="relative border-t border-primary/20 py-24"
        >
          {/* Section background */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
          <GridScanOverlay />

          {/* Status bar */}
          <StatusStrip variant="default" items={STATUS_STRIP_FEATURES} />

          <div className="container relative mx-auto px-4 pt-8">
            {/* Section header */}
            <div className="mb-16 text-center">
              <div className="mb-4 font-mono text-[10px] tracking-widest text-foreground/80">
                [ SYSTEM CAPABILITIES ]
              </div>
              <h2 className="font-display text-3xl font-bold tracking-wider text-primary md:text-4xl lg:text-5xl [text-shadow:0_0_40px_oklch(from_var(--primary)_l_c_h/0.4)]">
                CORE FEATURES
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-foreground/80">
                Everything you need to build authentic Tron-inspired interfaces
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="6 THEME VARIANTS"
                description="Greek god-inspired color schemes: Ares, Tron, Clu, Athena, Aphrodite, and Poseidon."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                }
              />
              <FeatureCard
                title="50+ COMPONENTS"
                description="Complete shadcn/ui library with authentic Tron styling and glow effects."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                }
              />
              <FeatureCard
                title="MOVIE UI ELEMENTS"
                description="Data cards, HUD elements, timers, alerts, and radar components from the film."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
              <FeatureCard
                title="THREE.JS EFFECTS"
                description="Immersive 3D grid, particles, and light beams that react to your theme."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                    />
                  </svg>
                }
              />
              <FeatureCard
                title="GLOW UTILITIES"
                description="CSS utilities for neon glows, scanlines, and pulsing animations."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                }
              />
              <FeatureCard
                title="TYPESCRIPT"
                description="Full type safety with comprehensive TypeScript definitions."
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="relative border-t border-primary/20 py-24">
          {/* Status bar */}
          <StatusStrip variant="default" items={STATUS_STRIP_ARCHITECTURE} />

          <div className="container mx-auto px-4 pt-8">
            <div className="mb-12 text-center">
              <div className="mb-4 font-mono text-[10px] tracking-widest text-foreground/80">
                [ SYSTEM ARCHITECTURE ]
              </div>
              <h2 className="font-display text-3xl font-bold tracking-wider text-primary md:text-4xl lg:text-5xl [text-shadow:0_0_40px_oklch(from_var(--primary)_l_c_h/0.4)]">
                TECH STACK
              </h2>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {[
                  { name: "React", status: "UI" },
                  { name: "Tailwind", status: "STYLE" },
                  { name: "shadcn/ui", status: "COMPONENTS" },
                  { name: "Three.js", status: "3D" },
                  { name: "TypeScript", status: "TYPES" },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="group relative overflow-hidden border border-border/50 bg-card/30 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/50"
                  >
                    {/* Corner decorations */}
                    <div className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-primary/40 transition-colors group-hover:border-primary" />
                    <div className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-primary/40 transition-colors group-hover:border-primary" />

                    <div className="text-center">
                      <div className="font-mono text-[8px] tracking-widest text-foreground/80">
                        {tech.status}
                      </div>
                      <div className="font-display text-sm font-bold tracking-wider text-primary">
                        {tech.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative border-t border-primary/20 py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

          <StatusStrip variant="default" items={STATUS_STRIP_FAQ} />

          <div className="container relative mx-auto px-4 pt-8">
            <div className="mb-16 text-center">
              <div className="mb-4 font-mono text-[10px] tracking-widest text-foreground/80">
                [ KNOWLEDGE BASE ]
              </div>
              <h2 className="font-display text-3xl font-bold tracking-wider text-primary md:text-4xl lg:text-5xl [text-shadow:0_0_40px_oklch(from_var(--primary)_l_c_h/0.4)]">
                FREQUENTLY ASKED
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-foreground/80">
                Common questions about SC Timeline component library
              </p>
            </div>

            <div className="relative mx-auto max-w-3xl overflow-hidden border border-primary/30 bg-panel">
              {/* Corner brackets */}
              <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-primary" />
              <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-primary" />
              <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-primary" />
              <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-primary" />

              {/* Scanline effect */}
              <div className="crt-scanlines pointer-events-none absolute inset-0 opacity-[0.03]" />

              {/* Header bar */}
              <div className="relative border-b border-primary/30 bg-primary/5 px-4 py-2">
                <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 animate-pulse bg-primary" />
                      <div className="h-1.5 w-3 bg-primary/60" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      FAQ-DATABASE.SYS
                    </span>
                  </div>
                  <div className="font-mono text-[9px] tracking-wider">
                    <span className="text-foreground/50">RECORDS:8</span>
                    <span className="ml-3 text-primary">[ ONLINE ]</span>
                  </div>
                </div>
              </div>

              {/* FAQ Content */}
              <div className="relative p-4 md:p-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is" className="border-primary/20">
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      What is SC Timeline?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      SC Timeline is a Tron-inspired theme and component library
                      built on top of shadcn/ui. It provides 50+ pre-styled
                      components, 6 Greek god color themes, 3D effects powered
                      by Three.js, and HUD-style UI elements — all designed to
                      create immersive, futuristic interfaces with minimal
                      setup.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="install" className="border-primary/20">
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      How do I install SC Timeline components?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      You can install components using the shadcn CLI. Run{" "}
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        pnpm dlx shadcn@latest add @thegridcn/[component]
                      </code>{" "}
                      to add individual components, or use{" "}
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        pnpm dlx shadcn@latest list @thegridcn
                      </code>{" "}
                      to browse all available components. Works with npm, yarn,
                      and bun too.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="shadcn" className="border-primary/20">
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      Do I need shadcn/ui already set up?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      Yes. SC Timeline extends shadcn/ui, so you need a project
                      with shadcn/ui initialized. If you don&apos;t have it yet,
                      run{" "}
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        pnpm dlx shadcn@latest init
                      </code>{" "}
                      first. SC Timeline components will then integrate
                      seamlessly with your existing shadcn/ui setup and Tailwind
                      CSS configuration.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="themes" className="border-primary/20">
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      What themes are available?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      Six Greek god-inspired themes:{" "}
                      <strong className="text-foreground">Ares</strong> (red),{" "}
                      <strong className="text-foreground">Tron</strong> (cyan),{" "}
                      <strong className="text-foreground">Clu</strong> (orange),{" "}
                      <strong className="text-foreground">Athena</strong>{" "}
                      (gold),{" "}
                      <strong className="text-foreground">Aphrodite</strong>{" "}
                      (pink), and{" "}
                      <strong className="text-foreground">Poseidon</strong>{" "}
                      (blue). Each theme uses oklch() color space for precise
                      color control and includes matching glow effects, borders,
                      and background tones.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="customize"
                    className="border-primary/20"
                  >
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      Can I customize the themes or create my own?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      Absolutely. Themes are defined as CSS variables using the
                      oklch() color space, applied via a{" "}
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        data-theme
                      </code>{" "}
                      attribute. You can override any variable in your own CSS
                      or create entirely new themes by defining a new set of
                      color tokens following the same pattern.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="3d" className="border-primary/20">
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      Do the 3D components affect performance?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      The 3D components (Grid3D, Tunnel, GodAvatar) use Three.js
                      and are dynamically imported with{" "}
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        ssr: false
                      </code>{" "}
                      so they don&apos;t impact server-side rendering or initial
                      bundle size. They only load on the client when needed. You
                      can also use the intensity system to control the level of
                      visual effects.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="frameworks"
                    className="border-primary/20"
                  >
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      Does it work with frameworks other than Next.js?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      SC Timeline components work with any React framework that
                      supports shadcn/ui — including Next.js, Vite, Remix, and
                      Astro. Since they&apos;re installed directly into your
                      project as source code (not a dependency), you have full
                      control and can adapt them to your stack.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="free" className="border-primary/20">
                    <AccordionTrigger className="font-display text-sm tracking-wider text-foreground hover:text-primary hover:no-underline">
                      Is SC Timeline free to use?
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/80">
                      Yes, SC Timeline is completely free and open source. You
                      can use it in personal and commercial projects. Components
                      are added to your codebase as source files, giving you
                      full ownership and the freedom to modify anything.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative border-t border-primary/20 py-24">
          <GridScanOverlay />

          <div className="container relative mx-auto px-4 text-center">
            {/* Terminal-style CTA box */}
            <div className="relative mx-auto max-w-2xl overflow-hidden border border-primary/30 bg-panel">
              {/* Corner brackets - Tron style */}
              <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-primary" />
              <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-primary" />
              <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-primary" />
              <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-primary" />

              {/* Scanline effect */}
              <div className="crt-scanlines pointer-events-none absolute inset-0 opacity-[0.03]" />

              {/* Header bar */}
              <div className="relative border-b border-primary/30 bg-primary/5 px-4 py-2">
                <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 animate-pulse bg-primary" />
                      <div className="h-1.5 w-3 bg-primary/60" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      AWAITING USER INPUT
                    </span>
                  </div>
                  <div className="font-mono text-[9px] tracking-wider">
                    <span className="text-primary">[ READY ]</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative px-8 py-12 md:px-16">
                <h2 className="mb-6 font-display text-4xl font-bold tracking-wider text-primary md:text-5xl [text-shadow:0_0_40px_oklch(from_var(--primary)_l_c_h/0.4)]">
                  READY TO ENTER?
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-foreground/80">
                  Explore all components, customize themes, and build immersive
                  digital experiences.
                </p>
                <Link
                  href="/components"
                  className="group relative inline-flex overflow-hidden rounded border-2 border-primary bg-primary px-12 py-4 font-mono text-sm font-bold tracking-wider text-primary-foreground transition-all hover:shadow-[0_0_40px_var(--primary)]"
                >
                  <span className="relative z-10">EXPLORE COMPONENTS</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/30 bg-panel">
        {/* CRT scanline effect */}
        <div className="crt-scanlines pointer-events-none absolute inset-0 opacity-[0.03]" />
        {/* Footer uplink bar */}
        <UplinkHeader
          leftText="SYSTEM: SC TIMELINE v1.0.0"
          rightText="UPTIME: 99.9% - END OF LINE"
        />

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Logo section */}
            <div className="flex items-center gap-4">
              <TheGridcnLogo size="lg" />
              <div className="h-8 w-px bg-primary/40" />
              <div className="font-mono text-[10px]">
                <div className="tracking-widest text-foreground">
                  TRON-INSPIRED
                </div>
                <div className="tracking-wider text-primary">THEME SYSTEM</div>
              </div>
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {["React", "Tailwind", "shadcn/ui", "Three.js"].map((tech) => (
                <span
                  key={tech}
                  className="border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-[9px] tracking-wider text-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom copyright line */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
            <span className="font-mono text-[9px] tracking-widest text-foreground">
              GRID YEAR {new Date().getFullYear()} • ALL PROGRAMS RESERVED
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
          </div>
        </div>
      </footer>
    </div>
  );
}
