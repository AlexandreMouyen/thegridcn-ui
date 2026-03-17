import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    roles?: string[];
    firstName?: string;
    lastName?: string;
  }
  interface Session {
    user: {
      roles?: string[];
      firstName?: string;
      lastName?: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: string[];
    firstName?: string;
    lastName?: string;
  }
}
