import mongoose, { Model } from "mongoose";
import { NextRequest } from "next/server";
import { IGlossaryTerm, GLOSSARY_TAGS } from "@/types/glossary";
import { withAqp, AqpOptions } from "@/lib/mongoose";

interface IGlossaryModel extends Model<IGlossaryTerm> {
  withAqp(req: NextRequest, options?: AqpOptions): Promise<Response>;
  withAqp(
    req: NextRequest,
    options: AqpOptions & { raw: true },
  ): Promise<[IGlossaryTerm[], Record<string, string>]>;
}

const LocalizedStringSchema = { type: Map, of: String, required: true };

const GlossarySchema = new mongoose.Schema<IGlossaryTerm>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    term: LocalizedStringSchema,
    definition: LocalizedStringSchema,
    tags: {
      type: [String],
      enum: Object.values(GLOSSARY_TAGS),
      default: [],
    },
  },
  { timestamps: true },
);

GlossarySchema.index(
  {
    slug: "text",
    "term.en": "text",
    "term.fr": "text",
    "definition.en": "text",
    "definition.fr": "text",
  },
  {
    weights: {
      slug: 10,
      "term.en": 8,
      "term.fr": 8,
      "definition.en": 2,
      "definition.fr": 2,
    },
  },
);

GlossarySchema.static("withAqp", withAqp);

export default (mongoose.models.GlossaryTerm as IGlossaryModel) ||
  mongoose.model<IGlossaryTerm, IGlossaryModel>(
    "GlossaryTerm",
    GlossarySchema,
    "glossary-terms",
  );
