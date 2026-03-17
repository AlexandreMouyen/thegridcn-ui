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
          const [firstName, lastName] = user?.name?.split(" ") ?? [];
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
              undefined,
            roles: [USER_ROLES.USER],
          });
          await newUser.save();
        }

        return true;
      } catch (err) {
        console.error("[Auth SignIn Error]:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email }).lean<IUser>();
        if (dbUser) {
          token.roles = dbUser.roles.map(String);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.roles) {
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
