import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";
import SignOutButton from "@/app/components/signin/SignOutButton";
import { verifySession } from "@/server/session";
import { Stack, Title } from "@mantine/core";

// Private route
export default async function CollaboratePage() {
  // If the user is not signed in, redirect them to the /signin page
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
