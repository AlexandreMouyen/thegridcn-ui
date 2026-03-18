import { Types } from "mongoose";
import { LocalizedString } from "./timeline";

export const GLOSSARY_TAGS = {
  SYSTEM: "SYSTEM",
  LOCATION: "LOCATION",
  FACTION: "FACTION",
  PERSON: "PERSON",
  SPACECRAFT: "SPACECRAFT",
  TECHNOLOGY: "TECHNOLOGY",
  SPECIES: "SPECIES",
  MILITARY: "MILITARY",
  LEGISLATION: "LEGISLATION",
  HISTORY: "HISTORY",
  ECONOMY: "ECONOMY",
  CULTURE: "CULTURE",
  HUMAN: "HUMAN",
} as const;

export type GlossaryTag = (typeof GLOSSARY_TAGS)[keyof typeof GLOSSARY_TAGS];

export interface IGlossaryTerm {
  readonly _id: Types.ObjectId;
  slug: string;
  term: LocalizedString;
  definition: LocalizedString;
  tags: GlossaryTag[];
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
