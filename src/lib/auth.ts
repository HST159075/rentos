import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// TODO(security): Consider adding MFA (Multi-Factor Authentication) in the future.
// TODO(security): Consider adding OAuth providers (Google, GitHub) for social login.
// TODO(security): Consider adding leaked password detection (e.g. HaveIBeenPwned API).

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Please add it to your .env file."
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "renter",
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false, // Prevent users from specifying this field during sign-up
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",

  emailAndPassword: {
    enabled: true,
    // Minimum 8 characters enforced by Better Auth
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Session expires after 7 days
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24, // Refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cookie cache
    },
  },
});

export type Auth = typeof auth;
