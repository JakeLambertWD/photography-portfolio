import { Text, useMantineTheme } from "@mantine/core";
import { motion, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useEffect, useState } from "react";

const AnimateHeroValue = ({ value }: { value: number }) => {
  const theme = useMantineTheme();

  // current display value
  const [displayedCount, setDisplayedCount] = useState(0);

  // target value for the spring animation
  const target = useMotionValue(0);
  // spring-animated value that follows the target
  const animatedCount = useSpring(target, { stiffness: 70, damping: 20 });

  useEffect(() => {
    target.set(value);
  }, [target, value]);

  useMotionValueEvent(animatedCount, "change", (latest) => {
    setDisplayedCount(Math.round(latest));
  });

  return (
    <Text
      component={motion.span}
      fz="2.1rem"
      ff={theme.other.fonts.display}
      fw={400}
    >
      {displayedCount.toLocaleString()}
    </Text>
  );
};

export default AnimateHeroValue;
