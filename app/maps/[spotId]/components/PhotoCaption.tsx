"use client";

import { api } from "@/app/providers";
import { CAN_EDIT_SPOTS } from "@/lib/photo-spots";
import { Text, Textarea, UnstyledButton } from "@mantine/core";
import { useState } from "react";

type PhotoCaptionProps = {
  spotId: string;
  photoId: string;
  photoIndex: number;
  caption: string | null;
};

export function PhotoCaption({ spotId, photoId, photoIndex, caption }: PhotoCaptionProps) {
  const utils = api.useUtils();
  const [draft, setDraft] = useState<string | null>(null);

  const updateCaption = api.spots.updatePhotoCaption.useMutation({
    onSuccess: async () => {
      await utils.spots.byId.invalidate({ id: spotId });
      setDraft(null);
    },
  });

  const label = `Note for photo ${photoIndex + 1}`;
  // The same yellow box while reading and typing, so the note doesn't shift when tapped.
  const fieldBox = {
    padding: "10px 12px",
    border: "1px solid var(--mantine-color-yellow-5)",
    borderRadius: "var(--mantine-radius-sm)",
  };
  const text = (
    <Text ff="text" fz={18} fw={500} lh={1.45} c={caption ? "brown.0" : "brown.1"}>
      {caption ?? (CAN_EDIT_SPOTS ? "Write here.." : "No note for this photo yet.")}
    </Text>
  );

  if (!CAN_EDIT_SPOTS) return <section aria-label={label}>{text}</section>;

  if (draft === null) {
    return (
      <UnstyledButton
        aria-label={`Edit ${label.toLowerCase()}`}
        onClick={() => setDraft(caption ?? "")}
        w="100%"
        ta="left"
        style={fieldBox}
      >
        {text}
      </UnstyledButton>
    );
  }

  function save() {
    if (draft === null || updateCaption.isPending) return;

    if (draft.trim() === (caption ?? "")) {
      setDraft(null);
      return;
    }

    updateCaption.mutate({ photoId, caption: draft });
  }

  return (
    <Textarea
      variant="unstyled"
      classNames={{ input: "photo-caption-input" }}
      aria-label={label}
      styles={{
        input: {
          ...fieldBox,
          // The yellow border plus Mantine's own focus ring would double up.
          outline: "none",
          display: "block",
          minHeight: 0,
          height: "auto",
          fontWeight: 500,
          lineHeight: 1.45,
          color: "var(--mantine-color-brown-0)",
        },
        error: { marginTop: 4 },
      }}
      value={draft}
      onChange={(event) => setDraft(event.currentTarget.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Escape") setDraft(null);
      }}
      error={updateCaption.error?.message}
      readOnly={updateCaption.isPending}
      autosize
      minRows={1}
      maxLength={2000}
      data-autofocus
      autoFocus
      onFocus={(event) => {
        const end = event.currentTarget.value.length;
        event.currentTarget.setSelectionRange(end, end);
      }}
    />
  );
}
