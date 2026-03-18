"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormatter, useLocale } from "next-intl";
import useSWR from "swr";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, CalendarDays } from "lucide-react";
import {
  NumberInput,
  TextInput,
  SearchInput,
  Select,
  Modal,
  ModalButton,
} from "@/components/thegridcn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { fetcher, FetchedData } from "@/lib/fetcher";
import type {
  IEvent,
  LocalizedEvent,
  LocalizedEra,
  EventSignificance,
} from "@/types/timeline";
import { EVENT_TAGS, EVENT_SIGNIFICANCE } from "@/types/timeline";

// ── Types ────────────────────────────────────────────────────────────────────

interface EventFormData {
  slug: string;
  title_en: string;
  title_fr: string;
  content_en: string;
  content_fr: string;
  date_year: string;
  date_month: string;
  date_day: string;
  eraSlug: string;
  tags: string[];
  significance: string;
}

const EMPTY_FORM: EventFormData = {
  slug: "",
  title_en: "",
  title_fr: "",
  content_en: "",
  content_fr: "",
  date_year: "",
  date_month: "",
  date_day: "",
  eraSlug: "",
  tags: [],
  significance: EVENT_SIGNIFICANCE.STANDARD,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Safely read a locale key from a Mongoose Map (plain object after JSON serialization) */
function lget(val: unknown, locale: string): string {
  if (typeof val === "string") return val;
  if (!val || typeof val !== "object") return "";

  const localized = val as Record<string, string>;

  return localized[locale] ?? localized.en ?? Object.values(localized)[0] ?? "";
}

function eventToForm(event: IEvent): EventFormData {
  return {
    slug: event.slug,
    title_en: lget(event.title, "en"),
    title_fr: lget(event.title, "fr"),
    content_en: lget(event.content, "en"),
    content_fr: lget(event.content, "fr"),
    date_year: String(event.date.year),
    date_month: event.date.month != null ? String(event.date.month) : "",
    date_day: event.date.day != null ? String(event.date.day) : "",
    eraSlug: event.eraSlug,
    tags: event.tags ?? [],
    significance: event.significance ?? EVENT_SIGNIFICANCE.STANDARD,
  };
}

function formToPayload(form: EventFormData) {
  const title: Record<string, string> = { en: form.title_en.trim() };
  if (form.title_fr.trim()) title.fr = form.title_fr.trim();

  const content: Record<string, string> = { en: form.content_en.trim() };
  if (form.content_fr.trim()) content.fr = form.content_fr.trim();

  const date: { year: number; month?: number; day?: number } = {
    year: Number(form.date_year),
  };
  if (form.date_month.trim()) date.month = Number(form.date_month);
  if (form.date_day.trim()) date.day = Number(form.date_day);

  return {
    slug: form.slug.trim(),
    title,
    content,
    date,
    eraSlug: form.eraSlug.trim(),
    tags: form.tags,
    significance: form.significance as EventSignificance,
  };
}

function validate(form: EventFormData, isCreate: boolean): string | null {
  if (isCreate) {
    if (!form.slug.trim()) return "Slug is required";
    if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
      return "Slug must be lowercase kebab-case (a–z, 0–9, hyphens only)";
  }
  if (!form.title_en.trim()) return "Title (EN) is required";
  if (!form.content_en.trim()) return "Content (EN) is required";
  if (!form.date_year.trim() || isNaN(Number(form.date_year)))
    return "Year must be a valid number";
  if (!form.eraSlug.trim()) return "Era is required";
  return null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;

type LocaleCode = (typeof LOCALES)[number]["code"];

const SIGNIFICANCE_OPTIONS = [
  { value: EVENT_SIGNIFICANCE.STANDARD, label: "Standard" },
  { value: EVENT_SIGNIFICANCE.MAJOR, label: "Major" },
  { value: EVENT_SIGNIFICANCE.CRITICAL, label: "Critical" },
];

// ── Field components ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-primary/55 mb-2">
      {children}
    </p>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export interface EventsCrudProps {
  initialEvents?: LocalizedEvent[];
}

export function EventsCrud({ initialEvents = [] }: EventsCrudProps) {
  const format = useFormatter();
  const currentLocale = useLocale() as LocaleCode;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState("date.year");
  const [filterEra, setFilterEra] = useState("");
  const [filterSignificance, setFilterSignificance] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formLocale, setFormLocale] = useState<LocaleCode>("en");

  const isCreate = editingSlug === null;

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const apiLocale: LocaleCode = currentLocale === "fr" ? "fr" : "en";

  const eventsUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("locale", apiLocale);
    params.set("sort", sort);
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (filterEra) params.set("eraSlug", filterEra);
    return `/api/timeline/events?${params.toString()}`;
  }, [apiLocale, sort, debouncedQuery, filterEra]);

  const { data, error, isLoading, mutate } = useSWR<
    FetchedData<LocalizedEvent[]>
  >(eventsUrl, fetcher, {
    keepPreviousData: true,
    fallbackData: {
      data: initialEvents,
      totalCount: initialEvents.length,
      page: 1,
      perPage: 0,
      hasMore: false,
      headers: {},
    },
  });

  // Fetch eras for the era selector in the form
  const { data: erasData } = useSWR<FetchedData<LocalizedEra[]>>(
    "/api/timeline/eras?locale=en&sort=startYear&limit=200",
    fetcher,
  );

  const erasOptions = useMemo(
    () =>
      (erasData?.data ?? []).map((e) => ({
        value: e.slug,
        label: `${e.shortName} — ${e.slug}`,
      })),
    [erasData],
  );

  const eraFilterOptions = useMemo(
    () => [
      { value: "", label: "All Eras" },
      ...(erasData?.data ?? []).map((e) => ({
        value: e.slug,
        label: e.shortName,
      })),
    ],
    [erasData],
  );

  const events = useMemo(() => {
    const fetched = data?.data ?? [];
    if (!filterSignificance) return fetched;
    return fetched.filter((e) => e.significance === filterSignificance);
  }, [data, filterSignificance]);

  function openCreate() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setFormLocale("en");
    setFormOpen(true);
  }

  async function openEdit(slug: string) {
    try {
      const res = await fetch(`/api/timeline/events/${slug}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to load event");
      }
      const { event } = (await res.json()) as { event: IEvent };
      setEditingSlug(event.slug);
      setForm(eventToForm(event));
      setFormLocale("en");
      setFormOpen(true);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load event");
    }
  }

  function setField(key: keyof EventFormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: string) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
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
        ? "/api/timeline/events"
        : `/api/timeline/events/${editingSlug}`;
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

      const { event: saved } = (await res.json()) as { event: LocalizedEvent };
      await mutate(
        (current) => {
          const previous = current?.data ?? [];
          const next = (
            isCreate
              ? [...previous, saved]
              : previous.map((e) => (e.slug === editingSlug ? saved : e))
          ).sort((a, b) => a.date.year - b.date.year);

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
      toast.success(isCreate ? "Event created" : "Event updated");
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
      const res = await fetch(`/api/timeline/events/${slug}`, {
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
      toast.success(`Event "${slug}" deleted`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const criticalCount = events.filter(
    (e) => e.significance === EVENT_SIGNIFICANCE.CRITICAL,
  ).length;
  const erasReferenced = new Set(events.map((e) => e.eraSlug)).size;

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
                Event Management
              </h1>
              <p className="font-rajdhani text-sm text-foreground/40 mt-1">
                {format.number(events.length)} event
                {events.length !== 1 ? "s" : ""}
                {erasReferenced > 0
                  ? ` · ${format.number(erasReferenced)} era${erasReferenced !== 1 ? "s" : ""} referenced`
                  : ""}
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="font-mono text-[10px] uppercase tracking-widest shrink-0"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Events", value: format.number(events.length) },
            { label: "Critical", value: format.number(criticalCount) },
            { label: "Eras Referenced", value: format.number(erasReferenced) },
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

        {/* ── Search + filters ────────────────────────────────────────────── */}
        <div className="border border-border/35 bg-card/30 rounded-sm px-4 py-3 space-y-2">
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 mb-1">
                Search
              </p>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search slug, title, content..."
                loading={isLoading}
              />
            </div>

            <div className="md:col-span-3">
              <Select
                label="Sort"
                value={sort}
                onChange={setSort}
                options={[
                  { value: "date.year", label: "Year ↑" },
                  { value: "-date.year", label: "Year ↓" },
                  { value: "slug", label: "Slug ↑" },
                  { value: "-slug", label: "Slug ↓" },
                ]}
              />
            </div>

            <div className="md:col-span-3">
              <Select
                label="Era"
                value={filterEra}
                onChange={setFilterEra}
                options={eraFilterOptions}
              />
            </div>

            <div className="md:col-span-2">
              <Select
                label="Significance"
                value={filterSignificance}
                onChange={setFilterSignificance}
                options={[{ value: "", label: "All" }, ...SIGNIFICANCE_OPTIONS]}
              />
            </div>
          </div>

          <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/30">
            Significance filter applied client-side; era and search forwarded to
            API.
          </p>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="relative border border-border/40 bg-card/20 rounded-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              {/* Table header */}
              <div className="grid grid-cols-[3rem_1fr_1fr_7rem_7rem_8rem_6rem] gap-4 px-5 py-2.5 bg-card/60 border-b border-border/30">
                {["#", "SLUG", "TITLE", "DATE", "ERA", "SIGNIFICANCE", ""].map(
                  (h) => (
                    <span
                      key={h}
                      className="font-mono text-[9px] uppercase tracking-widest text-foreground/35"
                    >
                      {h}
                    </span>
                  ),
                )}
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-6 w-6 text-primary/40 animate-spin" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/35">
                    Loading events...
                  </p>
                </div>
              )}

              {/* Error state */}
              {!isLoading && error && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-destructive/80">
                    Failed to fetch events
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

              {/* Empty state */}
              {!isLoading && !error && events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <CalendarDays className="h-8 w-8 text-foreground/15" />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/25">
                    No events found for current search/filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCreate}
                    className="font-mono text-[10px] uppercase tracking-widest mt-1"
                  >
                    Create First Event
                  </Button>
                </div>
              )}

              {/* Rows */}
              {!isLoading &&
                !error &&
                events.map((event, i) => (
                  <div
                    key={event.slug}
                    className={cn(
                      "grid grid-cols-[3rem_1fr_1fr_7rem_7rem_8rem_6rem] gap-4 px-5 py-3 items-center",
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
                      {event.slug}
                    </span>

                    <span className="font-rajdhani text-sm text-foreground/80 truncate">
                      {lget(event.title, apiLocale)}
                    </span>

                    <span className="font-mono text-[11px] text-foreground/45 whitespace-nowrap">
                      {event.date.year}
                      {event.date.month != null
                        ? `-${String(event.date.month).padStart(2, "0")}`
                        : ""}
                      {event.date.day != null
                        ? `-${String(event.date.day).padStart(2, "0")}`
                        : ""}
                    </span>

                    <span className="font-mono text-[11px] text-foreground/45 truncate">
                      {event.eraSlug}
                    </span>

                    <span
                      className={cn(
                        "font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border w-fit",
                        event.significance === EVENT_SIGNIFICANCE.CRITICAL
                          ? "border-destructive/50 text-destructive/80 bg-destructive/10"
                          : event.significance === EVENT_SIGNIFICANCE.MAJOR
                            ? "border-primary/40 text-primary/70 bg-primary/10"
                            : "border-border/30 text-foreground/40 bg-foreground/5",
                      )}
                    >
                      {event.significance}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(event.slug)}
                        aria-label={`Edit ${event.slug}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteSlug(event.slug)}
                        aria-label={`Delete ${event.slug}`}
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

        {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
        <Modal
          open={formOpen}
          onClose={() => {
            if (!saving) setFormOpen(false);
          }}
          title={isCreate ? "Create New Event" : "Edit Event"}
          description={
            isCreate
              ? "Add a new historical event to the UEE archive"
              : `slug: ${editingSlug} — slug is immutable`
          }
          size="lg"
          className="max-w-3xl"
          footer={
            <>
              <ModalButton
                variant="default"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </ModalButton>
              <ModalButton
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {isCreate ? "Create Event" : "Save Changes"}
              </ModalButton>
            </>
          }
        >
          <div className="overflow-y-auto max-h-[60vh] space-y-5 pr-1 py-1">
            {/* Slug — create only */}
            {isCreate && (
              <TextInput
                label="Slug *"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                placeholder="rsi-founded"
                hint="Lowercase kebab-case only"
              />
            )}

            {/* Era / Significance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Era *"
                  value={form.eraSlug}
                  onChange={(v) => setField("eraSlug", v)}
                  options={
                    erasOptions.length
                      ? erasOptions
                      : [{ value: "", label: "Loading eras..." }]
                  }
                />
              </div>
              <div>
                <Select
                  label="Significance"
                  value={form.significance}
                  onChange={(v) => setField("significance", v)}
                  options={SIGNIFICANCE_OPTIONS}
                />
              </div>
            </div>

            {/* Date */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <NumberInput
                  label="Year *"
                  value={Number(form.date_year) || 2500}
                  step={1}
                  onChange={(v) => setField("date_year", String(v))}
                />
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 mb-1">
                  Month
                </p>
                {form.date_month === "" ? (
                  <button
                    type="button"
                    onClick={() => setField("date_month", "1")}
                    className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground/70 transition-colors h-9 flex items-center"
                  >
                    + Set month
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <NumberInput
                      value={Number(form.date_month)}
                      step={1}
                      min={1}
                      max={12}
                      onChange={(v) => setField("date_month", String(v))}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setField("date_month", "");
                        setField("date_day", "");
                      }}
                      className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-primary/70 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 mb-1">
                  Day
                </p>
                {form.date_month === "" ? (
                  <span className="font-mono text-[9px] text-foreground/25 h-9 flex items-center">
                    Set month first
                  </span>
                ) : form.date_day === "" ? (
                  <button
                    type="button"
                    onClick={() => setField("date_day", "1")}
                    className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-foreground/70 transition-colors h-9 flex items-center"
                  >
                    + Set day
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <NumberInput
                      value={Number(form.date_day)}
                      step={1}
                      min={1}
                      max={31}
                      onChange={(v) => setField("date_day", String(v))}
                    />
                    <button
                      type="button"
                      onClick={() => setField("date_day", "")}
                      className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 hover:text-primary/70 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-border/30" />

            {/* Tags */}
            <div>
              <FieldLabel>Tags</FieldLabel>
              <div className="grid grid-cols-3 gap-y-2.5 gap-x-3">
                {Object.values(EVENT_TAGS).map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-foreground/55 cursor-pointer select-none"
                  >
                    <Checkbox
                      checked={form.tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    {tag}
                  </label>
                ))}
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

            {/* Title */}
            <TextInput
              label={`Title ${formLocale === "en" ? "*" : `(${formLocale.toUpperCase()})`}`}
              value={form[`title_${formLocale}`]}
              onChange={(e) => setField(`title_${formLocale}`, e.target.value)}
              placeholder={
                formLocale === "en" ? "RSI is Founded" : "RSI est Fondée"
              }
            />

            {/* Content */}
            <div>
              <FieldLabel>
                Content{" "}
                {formLocale === "en" ? "*" : `(${formLocale.toUpperCase()})`}
              </FieldLabel>
              <Textarea
                value={form[`content_${formLocale}`]}
                onChange={(e) =>
                  setField(`content_${formLocale}`, e.target.value)
                }
                placeholder={
                  formLocale === "en"
                    ? "Describe this event in English..."
                    : "Décrivez cet événement en français..."
                }
                className="font-rajdhani text-sm min-h-40 resize-y"
              />
            </div>
          </div>
        </Modal>

        {/* ── Delete Confirmation ───────────────────────────────────────────── */}
        <Modal
          open={!!deleteSlug}
          onClose={() => setDeleteSlug(null)}
          title="Confirm Deletion"
          size="sm"
          footer={
            <>
              <ModalButton
                variant="default"
                onClick={() => setDeleteSlug(null)}
              >
                Cancel
              </ModalButton>
              <ModalButton variant="danger" onClick={handleDelete}>
                Delete Event
              </ModalButton>
            </>
          }
        >
          <p className="font-rajdhani text-base leading-relaxed">
            You are about to permanently delete event{" "}
            <span className="font-mono text-sm text-primary">{deleteSlug}</span>
            . This cannot be undone.
          </p>
        </Modal>
      </div>
      {/* end z-10 */}
    </div>
  );
}
