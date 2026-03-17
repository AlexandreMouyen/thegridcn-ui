import mongoose from "mongoose";
import { IEvent, EVENT_TAGS, EVENT_SIGNIFICANCE } from "@/types/timeline";

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

type IEventModel = mongoose.Model<IEvent>;

export default (mongoose.models.Event as IEventModel) ||
  mongoose.model<IEvent>("Event", EventSchema);
