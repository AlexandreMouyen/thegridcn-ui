import mongoose, { Model } from "mongoose";
import { NextRequest } from "next/server";
import { IEra } from "@/types/timeline";
import { withAqp, AqpOptions } from "@/lib/mongoose";
interface IEraModel extends Model<IEra> {
  withAqp(req: NextRequest, options?: AqpOptions): Promise<Response>;
  withAqp(
    req: NextRequest,
    options: AqpOptions & { raw: true },
  ): Promise<[IEra[], Record<string, string>]>;
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

EraSchema.index(
  {
    slug: "text",
    "name.en": "text",
    "name.fr": "text",
    "shortName.en": "text",
    "shortName.fr": "text",
    "description.en": "text",
    "description.fr": "text",
  },
  {
    weights: {
      slug: 10,
      "name.en": 5,
      "name.fr": 5,
      "shortName.en": 4,
      "shortName.fr": 4,
      "description.en": 1,
      "description.fr": 1,
    },
  },
);

EraSchema.static("withAqp", withAqp);

export default (mongoose.models.Era as IEraModel) ||
  mongoose.model<IEra, IEraModel>("Era", EraSchema);
