import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EventModel from "@/models/ScEvent";

/**
 * GET /api/timeline/events
 *
 * Supports all api-query-params filters plus:
 *   ?locale=fr           — reduce LocalizedString fields to a single locale
 *   ?eraSlug=age-of-sail — filter by era (forwarded straight to MongoDB)
 *   ?sort=order          — sort by any field
 *   ?limit=20&skip=0     — pagination (X-Total-Count / X-Has-More headers)
 */
export async function GET(req: NextRequest) {
  return EventModel.withAqp(req);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { slug, title, date, eraSlug, tags, content, significance } = body;

    if (!slug || !title || !date?.year || !eraSlug || !content) {
      return NextResponse.json(
        {
          error: "slug, title, date.year, eraSlug, and content are required",
        },
        { status: 400 },
      );
    }

    const existing = await EventModel.findOne({ slug }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "An event with this slug already exists" },
        { status: 409 },
      );
    }

    const event = await EventModel.create({
      slug,
      title,
      date,
      eraSlug,
      tags: Array.isArray(tags) ? tags : [],
      content,
      significance,
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("[timeline/events] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
