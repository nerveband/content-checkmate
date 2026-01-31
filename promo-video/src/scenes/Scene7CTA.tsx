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

export const Scene7CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulsing glow effect - more dramatic
  const glowPulse = 0.6 + 0.4 * Math.sin(frame * 0.15);

  // Logo scale with bounce
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // Subtle 3D rotation for the logo
  const logoRotateY = Math.sin(frame * 0.04) * 8;
  const logoRotateX = Math.cos(frame * 0.03) * 4;

  // Background gradient animation
  const gradientShift = interpolate(frame, [0, fps * 3], [0, 360], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfaceSecondary,
        background: `radial-gradient(ellipse at center, ${colors.surfaceSecondary} 0%, ${colors.surfacePrimary} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        perspective: 1200,
      }}
    >
      {/* Logo with 3D effect */}
      <Sequence from={0} durationInFrames={fps * 3} premountFor={fps} layout="none">
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: radii.xl,
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${logoScale}) rotateY(${logoRotateY}deg) rotateX(${logoRotateX}deg)`,
            transformStyle: "preserve-3d",
            boxShadow: `0 0 ${50 * glowPulse}px rgba(245, 158, 11, ${0.5 * glowPulse}), 0 8px 32px rgba(0,0,0,0.15)`,
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

      {/* Product Name */}
      <Sequence from={8} durationInFrames={fps * 2.5} premountFor={fps} layout="none">
        <AnimatedText
          text="Content Checkmate"
          fontSize={44}
          color={colors.textPrimary}
          animation="scaleIn"
          isDisplay={true}
        />
      </Sequence>

      {/* Tagline */}
      <Sequence from={fps * 0.8} durationInFrames={fps * 2.2} premountFor={fps} layout="none">
        <AnimatedText
          text="Stop guessing. Start knowing."
          fontSize={24}
          color={colors.accent}
          fontWeight={600}
          animation="fadeUp"
        />
      </Sequence>

      {/* Platform badges */}
      <Sequence from={fps * 1.3} durationInFrames={fps * 1.7} premountFor={fps} layout="none">
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
          }}
        >
          {["Social Ads", "Instagram", "Facebook"].map((platform, i) => {
            const badgeProgress = spring({
              frame: Math.max(0, frame - fps * 1.3 - i * 4),
              fps,
              config: { damping: 15, stiffness: 180 },
            });
            return (
              <div
                key={platform}
                style={{
                  padding: "8px 16px",
                  backgroundColor: colors.accentLight,
                  borderRadius: radii.full,
                  color: colors.accentDark,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: fontFamily.body,
                  transform: `scale(${badgeProgress})`,
                }}
              >
                {platform}
              </div>
            );
          })}
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
