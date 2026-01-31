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
import { colors, radii } from "../styles/theme";
import { fontFamily } from "../styles/fonts";
import { AnimatedText } from "../components/AnimatedText";

export const Scene7CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = fps * 13;

  // Pulsing glow effect
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

  // URL fade in later
  const urlOpacity = spring({
    frame: Math.max(0, frame - fps * 3),
    fps,
    config: { damping: 20, stiffness: 100 },
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
      {/* Logo with 3D effect - persists for full scene */}
      <Sequence from={0} durationInFrames={sceneDuration} layout="none">
        <div
          style={{
            width: 200,
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${logoScale}) rotateY(${logoRotateY}deg) rotateX(${logoRotateX}deg)`,
            transformStyle: "preserve-3d",
            filter: `drop-shadow(0 0 ${30 * glowPulse}px rgba(230, 122, 49, ${0.4 * glowPulse}))`,
          }}
        >
          <Img
            src={staticFile("mascot.png")}
            style={{ width: 200, height: 200, objectFit: "contain" }}
          />
        </div>
      </Sequence>

      {/* Product Name - persists */}
      <Sequence from={8} durationInFrames={sceneDuration - 8} layout="none">
        <AnimatedText
          text="Content Checkmate"
          fontSize={44}
          color={colors.textPrimary}
          animation="scaleIn"
          isDisplay={true}
        />
      </Sequence>

      {/* Tagline - persists */}
      <Sequence from={fps * 0.8} durationInFrames={sceneDuration - fps * 0.8} layout="none">
        <AnimatedText
          text="Stop guessing. Start knowing."
          fontSize={24}
          color={colors.accent}
          fontWeight={600}
          animation="fadeUp"
        />
      </Sequence>

      {/* Platform badges - persist */}
      <Sequence from={fps * 1.3} durationInFrames={sceneDuration - fps * 1.3} layout="none">
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

      {/* URL - fades in after badges */}
      <Sequence from={fps * 3} durationInFrames={sceneDuration - fps * 3} layout="none">
        <div
          style={{
            marginTop: 8,
            opacity: urlOpacity,
            fontFamily: fontFamily.body,
            fontSize: 18,
            fontWeight: 500,
            color: colors.textSecondary,
            letterSpacing: 1,
          }}
        >
          checkmycontent.com
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
