---
name: next-intl-request-locale
description: Ensures setRequestLocale is called in every async Server Component (page and layout) under [locale] so next-intl server APIs work correctly. Use when creating a new page, layout, or any async server component under src/app/[locale]/.
---

# next-intl — `setRequestLocale` in Every Server Component

## Rule

`setRequestLocale(locale)` must be called in **every** async Server Component (page and layout) that lives under `src/app/[locale]/`. The parent layout's call does **not** propagate to child pages or nested layouts — each component is rendered independently by Next.js.

**Do NOT call it** in `"use client"` components — it is a server-only API and will throw.

---

## Pattern

```tsx
import { setRequestLocale } from "next-intl/server";

export default async function MyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale); // ← call before any await or return

  // ... rest of the component
}
```

The same applies to nested layouts:

```tsx
import { setRequestLocale } from "next-intl/server";

export default async function MyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <div>{children}</div>;
}
```

---

## Checklist for new pages / layouts under `[locale]`

- [ ] Is the component a **Server Component** (no `"use client"` at the top)?
  - Yes → add `params: Promise<{ locale: string }>`, destructure locale, call `setRequestLocale(locale)`
  - No (`"use client"`) → skip; `setRequestLocale` cannot be used in client components
- [ ] Import from `"next-intl/server"` — **not** from `"next-intl"`
- [ ] Call `setRequestLocale` **before** any `await` that uses next-intl (e.g. `getTranslations`, `getFormatter`)

---

## Files currently following this pattern

| File                                             | Notes                   |
| ------------------------------------------------ | ----------------------- |
| `src/app/[locale]/layout.tsx`                    | Root locale layout      |
| `src/app/[locale]/admin/layout.tsx`              | Admin nested layout     |
| `src/app/[locale]/admin/timeline/eras/page.tsx`  | Admin eras page         |
| `src/app/[locale]/login/page.tsx`                | Login page              |
| `src/app/[locale]/timeline/page.tsx`             | Timeline page           |
| `src/app/[locale]/components/layout.tsx`         | Components layout       |
| `src/app/[locale]/templates/(picker)/layout.tsx` | Templates picker layout |

Client-only pages that correctly skip it: `[locale]/page.tsx`, `[locale]/components/page.tsx`, all `templates/(fullscreen)/` pages.
