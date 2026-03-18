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

