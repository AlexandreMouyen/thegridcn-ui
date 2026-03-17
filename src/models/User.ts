import { IUser, USER_ROLES } from "@/types/user";
import mongoose, { Model } from "mongoose";

export const UserSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    roles: {
      type: [String],
      required: true,
      enum: Object.values(USER_ROLES),
      default: [USER_ROLES.VISITOR],
    },
    image: { type: String },
  },
  { timestamps: true },
);

type IUserModel = Model<IUser>;

export default (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser>("User", UserSchema);
