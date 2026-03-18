import mongoose, { Model } from "mongoose";
import { NextRequest } from "next/server";
import { IEvent, EVENT_TAGS, EVENT_SIGNIFICANCE } from "@/types/timeline";
import { withAqp, AqpOptions } from "@/lib/mongoose";

interface IEventModel extends Model<IEvent> {
  withAqp(req: NextRequest, options?: AqpOptions): Promise<Response>;
  withAqp(
    req: NextRequest,
    options: AqpOptions & { raw: true },
  ): Promise<[IEvent[], Record<string, string>]>;
}

const LocalizedStringSchema = { type: Map, of: String, required: true };

const DateSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number },
    day: { type: Number },
  },
  { _id: false },
);

const EventSchema = new mongoose.Schema<IEvent>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: LocalizedStringSchema,
    date: { type: DateSchema, required: true },
    eraSlug: { type: String, required: true, index: true },
    tags: {
      type: [String],
      enum: Object.values(EVENT_TAGS),
      default: [],
    },
    content: LocalizedStringSchema,
    significance: {
      type: String,
      enum: Object.values(EVENT_SIGNIFICANCE),
      default: EVENT_SIGNIFICANCE.STANDARD,
    },
  },
  { timestamps: true },
);

EventSchema.index(
  {
    slug: "text",
    "title.en": "text",
    "title.fr": "text",
    "content.en": "text",
    "content.fr": "text",
  },
  {
    weights: {
      slug: 10,
      "title.en": 5,
      "title.fr": 5,
      "content.en": 2,
      "content.fr": 2,
    },
  },
);

EventSchema.static("withAqp", withAqp);

export default (mongoose.models.Event as IEventModel) ||
  mongoose.model<IEvent, IEventModel>("Event", EventSchema);
