import { TronHeader } from "@/components/layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TronHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
