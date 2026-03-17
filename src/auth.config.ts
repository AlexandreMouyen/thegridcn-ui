import GitHub from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import type { NextAuthConfig } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { IUser, USER_ROLES } from "@/types/user";

export default {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({ allowDangerousEmailAccountLinking: true }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, profile }) {
      try {
        await dbConnect();

        const dbUser = await User.findOne<IUser>({ email: user.email });

        if (!dbUser) {
          const [firstName, lastName] = user?.name?.split(" ") ?? "";
          const newUser = new User({
            ...user,
            firstName:
              (profile as Record<string, unknown>)?.given_name ??
              firstName ??
              "",
            lastName:
              (profile as Record<string, unknown>)?.family_name ??
              lastName ??
              "",
            image:
              (profile as Record<string, unknown>)?.avatar_url ??
              (profile as Record<string, unknown>)?.picture ??
              (profile as Record<string, unknown>)?.image_url ??
              undefined,
            roles: [USER_ROLES.USER],
          });
          await newUser.save();
        } else if (
          !dbUser.image &&
          ((profile as Record<string, unknown>)?.avatar_url ||
            (profile as Record<string, unknown>)?.picture ||
            (profile as Record<string, unknown>)?.image_url)
        ) {
          await User.updateOne(
            { _id: dbUser._id },
            {
              $set: {
                image:
                  (profile as Record<string, unknown>)?.avatar_url ??
                  (profile as Record<string, unknown>)?.picture ??
                  (profile as Record<string, unknown>)?.image_url,
              },
            },
          );
        }

        return true;
      } catch (err) {
        console.error("[Auth SignIn Error]:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.roles = token.roles;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      return session;
    },
  },
} satisfies NextAuthConfig;
