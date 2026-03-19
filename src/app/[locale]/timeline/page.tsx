import type { Metadata } from "next";

import { ScTimeline } from "./sc-timeline";
import dbConnect from "@/lib/dbConnect";
import EraModel from "@/models/ScEra";
import EventModel from "@/models/ScEvent";
import { SEED_ERAS, SEED_EVENTS } from "@/lib/timeline-seed";
import type { IEra, IEvent } from "@/types/timeline";
import { GridScanOverlay } from "@/components/website/cinematic-hud";
import { setRequestLocale } from "next-intl/server";
import { GridMap } from "@/components/website/movie-ui";
import { Grid3D } from "@/components/thegridcn/grid";

export const metadata: Metadata = {
  title: "SC Lore Timeline | The Gridcn",
  description:
    "Navigate 879 years of Star Citizen lore history — from humanity's first quantum drive in 2075 SE through the Messer Era tyranny and into the fractured modern UEE of 2954 SE.",
  openGraph: {
    title: "SC Lore Timeline | The Gridcn",
    description:
      "Navigate 879 years of Star Citizen lore — first contact, the Messer Era, and the modern UEE.",
    url: "https://thegridcn.com/timeline",
  },
};

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  await dbConnect();

  // Seed once if collections are empty
  const [eraCount, eventCount] = await Promise.all([
    EraModel.countDocuments(),
    EventModel.countDocuments(),
  ]);

  if (eraCount === 0) await EraModel.insertMany(SEED_ERAS);
  if (eventCount === 0) await EventModel.insertMany(SEED_EVENTS);

  // Fetch both collections, then sort events by era order → event order in JS
  // (avoids alphabetical-eraSlug sort producing wrong chronological sequence)
  const [eras, rawEvents] = await Promise.all([
    EraModel.find({}).sort({ startYear: 1 }).lean<IEra[]>(),
    EventModel.find({}).lean<IEvent[]>(),
  ]);

  const eraOrderMap = new Map(eras.map((era, index) => [era.slug, index]));
  const sortedEvents = [...rawEvents].sort((a, b) => {
    const eraA = eraOrderMap.get(a.eraSlug) ?? 999;
    const eraB = eraOrderMap.get(b.eraSlug) ?? 999;
    return eraA !== eraB
      ? eraA - eraB
      : (a.date.year ?? 0) - (b.date.year ?? 0);
  });

  // Serialize Mongoose lean docs: ObjectId → string, Date → ISO string
  const events: IEvent[] = JSON.parse(JSON.stringify(sortedEvents));
  const serializedEras: IEra[] = JSON.parse(JSON.stringify(eras));

  return (
    <div className="flex flex-col bg-background">
      {/* 3D grid background — fixed, same as homepage */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Grid3D className="h-full w-full" cameraAnimation />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/65" />
      </div>

      {/* Grid map overlay */}
      <GridMap />
      <GridScanOverlay />

      <ScTimeline eras={serializedEras} events={events} />
    </div>
  );
}
