import { Stack, Title } from "@mantine/core";
import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";
import SignOutButton from "@/app/components/signin/SignOutButton";
import { verifySession } from "@/server/session";

// Placeholder admin page. verifySession() redirects to sign-in unless there's a valid session.
export default async function CollaboratePage() {
  await verifySession();

  return (
    <ProjectorBeamContainer>
      <Stack align="center">
        <Title order={1} ta="center">
          COLLABORATE
        </Title>
        <SignOutButton />
      </Stack>
    </ProjectorBeamContainer>
  );
}
