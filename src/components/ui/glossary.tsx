"use client";

import { useCallback, useState } from "react";
import { useLocale } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IGlossaryTerm } from "@/types/glossary";

// ── Module-level cache ────────────────────────────────────────────────────────
// Shared across all GlossaryTerm instances without triggering extra renders.
const termCache = new Map<string, IGlossaryTerm | null>();
const pendingFetches = new Set<string>();

// ── Regex for the {glossary:slug|display} syntax ─────────────────────────────
const GLOSSARY_PATTERN = /\{glossary:([^|{}]+)\|([^{}]+)\}/g;

// ── GlossaryContent ───────────────────────────────────────────────────────────
// Parses a string containing {glossary:slug|display} tokens and renders each
// as a GlossaryTerm. The rest of the string is rendered as plain text.
// Since tooltip definitions also go through GlossaryContent, nesting is
// supported to any depth.
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

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open || termData !== undefined || pendingFetches.has(slug)) return;

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
    },
    [slug, termData],
  );

  const resolvedTerm = termData
    ? ((termData.term as unknown as Record<string, string>)[locale] ??
      (termData.term as unknown as Record<string, string>).en)
    : null;

  const resolvedDefinition = termData
    ? ((termData.definition as unknown as Record<string, string>)[locale] ??
      (termData.definition as unknown as Record<string, string>).en)
    : null;

  return (
    <Tooltip onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>
        <span
          className="cursor-help border-b border-dashed border-primary/60 text-primary/90 transition-colors hover:border-primary hover:text-primary"
          aria-label={`Glossary: ${display}`}
        >
          {display}
        </span>
      </TooltipTrigger>
      <TooltipContent
        className="max-w-xs border border-primary/30 bg-card/95 p-3 text-left text-foreground backdrop-blur-sm"
        sideOffset={6}
      >
        {termData === undefined ? (
          <span className="text-xs opacity-50">Loading…</span>
        ) : termData === null ? (
          <span className="text-xs opacity-50">{display}</span>
        ) : (
          <div className="space-y-1">
            <p className="font-semibold text-sm leading-tight text-primary">
              {resolvedTerm}
            </p>
            <p className="text-xs leading-relaxed text-foreground/80">
              <GlossaryContent text={resolvedDefinition ?? ""} />
            </p>
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
