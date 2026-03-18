"use client";

import { useCallback, useState } from "react";
import { useLocale } from "next-intl";
import parse, {
  type HTMLReactParserOptions,
  Element,
  Text,
} from "html-react-parser";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { IGlossaryTerm } from "@/types/glossary";
import { cn } from "@/lib/utils";

// ── Tag colors (mirrors glossary-crud TAG_COLORS) ─────────────────────────────
const TAG_COLORS: Record<string, string> = {
  SYSTEM: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  LOCATION: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  FACTION: "border-violet-500/40 bg-violet-500/10 text-violet-400",
  PERSON: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  SPACECRAFT: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  TECHNOLOGY: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  SPECIES: "border-lime-500/40 bg-lime-500/10 text-lime-400",
  MILITARY: "border-red-500/40 bg-red-500/10 text-red-400",
  LEGISLATION: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  HISTORY: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
  ECONOMY: "border-teal-500/40 bg-teal-500/10 text-teal-400",
  CULTURE: "border-pink-500/40 bg-pink-500/10 text-pink-400",
  HUMAN: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
};

// ── Module-level cache ────────────────────────────────────────────────────────
// Shared across all GlossaryTerm instances without triggering extra renders.
const termCache = new Map<string, IGlossaryTerm | null>();
const pendingFetches = new Set<string>();

/** Call this after saving a term in the admin to drop the stale cached entry. */
export function invalidateGlossaryCache(slug: string) {
  termCache.delete(slug);
}

// ── Regex for the {glossary:slug|display} syntax ─────────────────────────────
const GLOSSARY_PATTERN = /\{glossary:([^|{}]+)\|([^{}]+)\}/g;

// ── GlossaryContent ───────────────────────────────────────────────────────────
// Parses a string containing {glossary:slug|display} tokens and renders each
// as a GlossaryTerm. The rest of the string is rendered as plain text.
// Since tooltip definitions also go through GlossaryContent, nesting is
// supported to any depth.
// ── RichContent ──────────────────────────────────────────────────────────────
// Parses an HTML string (e.g. event content with <p>, <em>, <strong>) and
// intercepts every text node to run it through GlossaryContent, so
// {glossary:slug|display} tokens anywhere in the markup get rendered as
// interactive tooltip terms.
const richContentOptions: HTMLReactParserOptions = {
  replace(node) {
    if (node instanceof Text && node.data.trim()) {
      return <GlossaryContent text={node.data} />;
    }
    if (node instanceof Element && node.children) {
      // Let html-react-parser rebuild the element normally but recurse into children
      return undefined;
    }
  },
};

export function RichContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return <div className={className}>{parse(html, richContentOptions)}</div>;
}

export function GlossaryContent({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(GLOSSARY_PATTERN.source, "g");
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const slug = match[1].trim();
    const display = match[2].trim();
    parts.push(
      <GlossaryTerm
        key={`${slug}-${match.index}`}
        slug={slug}
        display={display}
      />,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

// ── GlossaryTerm ──────────────────────────────────────────────────────────────
// Renders an inline term with a tooltip. On first open it lazily fetches the
// term definition from /api/glossary/:slug and caches it for all future hovers.
export function GlossaryTerm({
  slug,
  display,
}: {
  slug: string;
  display: string;
}) {
  const locale = useLocale();

  // Seed from module cache on mount so pre-fetched terms render immediately.
  const [termData, setTermData] = useState<IGlossaryTerm | null | undefined>(
    () => (termCache.has(slug) ? termCache.get(slug) : undefined),
  );

  const handleOpenChange = useCallback(() => {
    if (termData !== undefined || pendingFetches.has(slug)) return;

    pendingFetches.add(slug);
    fetch(`/api/glossary/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { term: IGlossaryTerm }) => {
        termCache.set(slug, data.term ?? null);
        setTermData(data.term ?? null);
      })
      .catch(() => {
        termCache.set(slug, null);
        setTermData(null);
      })
      .finally(() => pendingFetches.delete(slug));
  }, [slug, termData]);

  const resolvedTerm = termData
    ? ((termData.term as unknown as Record<string, string>)[locale] ??
      (termData.term as unknown as Record<string, string>).en)
    : null;

  const resolvedDefinition = termData
    ? ((termData.definition as unknown as Record<string, string>)[locale] ??
      (termData.definition as unknown as Record<string, string>).en)
    : null;

  return (
    <HoverCard openDelay={100} closeDelay={150}>
      <HoverCardTrigger asChild>
        <span
          className="cursor-help border-b border-dashed border-primary/60 text-primary/90 transition-colors hover:border-primary hover:text-primary"
          aria-label={`Glossary: ${display}`}
          onMouseEnter={() => handleOpenChange()}
        >
          {display}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-72 border border-primary/30 bg-card/95 p-3 text-left text-foreground backdrop-blur-sm shadow-[0_0_20px_rgba(0,0,0,0.3)]"
        sideOffset={6}
        align="start"
      >
        {termData === undefined ? (
          <span className="text-xs opacity-50">Loading…</span>
        ) : termData === null ? (
          <span className="text-xs opacity-50">{display}</span>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm leading-tight text-primary">
                {resolvedTerm}
              </p>
              {termData.tags && termData.tags.length > 0 && (
                <div className="flex flex-wrap justify-end gap-1 shrink-0">
                  {termData.tags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        "inline-flex items-center rounded border px-1 py-px font-mono text-[8px] uppercase tracking-widest",
                        TAG_COLORS[tag] ??
                          "border-primary/30 bg-primary/10 text-primary",
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs leading-relaxed text-foreground/80">
              <GlossaryContent text={resolvedDefinition ?? ""} />
            </p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
