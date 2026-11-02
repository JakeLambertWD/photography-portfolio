import { Title } from "@mantine/core";
import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";

// Placeholder admin area; ticket 7 guards it so only a signed-in admin can reach it.
export default function CollaboratePage() {
  return (
    <ProjectorBeamContainer>
      <Title order={1} ta="center">
        COLLABORATE
      </Title>
    </ProjectorBeamContainer>
  );
}
