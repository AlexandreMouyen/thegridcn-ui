import { Types } from "mongoose";
import { LocalizedString } from "./timeline";

export interface IGlossaryTerm {
  readonly _id: Types.ObjectId;
  slug: string;
  term: LocalizedString;
  definition: LocalizedString;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LocalizedGlossaryTerm = Omit<
  IGlossaryTerm,
  "term" | "definition"
> & {
  term: string;
  definition: string;
};
