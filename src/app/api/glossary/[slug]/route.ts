import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import GlossaryModel from "@/models/ScGlossary";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const term = await GlossaryModel.findOne({ slug }).lean();
    if (!term) {
      return NextResponse.json(
        { error: "Glossary term not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ term });
  } catch (err) {
    console.error("[glossary/[slug]] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch glossary term" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const body = await req.json();
    const { term, definition, category } = body;

    const updated = await GlossaryModel.findOneAndUpdate(
      { slug },
      { $set: { term, definition, category: category || null } },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Glossary term not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ term: updated });
  } catch (err) {
    console.error("[glossary/[slug]] PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update glossary term" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { slug } = await params;
    const deleted = await GlossaryModel.findOneAndDelete({ slug }).lean();

    if (!deleted) {
      return NextResponse.json(
        { error: "Glossary term not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[glossary/[slug]] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete glossary term" },
      { status: 500 },
    );
  }
}
