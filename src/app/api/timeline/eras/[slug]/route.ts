import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EraModel from "@/models/ScEra";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const era = await EraModel.findOne({ slug }).lean();
    if (!era) {
      return NextResponse.json({ error: "Era not found" }, { status: 404 });
    }
    return NextResponse.json({ era });
  } catch (err) {
    console.error("[timeline/eras/[slug]] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch era" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const body = await req.json();
    const { name, shortName, startYear, endYear, description } = body;

    if (!name?.en || !shortName?.en || !description?.en) {
      return NextResponse.json(
        { error: "English (en) name, shortName, and description are required" },
        { status: 400 },
      );
    }
    if (startYear == null) {
      return NextResponse.json(
        { error: "startYear is required" },
        { status: 400 },
      );
    }

    const era = await EraModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          name,
          shortName,
          startYear: Number(startYear),
          endYear: endYear != null && endYear !== "" ? Number(endYear) : null,
          description,
        },
      },
      { new: true },
    ).lean();

    if (!era) {
      return NextResponse.json({ error: "Era not found" }, { status: 404 });
    }
    return NextResponse.json({ era });
  } catch (err) {
    console.error("[timeline/eras/[slug]] PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update era" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const era = await EraModel.findOneAndDelete({ slug }).lean();
    if (!era) {
      return NextResponse.json({ error: "Era not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[timeline/eras/[slug]] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete era" },
      { status: 500 },
    );
  }
}
