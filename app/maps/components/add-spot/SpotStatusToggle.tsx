"use client";

import { SPOT_STATUS_OPTIONS, type SpotStatus } from "@/lib/photo-spots";
import { Input, SegmentedControl } from "@mantine/core";

type SpotStatusToggleProps = {
  value: SpotStatus;
  onChange: (value: SpotStatus) => void;
};

export function SpotStatusToggle({ value, onChange }: SpotStatusToggleProps) {
  return (
    <Input.Wrapper size="md" label="Status">
      <SegmentedControl<SpotStatus>
        size="md"
        fullWidth
        radius="xl"
        color="yellow"
        autoContrast
        data={[...SPOT_STATUS_OPTIONS]}
        value={value}
        onChange={onChange}
        aria-label="Status"
      />
    </Input.Wrapper>
  );
}
