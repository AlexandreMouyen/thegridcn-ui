import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EventModel from "@/models/ScEvent";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const event = await EventModel.findOne({ slug }).lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (err) {
    console.error("[timeline/events/[slug]] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const body = await req.json();
    const { title, date, eraSlug, tags, content, significance } = body;

    const updated = await EventModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          title,
          date,
          eraSlug,
          tags: Array.isArray(tags) ? tags : [],
          content,
          significance,
        },
      },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event: updated });
  } catch (err) {
    console.error("[timeline/events/[slug]] PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const deleted = await EventModel.findOneAndDelete({ slug }).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[timeline/events/[slug]] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
