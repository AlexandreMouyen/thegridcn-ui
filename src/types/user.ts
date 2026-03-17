import { type InferSchemaType } from "mongoose";
import { UserSchema } from "@/models/User";

export type IUser = InferSchemaType<typeof UserSchema> & { _id: string };

export const USER_ROLES = {
  VISITOR: "VISITOR",
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
