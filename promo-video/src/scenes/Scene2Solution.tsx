import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { colors } from "../styles/theme";
import { AnimatedText } from "../components/AnimatedText";

export const Scene2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = fps * 2;

  // Exit animation
  const exitOpacity = interpolate(
    frame,
    [sceneDuration - fps * 0.3, sceneDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitY = interpolate(
    frame,
    [sceneDuration - fps * 0.3, sceneDuration],
    [0, -20],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Small mascot that carries over from the reveal
  const iconScale = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 180 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfaceSecondary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      {/* Small mascot icon */}
      <Sequence from={0} durationInFrames={sceneDuration} premountFor={fps} layout="none">
        <div
          style={{
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${iconScale})`,
            filter: "drop-shadow(0 0 12px rgba(230, 122, 49, 0.3))",
            opacity: exitOpacity,
          }}
        >
          <Img
            src={staticFile("mascot.png")}
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        </div>
      </Sequence>

      {/* Product Name */}
      <Sequence from={4} durationInFrames={sceneDuration - 4} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="Content Checkmate"
            fontSize={48}
            color={colors.textPrimary}
            animation="scaleIn"
            isDisplay={true}
          />
        </div>
      </Sequence>

      {/* Tagline */}
      <Sequence from={14} durationInFrames={sceneDuration - 14} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="Check before you post. Fix before you fail."
            fontSize={22}
            color={colors.accent}
            fontWeight={500}
            animation="fadeUp"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
