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
