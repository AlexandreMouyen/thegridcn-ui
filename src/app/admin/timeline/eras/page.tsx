import type { Metadata } from "next";
import dbConnect from "@/lib/dbConnect";
import EraModel from "@/models/ScEra";
import type { IEra } from "@/types/timeline";
import { ErasCrud } from "./eras-crud";

export const metadata: Metadata = {
  title: "Era Management | Admin",
  robots: "noindex, nofollow",
};

export default async function ErasAdminPage() {
  await dbConnect();
  const eras = await EraModel.find({}).sort({ order: 1 }).lean<IEra[]>();
  // Serialize ObjectIds and Mongoose Maps to plain JSON for client props
  const serialized = JSON.parse(JSON.stringify(eras)) as IEra[];

  return (
    <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10">
      <ErasCrud initialEras={serialized} />
    </main>
  );
}
