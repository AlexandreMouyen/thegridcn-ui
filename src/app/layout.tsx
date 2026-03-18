import type { PropsWithChildren } from "react";

// Minimal root layout required by Next.js.
// Each sub-layout ([locale], admin) provides its own <html>/<body> structure.
// See: https://next-intl.dev/docs/getting-started/app-router
export default function RootLayout({ children }: PropsWithChildren) {
  return children;
}
