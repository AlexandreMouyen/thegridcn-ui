"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormatter, useLocale } from "next-intl";
import useSWR from "swr";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Layers } from "lucide-react";
import { NumberInput, TextInput, SearchInput } from "@/components/thegridcn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
import { cn } from "@/lib/utils";
import { fetcher, FetchedData } from "@/lib/fetcher";
import type { IEra, LocalizedEra } from "@/types/timeline";

// ── Types ────────────────────────────────────────────────────────────────────

interface EraFormData {
  slug: string;
  name_en: string;
  name_fr: string;
  shortName_en: string;
  shortName_fr: string;
  startYear: string;
  endYear: string;
  description_en: string;
  description_fr: string;
}

const EMPTY_FORM: EraFormData = {
  slug: "",
  name_en: "",
  name_fr: "",
  shortName_en: "",
  shortName_fr: "",
  startYear: "",
  endYear: "",
  description_en: "",
  description_fr: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Safely read a locale key from a Mongoose Map (plain object after JSON serialization) */
function lget(val: unknown, locale: string): string {
  if (typeof val === "string") return val;
  if (!val || typeof val !== "object") return "";

  const localized = val as Record<string, string>;

  return localized[locale] ?? localized.en ?? Object.values(localized)[0] ?? "";
}

function eraToForm(era: IEra): EraFormData {
  return {
    slug: era.slug,
    name_en: lget(era.name, "en"),
    name_fr: lget(era.name, "fr"),
    shortName_en: lget(era.shortName, "en"),
    shortName_fr: lget(era.shortName, "fr"),
    startYear: String(era.startYear),
    endYear: era.endYear != null ? String(era.endYear) : "",
    description_en: lget(era.description, "en"),
    description_fr: lget(era.description, "fr"),
  };
}

function formToPayload(form: EraFormData) {
  const name: Record<string, string> = { en: form.name_en.trim() };
  if (form.name_fr.trim()) name.fr = form.name_fr.trim();

  const shortName: Record<string, string> = { en: form.shortName_en.trim() };
  if (form.shortName_fr.trim()) shortName.fr = form.shortName_fr.trim();

  const description: Record<string, string> = {
    en: form.description_en.trim(),
  };
  if (form.description_fr.trim()) description.fr = form.description_fr.trim();

  return {
    slug: form.slug.trim(),
    name,
    shortName,
    startYear: Number(form.startYear),
    endYear: form.endYear.trim() ? Number(form.endYear) : null,
    description,
  };
}

function validate(form: EraFormData, isCreate: boolean): string | null {
  if (isCreate) {
    if (!form.slug.trim()) return "Slug is required";
    if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
      return "Slug must be lowercase kebab-case (a–z, 0–9, hyphens only)";
  }
  if (!form.name_en.trim()) return "Name (EN) is required";
  if (!form.shortName_en.trim()) return "Short name (EN) is required";
  if (!form.description_en.trim()) return "Description (EN) is required";
  if (!form.startYear.trim() || isNaN(Number(form.startYear)))
    return "Start year must be a valid number";
  if (form.endYear.trim() && isNaN(Number(form.endYear)))
    return "End year must be a valid number";
  return null;
}

// ── Locale config ────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

// ── Field components ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-primary/55 mb-2">
      {children}
    </p>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export interface ErasCrudProps {
  initialEras?: LocalizedEra[];
}

export function ErasCrud({ initialEras = [] }: ErasCrudProps) {
  const format = useFormatter();
  const currentLocale = useLocale() as LocaleCode;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [queryLocale, setQueryLocale] = useState<"auto" | LocaleCode>("auto");
  const [sort, setSort] = useState("startYear");
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [ongoingOnly, setOngoingOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<EraFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formLocale, setFormLocale] = useState<LocaleCode>("en");

  const isCreate = editingSlug === null;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const apiLocale: LocaleCode =
    queryLocale === "auto"
      ? currentLocale === "fr"
        ? "fr"
        : "en"
      : queryLocale;

  const erasUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("locale", apiLocale);
    params.set("sort", sort);
    if (debouncedQuery) params.set("q", debouncedQuery);
    return `/api/timeline/eras?${params.toString()}`;
  }, [apiLocale, sort, debouncedQuery]);

  const { data, error, isLoading, mutate } = useSWR<
    FetchedData<LocalizedEra[]>
  >(erasUrl, fetcher, {
    keepPreviousData: true,
    fallbackData: {
      data: initialEras,
      totalCount: initialEras.length,
      page: 1,
      perPage: 0,
      hasMore: false,
      headers: {},
    },
  });

  const fetchedEras = data?.data ?? [];
  const eras = useMemo(() => {
    const min = fromYear.trim() ? Number(fromYear) : null;
    const max = toYear.trim() ? Number(toYear) : null;

    return fetchedEras.filter((era) => {
      if (ongoingOnly && era.endYear !== null) return false;
      if (min !== null && era.startYear < min) return false;
      if (max !== null && era.startYear > max) return false;
      return true;
    });
  }, [fetchedEras, fromYear, toYear, ongoingOnly]);

  function openCreate() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setFormLocale("en");
    setFormOpen(true);
  }

  async function openEdit(slug: string) {
    try {
      const res = await fetch(`/api/timeline/eras/${slug}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to load era");
      }
      const { era } = (await res.json()) as { era: IEra };
      setEditingSlug(era.slug);
      setForm(eraToForm(era));
      setFormLocale("en");
      setFormOpen(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load era");
    }
  }

  function setField(key: keyof EraFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const err = validate(form, isCreate);
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      const url = isCreate
        ? "/api/timeline/eras"
        : `/api/timeline/eras/${editingSlug}`;
      const method = isCreate ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Request failed");
      }

      const { era: saved } = (await res.json()) as { era: LocalizedEra };
      await mutate(
        (current) => {
          const previous = current?.data ?? [];
          const next = (
            isCreate
              ? [...previous, saved]
              : previous.map((e) => (e.slug === editingSlug ? saved : e))
          ).sort((a, b) => a.startYear - b.startYear);

          return {
            data: next,
            totalCount: next.length,
            page: 1,
            perPage: 0,
            hasMore: false,
            headers: current?.headers ?? {},
          };
        },
        { revalidate: false },
      );
      toast.success(isCreate ? "Era created" : "Era updated");
      setFormOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    // Capture slug immediately — dialog will close via AlertDialogAction → onOpenChange
    const slug = deleteSlug;
    if (!slug) return;
    try {
      const res = await fetch(`/api/timeline/eras/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      await mutate(
        (current) => {
          const previous = current?.data ?? [];
          const next = previous.filter((e) => e.slug !== slug);
          return {
            data: next,
            totalCount: next.length,
            page: 1,
            perPage: 0,
            hasMore: false,
            headers: current?.headers ?? {},
          };
        },
        { revalidate: false },
      );
      toast.success(`Era "${slug}" deleted`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const minYear = eras.length
    ? Math.min(...eras.map((e) => e.startYear))
    : null;
  const maxYear = eras.some((e) => e.endYear == null)
    ? "Present"
    : eras.length
      ? `${format.number(Math.max(...eras.map((e) => e.endYear ?? 0)))} SE`
      : null;

  return (
    <div className="relative">
      <div className="relative z-10 space-y-6">
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="relative pb-5 border-b border-border/40">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/50 mb-1">
                UEE Historical Archive — Admin
              </p>
              <h1 className="font-orbitron text-2xl font-bold tracking-tight text-foreground">
                Era Management
              </h1>
              <p className="font-rajdhani text-sm text-foreground/40 mt-1">
                {format.number(eras.length)} era{eras.length !== 1 ? "s" : ""}
                {minYear && maxYear
                  ? ` · ${format.number(minYear)} SE – ${maxYear}`
                  : ""}
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="font-mono text-[10px] uppercase tracking-widest shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Era
            </Button>
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Eras", value: format.number(eras.length) },
            {
              label: "Start Year",
              value: minYear ? `${format.number(minYear)} SE` : "—",
            },
            { label: "End Year", value: maxYear ?? "—" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="relative border border-border/35 bg-card/40 rounded-sm px-4 py-3 overflow-hidden"
            >
              {/* corner decorations */}
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

        {/* ── Search + filters ────────────────────────────────────────────── */}
        <div className="border border-border/35 bg-card/30 rounded-sm px-4 py-3 space-y-2">
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 mb-1">
                Atlas Search
              </p>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search slug, name, short name, description..."
                loading={isLoading}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">
                Locale
              </p>
              <select
                value={queryLocale}
                onChange={(e) =>
                  setQueryLocale(e.target.value as "auto" | LocaleCode)
                }
                className="w-full rounded border border-primary/20 bg-card/60 px-3 py-2 font-mono text-xs text-foreground/80 outline-none focus:border-primary/40"
              >
                <option value="auto">
                  Auto ({currentLocale.toUpperCase()})
                </option>
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">
                Sort
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded border border-primary/20 bg-card/60 px-3 py-2 font-mono text-xs text-foreground/80 outline-none focus:border-primary/40"
              >
                <option value="startYear">Start Year ↑</option>
                <option value="-startYear">Start Year ↓</option>
                <option value="slug">Slug ↑</option>
                <option value="-slug">Slug ↓</option>
              </select>
            </div>

            <div className="md:col-span-3 grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <TextInput
                label="From Year"
                value={fromYear}
                onChange={(e) => setFromYear(e.target.value)}
                placeholder="2500"
              />
              <TextInput
                label="To Year"
                value={toYear}
                onChange={(e) => setToYear(e.target.value)}
                placeholder="3000"
              />
              <label className="h-9 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground/55">
                <Checkbox
                  checked={ongoingOnly}
                  onCheckedChange={(checked) =>
                    setOngoingOnly(checked === true)
                  }
                  className="h-3.5 w-3.5"
                />
                Ongoing
              </label>
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

          {/* Table header */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[3rem_1fr_1fr_11rem_8rem_6rem] gap-4 px-5 py-2.5 bg-card/60 border-b border-border/30">
                {["#", "SLUG", "NAME", "YEARS", "SHORT NAME", ""].map((h) => (
                  <span
                    key={h}
                    className="font-mono text-[9px] uppercase tracking-widest text-foreground/35"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Empty state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-6 w-6 text-primary/40 animate-spin" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/35">
                    Loading eras...
                  </p>
                </div>
              )}

              {!isLoading && error && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-destructive/80">
                    Failed to fetch eras
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void mutate()}
                    className="font-mono text-[10px] uppercase tracking-widest"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {!isLoading && !error && eras.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Layers className="h-8 w-8 text-foreground/15" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/25">
                    No eras found for current search/filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCreate}
                    className="font-mono text-[10px] uppercase tracking-widest mt-1"
                  >
                    Create First Era
                  </Button>
                </div>
              )}

              {/* Rows */}
              {!isLoading &&
                !error &&
                eras.map((era, i) => (
                  <div
                    key={era.slug}
                    className={cn(
                      "grid grid-cols-[3rem_1fr_1fr_11rem_8rem_6rem] gap-4 px-5 py-3 items-center",
                      "transition-colors duration-150 group",
                      "border-b border-border/15 last:border-0",
                      i % 2 !== 0 && "bg-foreground/[0.018]",
                      "hover:bg-primary/5",
                    )}
                  >
                    <span className="font-mono text-xs text-foreground/35">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>

                    <span className="font-mono text-xs text-primary/75 truncate">
                      {era.slug}
                    </span>

                    <span className="font-rajdhani text-sm text-foreground/80 truncate">
                      {lget(era.name, apiLocale)}
                    </span>

                    <span className="font-mono text-[11px] text-foreground/45 whitespace-nowrap">
                      {format.number(era.startYear)} SE
                      {era.endYear != null
                        ? ` – ${format.number(era.endYear)} SE`
                        : " – Present"}
                    </span>

                    <span className="font-mono text-[11px] text-foreground/45 truncate uppercase">
                      {lget(era.shortName, apiLocale)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(era.slug)}
                        aria-label={`Edit ${era.slug}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteSlug(era.slug)}
                        aria-label={`Delete ${era.slug}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        {/* ── Create / Edit Dialog ──────────────────────────────────────────── */}
        <Dialog
          open={formOpen}
          onOpenChange={(open) => {
            if (!saving) setFormOpen(open);
          }}
        >
          <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
            <DialogHeader className="shrink-0 pb-4 border-b border-border/30">
              <DialogTitle className="font-orbitron text-base uppercase tracking-wider">
                {isCreate ? "Create New Era" : `Edit Era`}
              </DialogTitle>
              <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                {isCreate
                  ? "Add a new historical era to the UEE archive"
                  : `slug: ${editingSlug} — slug is immutable`}
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
              {/* Slug */}
              <div>
                <TextInput
                  label={isCreate ? "Slug *" : "Slug (immutable)"}
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="age-of-exploration"
                  disabled={!isCreate}
                  hint="Lowercase kebab-case only"
                />
              </div>

              {/* Year range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <NumberInput
                    label="Start Year *"
                    value={Number(form.startYear) || 2500}
                    step={10}
                    onChange={(v) => setField("startYear", String(v))}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 mb-1">
                    End Year
                  </p>
                  {form.endYear === "" ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-primary/60 border border-primary/20 rounded px-2 py-1">
                        Ongoing
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setField(
                            "endYear",
                            String((Number(form.startYear) || 2500) + 100),
                          )
                        }
                        className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground/70 transition-colors"
                      >
                        Set year
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <NumberInput
                        value={Number(form.endYear)}
                        step={10}
                        onChange={(v) => setField("endYear", String(v))}
                      />
                      <button
                        type="button"
                        onClick={() => setField("endYear", "")}
                        className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-primary/70 transition-colors"
                      >
                        Ongoing
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-border/30" />

              {/* Locale switcher */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 mr-1">
                  Locale
                </span>
                <div className="flex rounded border border-border/40 overflow-hidden">
                  {LOCALES.map((locale) => (
                    <button
                      key={locale.code}
                      type="button"
                      onClick={() => setFormLocale(locale.code)}
                      className={cn(
                        "px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                        formLocale === locale.code
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/50 hover:text-foreground hover:bg-primary/10",
                      )}
                    >
                      {locale.label}
                    </button>
                  ))}
                </div>
                {formLocale !== "en" && (
                  <span className="font-mono text-[9px] text-foreground/30">
                    EN fields are always required
                  </span>
                )}
              </div>

              {/* Era Name */}
              <TextInput
                label={`Era Name ${formLocale === "en" ? "*" : `(${formLocale.toUpperCase()})`}`}
                value={form[`name_${formLocale}`]}
                onChange={(e) => setField(`name_${formLocale}`, e.target.value)}
                placeholder={
                  formLocale === "en"
                    ? "Age of Exploration"
                    : "Ère d'Exploration"
                }
              />

              {/* Short Name */}
              <TextInput
                label={`Short Name ${formLocale === "en" ? "*" : `(${formLocale.toUpperCase()})`}`}
                value={form[`shortName_${formLocale}`]}
                onChange={(e) =>
                  setField(`shortName_${formLocale}`, e.target.value)
                }
                placeholder="EXPLORATION"
              />

              {/* Description */}
              <div>
                <FieldLabel>
                  Description{" "}
                  {formLocale === "en" ? "*" : `(${formLocale.toUpperCase()})`}
                </FieldLabel>
                <Textarea
                  value={form[`description_${formLocale}`]}
                  onChange={(e) =>
                    setField(`description_${formLocale}`, e.target.value)
                  }
                  placeholder={
                    formLocale === "en"
                      ? "A brief description of this era in English..."
                      : "Une brève description de cette ère en français..."
                  }
                  className="font-rajdhani text-sm min-h-40 resize-y"
                />
              </div>
            </div>

            <DialogFooter className="shrink-0 pt-4 border-t border-border/30 gap-2">
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
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCreate ? "Create Era" : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirmation ───────────────────────────────────────────── */}
        <AlertDialog
          open={!!deleteSlug}
          onOpenChange={(open) => {
            if (!open) setDeleteSlug(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-orbitron text-base uppercase tracking-wider">
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="font-rajdhani text-base leading-relaxed">
                You are about to permanently delete era{" "}
                <span className="font-mono text-sm text-primary">
                  {deleteSlug}
                </span>
                . This cannot be undone. Events with this{" "}
                <span className="font-mono text-xs">eraSlug</span> will retain
                their reference but will have no matching era.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-mono text-[10px] uppercase tracking-widest">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="font-mono text-[10px] uppercase tracking-widest bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20"
              >
                Delete Era
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {/* end z-10 */}
    </div>
  );
}
