import { setRequestLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  return (
    <div className="flex flex-col bg-background">
      <div className="flex-1">{children}</div>
    </div>
  );
}
