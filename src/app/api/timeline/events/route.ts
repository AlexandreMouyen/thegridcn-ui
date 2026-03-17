import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EventModel from "@/models/ScEvent";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const eraSlug = req.nextUrl.searchParams.get("eraSlug");
    const filter = eraSlug ? { eraSlug } : {};

    const events = await EventModel.find(filter)
      .sort({ eraSlug: 1, order: 1 })
      .lean();

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[timeline/events] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
