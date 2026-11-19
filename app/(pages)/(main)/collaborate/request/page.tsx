import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";
import SignOutButton from "@/app/components/signin/SignOutButton";
import { Title } from "@mantine/core";

// Public route
export default function CollaborationRequestPage() {
  return (
    <ProjectorBeamContainer>
      <Title order={1} ta="center">
        REQUEST A COLLABORATION
      </Title>
      <SignOutButton />
    </ProjectorBeamContainer>
  );
}
