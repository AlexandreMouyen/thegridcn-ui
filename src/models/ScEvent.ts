import mongoose, { Model } from "mongoose";
import { NextRequest } from "next/server";
import { IEvent, EVENT_TAGS, EVENT_SIGNIFICANCE } from "@/types/timeline";
import { withAqp, AqpOptions } from "@/lib/mongoose";

interface IEventModel extends Model<IEvent> {
  withAqp(
    req: NextRequest,
    options?: AqpOptions,
  ): ReturnType<typeof withAqp<IEvent>>;
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
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

EventSchema.static("withAqp", withAqp);

export default (mongoose.models.Event as IEventModel) ||
  mongoose.model<IEvent, IEventModel>("Event", EventSchema);
