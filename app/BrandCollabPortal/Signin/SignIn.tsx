import {
  Anchor,
  Button,
  Center,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { theme } from "styles/theme";

const colors = theme.other!.colors!;

export default function Page() {
  return (
    <Center mih="100vh" bg={colors.black} py="xxxl" px="lg">
      <Stack align="center" gap={0} w="100%" maw={380}>
        <Center
          w={52}
          h={52}
          bg={colors.charcoal}
          style={{
            borderRadius: "50%",
            border: `1px solid ${colors.umber}`,
          }}
          mb="lg"
        >
          <IconLock size={20} color={colors.amber} stroke={1.8} />
        </Center>

        <Text fz="xs" fw={600} c={colors.teal} mb="xs">
          LAMBERT.LENS — ADMIN
        </Text>

        <Title order={2} c={colors.ivory} ta="center" mb="xl">
          Sign in to your dashboard
        </Title>

        <Stack gap="md" w="100%">
          <TextInput
            label="Email"
            placeholder="example@example.com"
            styles={{
              label: {
                fontSize: theme.fontSizes!.xxs,
                letterSpacing: "0.08em",
                marginBottom: theme.spacing!.sm,
                color: colors.taupe,
              },
              input: {
                background: colors.sepia,
                border: `1px solid ${colors.umber}`,
                color: colors.ivory,
              },
            }}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••••••"
            styles={{
              label: {
                fontSize: theme.fontSizes!.xxs,
                marginBottom: theme.spacing!.sm,
                color: colors.taupe,
              },
              input: {
                background: colors.sepia,
                border: `1px solid ${colors.umber}`,
              },
             
            }}
          />
        </Stack>

        <Group w="100%" justify="flex-end" my={theme.spacing!.lg}>
          <Anchor size={theme.fontSizes!.xs} c={colors.taupe} underline="never">
            Forgot password?
          </Anchor>
        </Group>

        <Button
          fullWidth
          bg={colors.amber}
          c={colors.brown}
          fw={600}
          fz={theme.fontSizes!.sm}
        >
          Sign In
        </Button>

        <Divider
          label="OR"
          labelPosition="center"
          my="lg"
          color={colors.umber}
          w="100%"
          styles={{
            label: { color: colors.taupe, fontSize: theme.fontSizes!.xxs },
          }}
        />

        <Button
          fullWidth
          variant="outline"
          bd={`1px solid ${colors.umber}`}
          c={colors.ivory}
          fz={theme.fontSizes!.sm}
        >
          Email me a sign-in link instead
        </Button>

        <Text
          fz="xs"
          c={colors.taupe}
          ta="center"
          mt={theme.spacing!.xl}
          maw={340}
        >
          Single owner login. This is the only account that can see brand
          contacts, campaign notes, or unreleased galleries.
        </Text>
      </Stack>
    </Center>
  );
}
