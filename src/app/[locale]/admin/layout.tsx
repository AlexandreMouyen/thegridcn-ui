import { setRequestLocale } from "next-intl/server";
import { TronHeader } from "@/components/layout";

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
    <div className="flex min-h-screen flex-col bg-background">
      <TronHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
