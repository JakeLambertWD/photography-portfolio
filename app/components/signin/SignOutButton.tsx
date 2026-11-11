"use client";

import { api } from "@/app/providers";
import { Button, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const theme = useMantineTheme();
  const router = useRouter();

  const { mutate: signOut, isPending } = api.auth.signOut.useMutation({
    // replace rather than push, so pressing Back doesn't return to the admin page.
    onSuccess: () => router.replace("/collaborate/signin"),
  });

  return (
    <Button
      variant="outline"
      loading={isPending}
      onClick={() => signOut()}
      bd={`1px solid ${theme.other!.colors!.umber}`}
      c={theme.other!.colors!.ivory}
      fz={theme.fontSizes!.sm}
    >
      Sign out
    </Button>
  );
}
