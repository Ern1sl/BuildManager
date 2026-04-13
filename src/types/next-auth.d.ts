// next-auth.d.ts — Augments the built-in next-auth types
// to include id and role in the session user object.
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}
