import { signInSchema } from "@/utils/validations-schemas/auth";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { db } from "../db";
import { publicProcedure, router } from "../trpc";

// Verified against when no admin matches the email, so an unknown email takes as long
// to reject as a wrong password and response time doesn't reveal the admin's email.
const dummyPasswordHash = argon2.hash(randomUUID());

export const authRouter = router({
  signIn: publicProcedure.input(signInSchema).mutation(async ({ input }) => {
    // Check if the database connection is available before proceeding with authentication.
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection not available.",
      });
    }

    // Retrieve the admin credentials from the database based on the provided email.
    const admin = await db
      .selectFrom("admin_credentials")
      .select(["email", "password_hash"])
      .where("email", "=", input.email)
      .executeTakeFirst();

    // If no admin is found, use the dummy password hash to prevent timing attacks.
    const passwordMatches = await argon2.verify(
      admin?.password_hash ?? (await dummyPasswordHash),
      input.password,
    );

    // Same error for an unknown email and a wrong password, so neither is revealed.
    if (!admin || !passwordMatches) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    return { success: true };
  }),
});
