import mongoose, { Model } from "mongoose";
import { NextRequest } from "next/server";
import { IEra } from "@/types/timeline";
import { withAqp, AqpOptions } from "@/lib/mongoose";

interface IEraModel extends Model<IEra> {
  withAqp(
    req: NextRequest,
    options?: AqpOptions,
  ): ReturnType<typeof withAqp<IEra>>;
}

// Reusable sub-schema: any locale key → string value.
// Stored as a MongoDB Map; after .lean() it returns a plain Record<string, string>.
const LocalizedStringSchema = { type: Map, of: String, required: true };

const EraSchema = new mongoose.Schema<IEra>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: LocalizedStringSchema,
    shortName: LocalizedStringSchema,
    startYear: { type: Number, required: true },
    endYear: { type: Number, default: null },
    description: LocalizedStringSchema,
  },
  { timestamps: true },
);

EraSchema.static("withAqp", withAqp);

export default (mongoose.models.Era as IEraModel) ||
  mongoose.model<IEra, IEraModel>("Era", EraSchema);
