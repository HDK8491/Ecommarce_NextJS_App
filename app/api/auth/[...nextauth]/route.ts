// @ts-ignore
import NextAuth from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
export const authOptions = {
  // Configure one or more authentication providers
// add comfig

  secret: "HARDIK8491",
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

