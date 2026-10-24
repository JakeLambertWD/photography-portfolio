"use client";

import { api } from "@/app/providers";
import { useSignInForm } from "@/hooks/signin/useSignInForm";
import SignIn from "./SignIn";

// Owns the sign-in form state and the auth.signIn mutation; SignIn only renders them.
export default function SignInContainer() {
  const form = useSignInForm();

  const {
    mutate: signIn,
    isPending,
    error,
  } = api.auth.signIn.useMutation({
    onSuccess: () => form.reset(),
  });

  // Determine the error message to display: field errors take precedence over server errors.
  const errorMessage = form.errors.email || form.errors.password || error?.message;

  return (
    <SignIn
      form={form}
      onSubmit={form.onSubmit((values) => signIn(values))}
      isPending={isPending}
      errorMessage={errorMessage}
    />
  );
}
