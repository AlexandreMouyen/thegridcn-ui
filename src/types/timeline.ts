import { Types } from "mongoose";

// ── Tag constants ────────────────────────────────────────────────────────────
export const EVENT_TAGS = {
  CIVILIZATION: "CIVILIZATION",
  MILITARY: "MILITARY",
  TECHNOLOGY: "TECHNOLOGY",
  POLITICAL: "POLITICAL",
  HISTORY: "HISTORY",
  EXPLORATION: "EXPLORATION",
  DIPLOMACY: "DIPLOMACY",
  CONFLICT: "CONFLICT",
  TRAGEDY: "TRAGEDY",
  ARCHEOLOGY: "ARCHEOLOGY",
  RELIGION: "RELIGION",
  CULTURE: "CULTURE",
} as const;

export type EventTag = (typeof EVENT_TAGS)[keyof typeof EVENT_TAGS];

// ── Significance constants ───────────────────────────────────────────────────
export const EVENT_SIGNIFICANCE = {
  STANDARD: "standard",
  MAJOR: "major",
  CRITICAL: "critical",
} as const;

export type EventSignificance =
  (typeof EVENT_SIGNIFICANCE)[keyof typeof EVENT_SIGNIFICANCE];

// ── Locale / i18n ─────────────────────────────────────────────────────────────
// Open-ended: any ISO 639-1 locale code works.
// Currently shipped: "en", "fr" — but the schema accepts any locale.
export type LocaleCode = string;

// A map of locale => translated string.
// Stored as a Mongoose Map<string, string> (plain object after .lean()).
export type LocalizedString = Record<LocaleCode, string>;

// ── Era ───────────────────────────────────────────────────────────────────────
export interface IEra {
  readonly _id: Types.ObjectId;
  /** Stable URL slug, e.g. "age-of-exploration". Never changes. */
  slug: string;
  name: LocalizedString;
  shortName: LocalizedString;
  startYear: number;
  endYear: number | null;
  description: LocalizedString;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * IEra with LocalizedString fields reduced to a single string.
 * This is the shape returned by withAqp when a `locale` param is passed.
 */
export type LocalizedEra = Omit<IEra, "name" | "shortName" | "description"> & {
  name: string;
  shortName: string;
  description: string;
};

// ── Event ─────────────────────────────────────────────────────────────────────
export interface IEvent {
  readonly _id: Types.ObjectId;
  /** Stable URL slug, e.g. "rsi-founded". Never changes. */
  slug: string;
  title: LocalizedString;
  date: {
    year: number;
    month?: number;
    day?: number;
  };
  /** References IEra.slug */
  eraSlug: string;
  tags: EventTag[];
  content: LocalizedString;
  significance: EventSignificance;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * IEvent with LocalizedString fields reduced to a single string.
 * This is the shape returned by withAqp when a `locale` param is passed.
 */
export type LocalizedEvent = Omit<IEvent, "title" | "content"> & {
  title: string;
  content: string;
};
