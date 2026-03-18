---
name: next-intl-formatting
description: next-intl formatting with useFormatter and useTranslations. Use whenever formatting numbers, dates, times, relative times, lists, or translated strings in ANY component — client or server. ALWAYS use useFormatter instead of raw JS Intl, toLocaleString, or hardcoded format strings.
---

# next-intl Formatting

## Rule: Always Use next-intl Hooks for Formatting

**Never** use `toLocaleString()`, `Intl.NumberFormat`, `Intl.DateTimeFormat`, or hardcoded format strings. Always use `useFormatter` (client components) or `getFormatter` (server components/actions).

---

## 1. Provider Setup

### All routes — `src/app/[locale]/layout.tsx`

All routes (including `/admin`) live under `src/app/[locale]/` so `NextIntlClientProvider` is already present via the locale layout — **no extra setup needed** in nested layouts.

**Do NOT** create routes outside `[locale]/`. If a new section is added, place it under `src/app/[locale]/` so it inherits the provider and real locale automatically.

---

## 2. Client Components — `useFormatter`

```tsx
"use client";
import { useFormatter } from "next-intl";

export function MyComponent() {
  const format = useFormatter();

  // ── Numbers ──────────────────────────────────────────────────────────
  format.number(1234567); // "1,234,567"  (en) / "1 234 567" (fr)
  format.number(0.42, { style: "percent" }); // "42%"
  format.number(9.99, { style: "currency", currency: "USD" }); // "$9.99"

  // ── Dates ────────────────────────────────────────────────────────────
  format.dateTime(new Date(), { dateStyle: "medium" }); // "Mar 18, 2026"
  format.dateTime(new Date(), { dateStyle: "long", timeStyle: "short" }); // "March 18, 2026 at 2:30 PM"
  format.dateTime(new Date(), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Relative time ─────────────────────────────────────────────────────
  format.relativeTime(-3, "days"); // "3 days ago"
  format.relativeTime(2, "hours"); // "in 2 hours"
  // Auto unit from a Date:
  format.relativeTime(new Date(Date.now() - 60_000)); // "1 minute ago"

  // ── Lists ─────────────────────────────────────────────────────────────
  format.list(["Alice", "Bob", "Charlie"]); // "Alice, Bob, and Charlie"
  format.list(["Alice", "Bob"], { type: "disjunction" }); // "Alice or Bob"
}
```

---

## 3. Server Components / Route Handlers — `getFormatter`

```tsx
import { getFormatter } from "next-intl/server";

export default async function Page() {
  const format = await getFormatter();
  const label = format.number(42000, { style: "currency", currency: "USD" });
  return <p>{label}</p>;
}
```

---

## 4. Translations — `useTranslations`

```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("MyNamespace");
  return <p>{t("greeting", { name: "Alex" })}</p>;
}
```

Message file (`messages/en.json`):

```json
{
  "MyNamespace": {
    "greeting": "Hello, {name}!"
  }
}
```

---

## 5. Common Patterns in This Codebase

### Year values (Star Citizen / UEE years)

```tsx
const format = useFormatter();

// In JSX:
{
  format.number(era.startYear);
}
SE;
{
  era.endYear != null ? ` – ${format.number(era.endYear)} SE` : " – Present";
}
```

### Counts with labels

```tsx
{format.number(items.length)} item{items.length !== 1 ? "s" : ""}
```

### Stats strips / cards

```tsx
{ label: "Total", value: format.number(count) },
{ label: "Start Year", value: `${format.number(minYear)} SE` },
```

---

## 6. Checklist

- [ ] Client component uses `useFormatter` — NOT `toLocaleString` or `Intl.*`
- [ ] Server component uses `await getFormatter()`
- [ ] Layout wrapping non-locale routes has `<NextIntlClientProvider locale="en">`
- [ ] Locale routes already have `NextIntlClientProvider` from `[locale]/layout.tsx`
- [ ] Numbers, dates, and relative times all go through `format.*`
