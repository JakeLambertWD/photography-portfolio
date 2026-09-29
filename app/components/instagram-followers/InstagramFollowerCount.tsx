"use client";

import { theme } from "@/styles/theme";
import { Affix, Text } from "@mantine/core";
import { motion, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useEffect, useState } from "react";

type InstagramFollowerCountProps = {
  followers: number;
};

export function InstagramFollowerCount({ followers }: InstagramFollowerCountProps) {
  const target = useMotionValue(0);
  const animatedCount = useSpring(target, { stiffness: 30, damping: 20 });
  const [displayedCount, setDisplayedCount] = useState(0);

  useEffect(() => {
    target.set(followers);
  }, [followers, target]);

  useMotionValueEvent(animatedCount, "change", (latest) => {
    setDisplayedCount(Math.round(latest));
  });

  return (
    <Affix position={{ top: theme?.spacing?.lg, right: theme?.spacing?.lg }}>
      <Text component={motion.p} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {displayedCount.toLocaleString()} Instagram followers
      </Text>
    </Affix>
  );
}
