import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EraModel from "@/models/ScEra";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const eras = await EraModel.find({}).sort({ startYear: 1 }).lean();
    return NextResponse.json({ eras });
  } catch (err) {
    console.error("[timeline/eras] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch eras" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { slug, name, shortName, startYear, endYear, description } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "slug must be lowercase kebab-case (a-z, 0-9, hyphens)" },
        { status: 400 },
      );
    }
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

    const era = await EraModel.create({
      slug,
      name,
      shortName,
      startYear: Number(startYear),
      endYear: endYear != null && endYear !== "" ? Number(endYear) : null,
      description,
    });

    return NextResponse.json({ era }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "An era with this slug already exists" },
        { status: 409 },
      );
    }
    console.error("[timeline/eras] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create era" },
      { status: 500 },
    );
  }
}
