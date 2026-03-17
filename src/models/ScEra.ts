import mongoose from "mongoose";
import { IEra } from "@/types/timeline";

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
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

type IEraModel = mongoose.Model<IEra>;

export default (mongoose.models.Era as IEraModel) ||
  mongoose.model<IEra>("Era", EraSchema);
