// Creates the admin login, or replaces it if one exists (the table only allows one row).
// Usage: pnpm create-admin you@example.com
// The password is typed at a hidden prompt so it never lands in shell history or the repo.
import { signInSchema } from "@/utils/validations-schemas/auth";
import argon2 from "argon2";
import { z } from "zod";
import { db } from "../server/db";

const MIN_PASSWORD_LENGTH = 12;

const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH, {
  error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
});

// Reads a line from the terminal without echoing it.
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    let input = "";
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString("utf8")) {
        if (char === "\r" || char === "\n") {
          process.stdin.off("data", onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(input);
          return;
        }
        if (char === "\u0003") process.exit(130); // Ctrl+C
        if (char === "\u007f") {
          input = input.slice(0, -1); // Backspace
        } else {
          input += char;
        }
      }
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  if (!db) throw new Error("DATABASE_URL is not configured.");
  if (!process.stdin.isTTY) throw new Error("Run this in a terminal so the password can be typed.");

  // Same normalisation as sign-in (trim + lowercase), so the stored email always matches.
  const email = signInSchema.shape.email.parse(process.argv[2]);

  const password = passwordSchema.parse(await promptHidden("Password: "));
  if ((await promptHidden("Confirm password: ")) !== password) {
    throw new Error("Passwords do not match.");
  }

  const passwordHash = await argon2.hash(password);

  await db
    .insertInto("admin_credentials")
    .values({ email, password_hash: passwordHash })
    .onConflict((conflict) =>
      conflict
        .column("singleton_key")
        .doUpdateSet({ email, password_hash: passwordHash, updated_at: new Date() }),
    )
    .execute();

  console.log(`Admin login saved for ${email}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof z.ZodError ? z.prettifyError(error) : error);
    process.exitCode = 1;
  })
  .finally(() => db?.destroy());
