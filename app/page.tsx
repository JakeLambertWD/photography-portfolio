import { Button, Container, Stack, Text, Title } from "@mantine/core";

export default function Home() {
  return (
    <main>
      <Container size="sm">
        <Stack align="center" gap="md">
          <Title order={1}>Hello, world!</Title>
          <Text c="dimmed" size="lg" ta="center">
            Welcome to the photography portfolio.
          </Text>
          <Button variant="light">Explore the portfolio</Button>
        </Stack>
      </Container>
    </main>
  );
}
