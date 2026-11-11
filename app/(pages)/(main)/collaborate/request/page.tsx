import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";
import SignOutButton from "@/app/components/signin/SignOutButton";
import { Title } from "@mantine/core";

// Placeholder for the public Collaboration Request form, which has its own subticket.
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
