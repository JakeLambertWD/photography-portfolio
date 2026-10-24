import { signInSchema } from "@/utils/validations-schemas/auth";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { db } from "../db";
import { publicProcedure, router } from "../trpc";

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

    // If no admin is found, there is no password hash to verify against
    const passwordMatches = admin
      ? await argon2.verify(admin.password_hash, input.password) // Verify the inputpassword against the password hash
      : false;

    // Same error for an unknown email and a wrong password, so neither is revealed.
    if (!passwordMatches) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
    }

    return { success: true };
  }),
});
