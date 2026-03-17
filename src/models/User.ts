import { USER_ROLES } from "@/types/user";
import mongoose, { Model } from "mongoose";

export const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true },
    roles: {
      type: [String],
      required: true,
      enum: Object.values(USER_ROLES),
      default: [USER_ROLES.USER],
    },
    image: { type: String },
  },
  { timestamps: true },
);

interface IUserModel extends Model<unknown> {}

export default (mongoose.models.User as IUserModel) ||
  mongoose.model("User", UserSchema);
