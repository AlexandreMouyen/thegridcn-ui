import { defineRouting } from "next-intl/routing";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/timeline": {
      en: "/timeline",
      fr: "/chronologie",
    },
    "/login": {
      en: "/login",
      fr: "/connexion",
    },
    "/admin": "/admin",
    "/admin/timeline/eras": "/admin/timeline/eras",
  },
});
