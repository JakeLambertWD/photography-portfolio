"use client";

import {
  Anchor,
  Box,
  Button,
  Center,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconLock } from "@tabler/icons-react";
import type { SignInFormValues } from "@/utils/validations-schemas/auth";

type SignInProps = {
  form: UseFormReturnType<SignInFormValues>;
  onSubmit: ReturnType<UseFormReturnType<SignInFormValues>["onSubmit"]>;
  isPending: boolean;
  errorMessage?: string;
};

export default function SignIn({ form, onSubmit, isPending, errorMessage }: SignInProps) {
  const theme = useMantineTheme();

  return (
    <Center py="xxl" px="lg">
      <Stack align="center" gap={0} w="100%" maw={380}>
        <Center
          w={52}
          h={52}
          bg={theme.other!.colors!.charcoal}
          style={{
            borderRadius: "50%",
            border: `1px solid ${theme.other!.colors!.umber}`,
          }}
          mb="lg"
        >
          <IconLock size={20} color={theme.other!.colors!.amber} stroke={1.8} />
        </Center>

        <Text fz="xs" fw={600} c={theme.other!.colors!.teal} mb="xs">
          LAMBERT.LENS — ADMIN
        </Text>

        <Title order={2} c={theme.other!.colors!.ivory} ta="center" mb="xl">
          Sign in to your dashboard
        </Title>

        <Box component="form" onSubmit={onSubmit} w="100%">
          <Stack gap="md" w="100%">
            <TextInput
              label="Email"
              placeholder="example@example.com"
              {...form.getInputProps("email")}
              styles={{
                label: {
                  fontSize: theme.fontSizes!.xxs,
                  letterSpacing: "0.08em",
                  marginBottom: theme.spacing!.sm,
                  color: theme.other!.colors!.taupe,
                },
                input: {
                  background: theme.other!.colors!.sepia,
                  border: `1px solid ${theme.other!.colors!.umber}`,
                  color: theme.other!.colors!.ivory,
                },
              }}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••••••"
              {...form.getInputProps("password")}
              styles={{
                label: {
                  fontSize: theme.fontSizes!.xxs,
                  marginBottom: theme.spacing!.sm,
                  color: theme.other!.colors!.taupe,
                },
                input: {
                  background: theme.other!.colors!.sepia,
                  border: `1px solid ${theme.other!.colors!.umber}`,
                },
              }}
            />
          </Stack>

          <Group w="100%" justify="flex-end" my={theme.spacing!.lg}>
            <Anchor size={theme.fontSizes!.xs} c={theme.other!.colors!.taupe} underline="never">
              Forgot password?
            </Anchor>
          </Group>

          <Button
            type="submit"
            loading={isPending}
            fullWidth
            bg={theme.other!.colors!.amber}
            c={theme.other!.colors!.brown}
            fw={600}
            fz={theme.fontSizes!.sm}
          >
            Sign In
          </Button>

          {errorMessage && (
            <Text fz="xs" c="var(--mantine-color-error)" ta="center" mt="sm">
              {errorMessage}
            </Text>
          )}
        </Box>

        <Divider
          label="OR"
          labelPosition="center"
          my="lg"
          color={theme.other!.colors!.umber}
          w="100%"
          styles={{
            label: { color: theme.other!.colors!.taupe, fontSize: theme.fontSizes!.xxs },
          }}
        />

        <Button
          fullWidth
          variant="outline"
          bd={`1px solid ${theme.other!.colors!.umber}`}
          c={theme.other!.colors!.ivory}
          fz={theme.fontSizes!.sm}
        >
          Email me a sign-in link instead
        </Button>

        <Text fz="xs" c={theme.other!.colors!.taupe} ta="center" mt={theme.spacing!.xl} maw={340}>
          Single owner login. This is the only account that can see brand contacts, campaign notes,
          or unreleased galleries.
        </Text>
      </Stack>
    </Center>
  );
}
