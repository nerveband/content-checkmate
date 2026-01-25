import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
} from "remotion";
import { colors } from "../styles/theme";
import { AnimatedText } from "../components/AnimatedText";
import { AppMockup } from "../components/AppMockup";

export const Scene4BoundingBox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = fps * 4;

  // Exit animation - fade out everything near end of scene
  const exitOpacity = interpolate(
    frame,
    [sceneDuration - fps * 0.5, sceneDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitY = interpolate(
    frame,
    [sceneDuration - fps * 0.5, sceneDuration],
    [0, -30],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfacePrimary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        perspective: 1200,
      }}
    >
      {/* Title with exit animation */}
      <Sequence from={0} durationInFrames={sceneDuration} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="See Exactly What's Wrong"
            fontSize={32}
            color={colors.textPrimary}
            fontWeight={600}
            animation="fadeUp"
            isDisplay={true}
          />
        </div>
      </Sequence>

      {/* App Mockup with bounding box and more dramatic 3D effect */}
      <Sequence from={10} durationInFrames={sceneDuration - 10} premountFor={fps} layout="none">
        <div style={{
          transform: `rotateX(${5 + Math.sin(frame * 0.02) * 3}deg) rotateY(${Math.sin(frame * 0.035) * 10}deg)`,
          transformStyle: "preserve-3d",
          opacity: exitOpacity,
        }}>
          <AppMockup state="results" showBoundingBox={true} delay={0} />
        </div>
      </Sequence>

      {/* Caption with exit animation */}
      <Sequence from={fps * 1.5} durationInFrames={fps * 2} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="Visual highlighting pinpoints every issue"
            fontSize={20}
            color={colors.accent}
            fontWeight={600}
            animation="fadeUp"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
