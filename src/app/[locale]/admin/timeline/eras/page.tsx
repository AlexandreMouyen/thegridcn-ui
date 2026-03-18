import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ErasCrud } from "./eras-crud";
import { GridScanOverlay } from "@/components/website/cinematic-hud";
import { GridMap } from "@/components/website/movie-ui";
import { Grid3D } from "@/components/thegridcn/grid";

export const metadata: Metadata = {
  title: "Era Management | Admin",
  robots: "noindex, nofollow",
};

export default async function ErasAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10">
      {/* 3D grid background — fixed, same as homepage */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grid3D className="h-full w-full" cameraAnimation />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/65" />
      </div>

      {/* Grid map overlay */}
      <GridMap />
      <GridScanOverlay />

      <ErasCrud />
    </main>
  );
}
