import { Title } from "@mantine/core";
import { ProjectorBeamContainer } from "@/app/components/projector-beam-container/ProjectorBeamContainer";

export default function AboutPage() {
  return (
    <ProjectorBeamContainer>
      <Title order={1} ta="center">
        ABOUT
      </Title>
    </ProjectorBeamContainer>
  );
}
