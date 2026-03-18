import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { GlossaryCrud } from "./glossary-crud";
import { GridScanOverlay } from "@/components/website/cinematic-hud";
import { GridMap } from "@/components/website/movie-ui";
import { Grid3D } from "@/components/thegridcn/grid";

export const metadata: Metadata = {
  title: "Glossary Management | Admin",
  robots: "noindex, nofollow",
};

export default async function GlossaryAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10">
      {/* 3D grid background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grid3D className="h-full w-full" cameraAnimation />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/65" />
      </div>

      <GridMap />
      <GridScanOverlay />

      <GlossaryCrud />
    </main>
  );
}
