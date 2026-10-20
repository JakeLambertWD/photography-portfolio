import { Title } from "@mantine/core";
import { SplitDiptychContainer } from "@/app/components/split-diptych-container/SplitDiptychContainer";

export default function PresetsPage() {
  return (
    <SplitDiptychContainer>
      <Title order={1} ta="center">
        PRESETS
      </Title>
    </SplitDiptychContainer>
  );
}
