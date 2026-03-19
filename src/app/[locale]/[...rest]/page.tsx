import { notFound } from "next/navigation";

// Catch-all for unmatched routes under [locale].
// Calling notFound() here causes Next.js to render [locale]/not-found.tsx
// instead of the root not-found.tsx, giving us a fully localised 404 page.
export default function CatchAll() {
  notFound();
}
