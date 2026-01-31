import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { colors } from "../styles/theme";
import { fontFamily } from "../styles/fonts";

type AnimatedTextProps = {
  text: string;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  delay?: number;
  animation?: "slam" | "fadeUp" | "scaleIn" | "slideIn";
  isDisplay?: boolean;
  style?: React.CSSProperties;
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  fontSize = 48,
  color = colors.textPrimary,
  fontWeight = 600,
  delay = 0,
  animation = "fadeUp",
  isDisplay = false,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delayedFrame = Math.max(0, frame - delay);

  let transform = "none";
  let opacity = 1;

  switch (animation) {
    case "slam": {
      const scale = spring({
        frame: delayedFrame,
        fps,
        config: { damping: 12, stiffness: 200, mass: 0.5 },
      });
      const scaleValue = interpolate(scale, [0, 1], [2.5, 1]);
      opacity = interpolate(delayedFrame, [0, 4], [0, 1], {
        extrapolateRight: "clamp",
      });
      transform = `scale(${scaleValue})`;
      break;
    }
    case "fadeUp": {
      const progress = spring({
        frame: delayedFrame,
        fps,
        config: { damping: 200 },
      });
      const y = interpolate(progress, [0, 1], [30, 0]);
      opacity = progress;
      transform = `translateY(${y}px)`;
      break;
    }
    case "scaleIn": {
      const scale = spring({
        frame: delayedFrame,
        fps,
        config: { damping: 15, stiffness: 150 },
      });
      opacity = scale;
      transform = `scale(${scale})`;
      break;
    }
    case "slideIn": {
      const progress = spring({
        frame: delayedFrame,
        fps,
        config: { damping: 200 },
      });
      const x = interpolate(progress, [0, 1], [-80, 0]);
      opacity = progress;
      transform = `translateX(${x}px)`;
      break;
    }
  }

  return (
    <div
      style={{
        fontSize,
        color,
        fontWeight: isDisplay ? 600 : fontWeight,
        fontFamily: isDisplay ? fontFamily.display : fontFamily.body,
        opacity,
        transform,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
