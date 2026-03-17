import type { Metadata } from "next";
import { TronHeader } from "@/components/layout";
import { ScTimeline } from "./sc-timeline";

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

export default function TimelinePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TronHeader />

      <ScTimeline />
    </div>
  );
}
