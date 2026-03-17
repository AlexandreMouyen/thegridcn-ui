import { Types } from "mongoose";

export const USER_ROLES = {
  VISITOR: "VISITOR",
  USER: "USER",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type UserGender = (typeof USER_GENDERS)[keyof typeof USER_GENDERS];

export interface IUser {
  readonly _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: string[];
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
