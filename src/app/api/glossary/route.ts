import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import GlossaryModel from "@/models/ScGlossary";

export async function GET(req: NextRequest) {
  return GlossaryModel.withAqp(req);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { slug, term, definition, category } = body;

    if (!slug || !term || !definition) {
      return NextResponse.json(
        { error: "slug, term, and definition are required" },
        { status: 400 },
      );
    }

    const existing = await GlossaryModel.findOne({ slug }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "A glossary term with this slug already exists" },
        { status: 409 },
      );
    }

    const glossaryTerm = await GlossaryModel.create({
      slug,
      term,
      definition,
      category: category || null,
    });

    return NextResponse.json({ term: glossaryTerm }, { status: 201 });
  } catch (err) {
    console.error("[glossary] POST error:", err);
    return NextResponse.json(
      { error: "Failed to create glossary term" },
      { status: 500 },
    );
  }
}
