import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/mongo";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  // @ts-ignore – MongoDBAdapter types lag behind next-auth beta
  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  ...authConfig,
});
