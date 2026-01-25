import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  interpolate,
} from "remotion";
import { colors, radii } from "../styles/theme";
import { fontFamily } from "../styles/fonts";
import { AnimatedText } from "../components/AnimatedText";

export const Scene2Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = fps * 3;

  // Logo glow
  const glowIntensity = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  // Exit animation - fade out everything near end of scene
  const exitOpacity = interpolate(
    frame,
    [sceneDuration - fps * 0.4, sceneDuration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const exitY = interpolate(
    frame,
    [sceneDuration - fps * 0.4, sceneDuration],
    [0, -25],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // 3D rotation
  const rotateY = Math.sin(frame * 0.05) * 10;
  const rotateX = Math.cos(frame * 0.04) * 5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfaceSecondary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        perspective: 1200,
      }}
    >
      {/* Logo with 3D effect */}
      <Sequence from={0} durationInFrames={sceneDuration} premountFor={fps} layout="none">
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: radii.xl,
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${40 * glowIntensity}px rgba(245, 158, 11, ${0.5 * glowIntensity})`,
            transform: `scale(${spring({ frame, fps, config: { damping: 12, stiffness: 150 } })}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
            transformStyle: "preserve-3d",
            opacity: exitOpacity,
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
          >
            <path d="M9 12l2 2 4-4" />
            <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z" />
          </svg>
        </div>
      </Sequence>

      {/* Product Name with exit animation */}
      <Sequence from={12} durationInFrames={sceneDuration - 12} premountFor={fps} layout="none">
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

      {/* Tagline with exit animation */}
      <Sequence from={fps * 1} durationInFrames={fps * 1.6} premountFor={fps} layout="none">
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
