import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  staticFile,
} from "remotion";
import { colors } from "../styles/theme";

export const Scene2MascotReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mascot scales in with a dramatic spring
  const mascotScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80, mass: 1.2 },
  });

  // Subtle 3D rotation to show off detail
  const rotateY = Math.sin(frame * 0.04) * 6;
  const rotateX = Math.cos(frame * 0.03) * 3;

  // Pulsing glow behind the mascot
  const glowPulse = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 15, stiffness: 60 },
  });
  const glowBreath = 0.7 + 0.3 * Math.sin(frame * 0.12);

  // Radial glow ring expands outward
  const ringScale = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 20, stiffness: 50 },
  });

  // Exit: mascot shrinks and fades near end
  const sceneDuration = fps * 2.5;
  const exitProgress = interpolate(
    frame,
    [sceneDuration - fps * 0.5, sceneDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.25]);
  const exitOpacity = interpolate(exitProgress, [0, 0.8, 1], [1, 1, 0.6]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfaceSecondary,
        background: `radial-gradient(ellipse at center, ${colors.surfaceSecondary} 0%, ${colors.surfacePrimary} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1200,
      }}
    >
      {/* Ambient glow ring */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(230, 122, 49, ${0.15 * glowPulse * glowBreath}) 0%, rgba(230, 122, 49, ${0.05 * glowPulse * glowBreath}) 40%, transparent 70%)`,
          transform: `scale(${ringScale * exitScale})`,
        }}
      />

      {/* Mascot - large and detailed */}
      <div
        style={{
          width: 350,
          height: 350,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${mascotScale * exitScale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
          transformStyle: "preserve-3d",
          filter: `drop-shadow(0 0 ${40 * glowPulse * glowBreath}px rgba(230, 122, 49, ${0.5 * glowPulse * glowBreath}))`,
          opacity: exitOpacity,
        }}
      >
        <Img
          src={staticFile("mascot.png")}
          style={{ width: 350, height: 350, objectFit: "contain" }}
        />
      </div>
    </AbsoluteFill>
  );
};
