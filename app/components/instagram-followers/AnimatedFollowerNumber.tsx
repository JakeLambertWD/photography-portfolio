"use client";

import { Text } from "@mantine/core";
import { motion, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useEffect, useState } from "react";

const FONT_SIZE = "58px";

export function AnimatedFollowerNumber({ value }: { value: number }) {
  const [displayedCount, setDisplayedCount] = useState(0);

  const target = useMotionValue(0);
  const animatedCount = useSpring(target, { stiffness: 70, damping: 20 });

  useEffect(() => {
    target.set(value);
  }, [target, value]);

  useMotionValueEvent(animatedCount, "change", (latest) => {
    setDisplayedCount(Math.round(latest));
  });

  return (
    <Text fz={FONT_SIZE} component={motion.span} lh={FONT_SIZE}>
      {displayedCount.toLocaleString()}
    </Text>
  );
}
