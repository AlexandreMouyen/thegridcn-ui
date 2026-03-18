"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import { TextInput, SearchInput, Select } from "@/components/thegridcn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TagsCombobox } from "@/components/ui/tags-combobox";
import { cn } from "@/lib/utils";
import { fetcher, FetchedData } from "@/lib/fetcher";
import {
  GLOSSARY_TAGS,
  type IGlossaryTerm,
  type GlossaryTag,
} from "@/types/glossary";
import { GlossaryContent } from "@/components/ui/glossary";

// ── Tag options & colors ──────────────────────────────────────────────────────

const TAG_OPTIONS = Object.values(GLOSSARY_TAGS).map((t) => ({
  value: t,
  label: t,
}));

const TAG_COLORS: Record<keyof typeof GLOSSARY_TAGS, string> = {
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

function TagBadge({ tag }: { tag: GlossaryTag }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest",
        TAG_COLORS[tag] ?? "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {tag}
    </span>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

interface GlossaryFormData {
  slug: string;
  term_en: string;
  term_fr: string;
  definition_en: string;
  definition_fr: string;
  tags: GlossaryTag[];
}

const EMPTY_FORM: GlossaryFormData = {
  slug: "",
  term_en: "",
  term_fr: "",
  definition_en: "",
  definition_fr: "",
  tags: [],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function lget(val: unknown, locale: string): string {
  if (typeof val === "string") return val;
  if (!val || typeof val !== "object") return "";
  const localized = val as Record<string, string>;
  return localized[locale] ?? localized.en ?? Object.values(localized)[0] ?? "";
}

function termToForm(t: IGlossaryTerm): GlossaryFormData {
  return {
    slug: t.slug,
    term_en: lget(t.term, "en"),
    term_fr: lget(t.term, "fr"),
    definition_en: lget(t.definition, "en"),
    definition_fr: lget(t.definition, "fr"),
    tags: t.tags ?? [],
  };
}

function formToPayload(form: GlossaryFormData) {
  const term: Record<string, string> = { en: form.term_en.trim() };
  if (form.term_fr.trim()) term.fr = form.term_fr.trim();

  const definition: Record<string, string> = { en: form.definition_en.trim() };
  if (form.definition_fr.trim()) definition.fr = form.definition_fr.trim();

  return { slug: form.slug.trim(), term, definition, tags: form.tags };
}

function validate(form: GlossaryFormData, isCreate: boolean): string | null {
  if (isCreate) {
    if (!form.slug.trim()) return "Slug is required";
    if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
      return "Slug must be lowercase kebab-case (a–z, 0–9, hyphens only)";
  }
  if (!form.term_en.trim()) return "Term (EN) is required";
  if (!form.definition_en.trim()) return "Definition (EN) is required";
  return null;
}

// ── Locale config ────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

// ── Field helpers ─────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-primary/55 mb-2">
      {children}
    </p>
  );
}

// ── Localized term type (for the list display) ────────────────────────────────

type LocalizedGlossaryTerm = Omit<IGlossaryTerm, "term" | "definition"> & {
  term: string;
  definition: string;
};

// ── Main Component ───────────────────────────────────────────────────────────

export function GlossaryCrud() {
  const currentLocale = useLocale() as LocaleCode;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState("slug");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<GlossaryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formLocale, setFormLocale] = useState<LocaleCode>("en");
  const [previewDef, setPreviewDef] = useState(false);

  const isCreate = editingSlug === null;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const apiLocale: LocaleCode = currentLocale === "fr" ? "fr" : "en";

  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("locale", apiLocale);
    params.set("sort", sort);
    if (debouncedQuery) params.set("q", debouncedQuery);
    return `/api/glossary?${params.toString()}`;
  }, [apiLocale, sort, debouncedQuery]);

  const { data, error, isLoading, mutate } = useSWR<
    FetchedData<LocalizedGlossaryTerm[]>
  >(listUrl, fetcher, { keepPreviousData: true });

  const fetchedTerms = useMemo(() => data?.data ?? [], [data]);

  const terms = useMemo(() => {
    if (tagFilter.length === 0) return fetchedTerms;
    return fetchedTerms.filter((t) =>
      tagFilter.every((tag) => (t.tags ?? []).includes(tag as GlossaryTag)),
    );
  }, [fetchedTerms, tagFilter]);

  const usedTags = useMemo(() => {
    const set = new Set<string>();
    fetchedTerms.forEach((t) => (t.tags ?? []).forEach((tag) => set.add(tag)));
    return set.size;
  }, [fetchedTerms]);

  function openCreate() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setFormLocale("en");
    setPreviewDef(false);
    setFormOpen(true);
  }

  async function openEdit(slug: string) {
    try {
      const res = await fetch(`/api/glossary/${slug}`);
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to load term");
      }
      const { term } = (await res.json()) as { term: IGlossaryTerm };
      setEditingSlug(term.slug);
      setForm(termToForm(term));
      setFormLocale("en");
      setPreviewDef(false);
      setFormOpen(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load term");
    }
  }

  const setField = useCallback(
    <K extends keyof GlossaryFormData>(key: K, value: GlossaryFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  async function handleSave() {
    const err = validate(form, isCreate);
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const url = isCreate ? "/api/glossary" : `/api/glossary/${editingSlug}`;
      const method = isCreate ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Request failed");
      }

      await mutate();
      toast.success(
        isCreate ? "Glossary term created" : "Glossary term updated",
      );
      setFormOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const slug = deleteSlug;
    if (!slug) return;
    try {
      const res = await fetch(`/api/glossary/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Delete failed");
      }
      await mutate(
        (current) => {
          const next = (current?.data ?? []).filter((t) => t.slug !== slug);
          return current
            ? { ...current, data: next, totalCount: next.length }
            : current;
        },
        { revalidate: false },
      );
      toast.success(`Term "${slug}" deleted`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const currentDefField =
    formLocale === "fr" ? "definition_fr" : "definition_en";
  const currentTermField = formLocale === "fr" ? "term_fr" : "term_en";
  const currentDefValue = form[currentDefField];

  return (
    <div className="relative">
      <div className="relative z-10 space-y-6">
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="relative pb-5 border-b border-border/40">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/50 mb-1">
                UEE Lore Archive — Admin
              </p>
              <h1 className="font-orbitron text-2xl font-bold tracking-tight text-foreground">
                Glossary Management
              </h1>
              <p className="font-rajdhani text-sm text-foreground/40 mt-1">
                Define terms used across events. Use{" "}
                <code className="font-mono text-[10px] text-primary/70 bg-primary/10 px-1 rounded">
                  {"{glossary:slug|Display Text}"}
                </code>{" "}
                in any event content to create a hoverable link.
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="font-mono text-[10px] uppercase tracking-widest shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Term
            </Button>
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Terms",
              value: String(terms.length),
            },
            {
              label: "Tags In Use",
              value: String(usedTags),
            },
            {
              label: "Status",
              value: isLoading ? "Syncing…" : error ? "Error" : "Live",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="relative border border-border/35 bg-card/40 rounded-sm px-4 py-3 overflow-hidden"
            >
              <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-primary/40" />
              <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary/40" />
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/35 mb-1">
                {label}
              </p>
              <p className="font-orbitron text-lg font-semibold text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search + filters ─────────────────────────────────────────────── */}
        <div className="border border-border/35 bg-card/30 rounded-sm px-4 py-3 space-y-2">
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 mb-1">
                Atlas Search
              </p>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search slug, term, definition…"
                loading={isLoading}
              />
            </div>

            <div className="md:col-span-3">
              <Select
                label="Sort"
                value={sort}
                onChange={setSort}
                options={[
                  { value: "slug", label: "Slug ↑" },
                  { value: "-slug", label: "Slug ↓" },
                  { value: "term", label: "Term ↑" },
                  { value: "-term", label: "Term ↓" },
                ]}
              />
            </div>

            <div className="md:col-span-4">
              <TagsCombobox
                label="Filter by Tags"
                options={TAG_OPTIONS}
                value={tagFilter}
                onChange={setTagFilter}
                placeholder="All tags…"
              />
            </div>
          </div>

          <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/30">
            Search uses Atlas index when available, with automatic Mongo
            text-index fallback.
          </p>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="relative border border-border/40 bg-card/20 rounded-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header */}
              <div className="grid grid-cols-[3rem_1fr_1fr_12rem_6rem] gap-4 px-5 py-2.5 bg-card/60 border-b border-border/30">
                {["#", "SLUG", "TERM", "TAGS", ""].map((h) => (
                  <span
                    key={h}
                    className="font-mono text-[9px] uppercase tracking-widest text-foreground/35"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {isLoading && terms.length === 0 ? (
                <div className="flex items-center justify-center py-16 gap-2 text-foreground/30">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-mono text-xs uppercase tracking-widest">
                    Loading…
                  </span>
                </div>
              ) : terms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-foreground/30">
                  <BookOpen className="h-8 w-8 opacity-30" />
                  <span className="font-mono text-xs uppercase tracking-widest">
                    No glossary terms found
                  </span>
                </div>
              ) : (
                terms.map((t, idx) => (
                  <div
                    key={t.slug}
                    className={cn(
                      "grid grid-cols-[3rem_1fr_1fr_12rem_6rem] gap-4 px-5 py-3 border-b border-border/20 items-center",
                      "hover:bg-primary/[0.03] transition-colors",
                    )}
                  >
                    <span className="font-mono text-xs text-foreground/35">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>

                    <span className="font-mono text-xs text-primary/75 truncate">
                      {t.slug}
                    </span>

                    <div className="min-w-0">
                      <p className="font-rajdhani text-sm font-medium text-foreground truncate">
                        {t.term}
                      </p>
                      <p className="font-rajdhani text-xs text-foreground/40 truncate mt-0.5">
                        {t.definition}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(t.tags ?? []).length === 0 ? (
                        <span className="font-mono text-[10px] text-foreground/25">
                          —
                        </span>
                      ) : (
                        (t.tags ?? []).map((tag) => (
                          <TagBadge key={tag} tag={tag} />
                        ))
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(t.slug)}
                        className="p-1.5 rounded text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={`Edit ${t.slug}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteSlug(t.slug)}
                        className="p-1.5 rounded text-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Delete ${t.slug}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron tracking-widest text-sm uppercase">
              {isCreate ? "New Glossary Term" : `Edit — ${editingSlug}`}
            </DialogTitle>
            <DialogDescription className="font-rajdhani text-xs text-foreground/40">
              {isCreate
                ? "Add a new term to the lore glossary."
                : "Update an existing glossary term."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Slug (create only) */}
            {isCreate && (
              <div>
                <FieldLabel>Slug *</FieldLabel>
                <TextInput
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="hades-system"
                />
                <p className="font-mono text-[9px] text-foreground/30 mt-1">
                  Lowercase kebab-case. Used in {"{glossary:slug|Display}"}
                </p>
              </div>
            )}

            {/* Tags */}
            <div>
              <FieldLabel>Tags</FieldLabel>
              <TagsCombobox
                options={TAG_OPTIONS}
                value={form.tags}
                onChange={(tags) => setField("tags", tags as GlossaryTag[])}
                placeholder="Select tags…"
              />
            </div>

            {/* Locale tab switcher */}
            <div className="flex gap-1 border-b border-border/30 pb-0">
              {LOCALES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => setFormLocale(code)}
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border-b-2 transition-colors -mb-px",
                    formLocale === code
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground/40 hover:text-foreground/70",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Term name */}
            <div key={`term-${formLocale}`}>
              <FieldLabel>
                Term ({formLocale.toUpperCase()})
                {formLocale === "en" ? " *" : ""}
              </FieldLabel>
              <TextInput
                value={form[currentTermField]}
                onChange={(e) => setField(currentTermField, e.target.value)}
                placeholder={
                  formLocale === "en" ? "Hades System" : "Système Hadès"
                }
              />
            </div>

            {/* Definition with preview toggle */}
            <div key={`def-${formLocale}`}>
              <div className="flex items-center justify-between mb-2">
                <FieldLabel>
                  Definition ({formLocale.toUpperCase()})
                  {formLocale === "en" ? " *" : ""}
                </FieldLabel>
                <button
                  onClick={() => setPreviewDef((v) => !v)}
                  className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors"
                >
                  {previewDef ? (
                    <>
                      <EyeOff className="h-3 w-3" /> Edit
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3" /> Preview
                    </>
                  )}
                </button>
              </div>

              {previewDef ? (
                <div className="rounded border border-border/40 bg-card/40 px-3 py-2 font-rajdhani text-sm text-foreground/80 min-h-[80px]">
                  {currentDefValue ? (
                    <GlossaryContent text={currentDefValue} />
                  ) : (
                    <span className="text-foreground/30 italic">
                      No definition yet…
                    </span>
                  )}
                </div>
              ) : (
                <Textarea
                  value={currentDefValue}
                  onChange={(e) => setField(currentDefField, e.target.value)}
                  placeholder={`A star system in the Hades constellation… Use {glossary:slug|Text} to link other terms.`}
                  className="font-rajdhani text-sm min-h-[80px]"
                />
              )}
              <p className="font-mono text-[9px] text-foreground/30 mt-1">
                Supports{" "}
                <code className="text-primary/60">
                  {"{glossary:slug|Display Text}"}
                </code>{" "}
                to link nested terms.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="font-mono text-[10px] uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="font-mono text-[10px] uppercase tracking-widest"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : isCreate ? (
                "Create Term"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ──────────────────────────────────────────────── */}
      <AlertDialog
        open={deleteSlug !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteSlug(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-orbitron text-sm uppercase tracking-widest">
              Delete Term
            </AlertDialogTitle>
            <AlertDialogDescription className="font-rajdhani text-sm text-foreground/60">
              Permanently delete{" "}
              <span className="font-mono text-foreground/90">{deleteSlug}</span>
              ? Any content using{" "}
              <code className="font-mono text-xs text-primary/70">
                {`{glossary:${deleteSlug}|…}`}
              </code>{" "}
              will render as plain text.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSlug(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
                setDeleteSlug(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
