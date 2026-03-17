import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EraModel from "@/models/ScEra";
import EventModel from "@/models/ScEvent";
import { SEED_ERAS, SEED_EVENTS } from "@/lib/timeline-seed";

/**
 * POST /api/timeline/seed
 *
 * Seeds the database with mock timeline data, but ONLY for the collection
 * that has fewer documents than the mock data array.
 * Eras and events are upserted by their stable `eraId` / `eventId` slugs,
 * so re-running is always safe and idempotent.
 *
 * This route is intentionally unauthenticated to allow first-run seeding from
 * deploy scripts or admin tooling. Restrict it with middleware if needed.
 */
export async function POST() {
  try {
    await dbConnect();

    const [eraCount, eventCount] = await Promise.all([
      EraModel.countDocuments(),
      EventModel.countDocuments(),
    ]);

    const results = {
      eras: { skipped: false, upserted: 0 },
      events: { skipped: false, upserted: 0 },
    };

    // Only seed eras if the collection has fewer items than the mock data
    if (eraCount < SEED_ERAS.length) {
      const eraOps = SEED_ERAS.map((era) => ({
        updateOne: {
          filter: { slug: era.slug },
          update: { $set: era },
          upsert: true,
        },
      }));
      const eraResult = await EraModel.bulkWrite(eraOps);
      results.eras.upserted = eraResult.upsertedCount + eraResult.modifiedCount;
    } else {
      results.eras.skipped = true;
    }

    // Only seed events if the collection has fewer items than the mock data
    if (eventCount < SEED_EVENTS.length) {
      const eventOps = SEED_EVENTS.map((event) => ({
        updateOne: {
          filter: { slug: event.slug },
          update: { $set: event },
          upsert: true,
        },
      }));
      const eventResult = await EventModel.bulkWrite(eventOps);
      results.events.upserted =
        eventResult.upsertedCount + eventResult.modifiedCount;
    } else {
      results.events.skipped = true;
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[timeline/seed] POST error:", err);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
