import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { colors } from "../styles/theme";
import { fontFamily } from "../styles/fonts";
import { AnimatedText } from "../components/AnimatedText";
import { SocialMediaPost } from "../components/SocialMediaPost";

export const Scene1Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = fps * 5;

  // Shake effect for REJECTED
  const shakeX = frame < 12 ? Math.sin(frame * 3) * (12 - frame) * 0.6 : 0;

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

  // More dramatic 3D rotation
  const rotateX = Math.sin(frame * 0.04) * 6;
  const rotateY = Math.cos(frame * 0.03) * 8;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfacePrimary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Main content container with 3D perspective */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          perspective: 1200,
          transformStyle: "preserve-3d",
          opacity: exitOpacity,
          transform: `translateY(${exitY}px)`,
        }}
      >
        {/* REJECTED stamp over post */}
        <Sequence from={0} durationInFrames={sceneDuration} premountFor={fps} layout="none">
          <div style={{ position: "relative", transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transformStyle: "preserve-3d" }}>
            {/* Social media post in background */}
            <div
              style={{
                opacity: interpolate(frame, [0, 20], [0, 0.6], {
                  extrapolateRight: "clamp",
                }),
                filter: "blur(2px)",
                transform: "scale(0.85)",
              }}
            >
              <SocialMediaPost delay={5} />
            </div>

            {/* REJECTED overlay */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translateX(${shakeX}px) rotate(-12deg)`,
              }}
            >
              <div
                style={{
                  opacity: interpolate(frame, [15, 20], [0, 1], {
                    extrapolateRight: "clamp",
                  }),
                  transform: `scale(${spring({
                    frame: Math.max(0, frame - 15),
                    fps,
                    config: { damping: 10, stiffness: 200 },
                  })})`,
                }}
              >
                <div
                  style={{
                    fontFamily: fontFamily.body,
                    fontSize: 72,
                    fontWeight: 800,
                    color: colors.negative,
                    textTransform: "uppercase",
                    letterSpacing: 4,
                    textShadow: `0 4px 20px rgba(220, 38, 38, 0.4)`,
                    padding: "12px 32px",
                    border: `6px solid ${colors.negative}`,
                    borderRadius: 8,
                    backgroundColor: "rgba(254, 226, 226, 0.95)",
                  }}
                >
                  Rejected
                </div>
              </div>
            </div>
          </div>
        </Sequence>

        {/* Question text */}
        <Sequence from={fps * 2} durationInFrames={fps * 3} premountFor={fps} layout="none">
          <AnimatedText
            text="Tired of guessing what platforms will approve?"
            fontSize={28}
            color={colors.textSecondary}
            fontWeight={500}
            animation="fadeUp"
          />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
