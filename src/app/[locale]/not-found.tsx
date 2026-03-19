import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 font-mono text-[10px] tracking-widest text-foreground/50">
        {t("signal")}
      </div>
      <h1 className="font-display text-6xl font-bold tracking-wider text-primary md:text-8xl [text-shadow:0_0_40px_oklch(from_var(--primary)_l_c_h/0.4)]">
        {t("title")}
      </h1>
      <p className="mt-4 font-display text-lg tracking-wider text-foreground/80">
        {t("message")}
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="border border-primary/30 bg-primary/10 px-6 py-2 font-mono text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
        >
          {t("returnHome")}
        </Link>
      </div>
    </div>
  );
}
