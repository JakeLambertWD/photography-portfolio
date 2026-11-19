import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    // if value gets changed (trim / toLowerCase) we use pipe to validate the final value
    .pipe(z.email({ error: "Enter a valid email address" })),
  password: z.string().min(1, { error: "Password is required" }),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
