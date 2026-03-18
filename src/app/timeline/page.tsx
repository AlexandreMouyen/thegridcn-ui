import type { Metadata } from "next";
import { TronHeader } from "@/components/layout";
import { ScTimeline } from "./sc-timeline";
import dbConnect from "@/lib/dbConnect";
import EraModel from "@/models/ScEra";
import EventModel from "@/models/ScEvent";
import { SEED_ERAS, SEED_EVENTS } from "@/lib/timeline-seed";
import type { IEra, IEvent } from "@/types/timeline";

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

export default async function TimelinePage() {
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
    EraModel.find({}).sort({ order: 1 }).lean<IEra[]>(),
    EventModel.find({}).lean<IEvent[]>(),
  ]);

  const eraOrderMap = new Map(eras.map((era, index) => [era.slug, index]));
  const events = [...rawEvents].sort((a, b) => {
    const eraA = eraOrderMap.get(a.eraSlug) ?? 999;
    const eraB = eraOrderMap.get(b.eraSlug) ?? 999;
    return eraA !== eraB ? eraA - eraB : (a.order ?? 0) - (b.order ?? 0);
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TronHeader />
      <ScTimeline eras={eras} events={events} />
    </div>
  );
}
