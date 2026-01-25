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

export const Scene3Upload: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = fps * 6;

  // Determine state based on frame
  const getState = (): "empty" | "analyzing" | "results" => {
    if (frame < fps * 1.5) return "empty";
    if (frame < fps * 3.5) return "analyzing";
    return "results";
  };

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
            text="Upload & Analyze Instantly"
            fontSize={32}
            color={colors.textPrimary}
            fontWeight={600}
            animation="fadeUp"
            isDisplay={true}
          />
        </div>
      </Sequence>

      {/* App Mockup with more dramatic 3D tilt */}
      <Sequence from={10} durationInFrames={sceneDuration - 10} premountFor={fps} layout="none">
        <div style={{
          transform: `rotateY(${Math.sin(frame * 0.03) * 8}deg) rotateX(${4 + Math.cos(frame * 0.02) * 3}deg)`,
          transformStyle: "preserve-3d",
          opacity: exitOpacity,
        }}>
          <AppMockup state={getState()} delay={0} />
        </div>
      </Sequence>

      {/* Caption with exit animation */}
      <Sequence from={fps * 3.5} durationInFrames={fps * 2} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="Get results in seconds"
            fontSize={20}
            color={colors.positive}
            fontWeight={600}
            animation="fadeUp"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
