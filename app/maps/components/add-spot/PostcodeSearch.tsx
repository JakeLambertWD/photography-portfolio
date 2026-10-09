"use client";

import { lookupPostcode, type PostcodeLocation } from "@/lib/postcodes";
import { ActionIcon, TextInput, useMantineTheme } from "@mantine/core";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";

type PostcodeSearchProps = {
  onFound: (location: PostcodeLocation) => void;
};

export function PostcodeSearch({ onFound }: PostcodeSearchProps) {
  const theme = useMantineTheme();
  const [postcode, setPostcode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!postcode.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const location = await lookupPostcode(postcode);
      if (location) {
        onFound(location);
      } else {
        setError("Couldn't find that postcode");
      }
    } catch {
      setError("Postcode lookup isn't available right now");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        aria-label="Jump to a postcode"
        placeholder="Jump to a postcode, e.g. SE1 2PF"
        value={postcode}
        onChange={(event) => setPostcode(event.currentTarget.value)}
        error={error}
        autoComplete="postal-code"
        leftSection={<IconSearch size={18} />}
        rightSection={
          <ActionIcon
            type="submit"
            aria-label="Go to postcode"
            loading={isSearching}
            variant="filled"
            autoContrast
            size="lg"
          >
            <IconArrowRight size={18} />
          </ActionIcon>
        }
        rightSectionWidth={48}
        size="md"
        radius="sm"
        styles={{
          input: {
            backgroundColor: theme.colors.brown[7],
            borderColor: theme.colors.brown[4],
            color: theme.colors.brown[0],
          },
        }}
      />
    </form>
  );
}
