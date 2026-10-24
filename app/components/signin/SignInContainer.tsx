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

  return (
    <SignIn
      form={form}
      onSubmit={form.onSubmit((values) => signIn(values))}
      isPending={isPending}
      errorMessage={form.errors.email ?? form.errors.password ?? error?.message}
    />
  );
}
