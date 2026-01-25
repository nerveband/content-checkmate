import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { colors, radii } from "../styles/theme";
import { fontFamily } from "../styles/fonts";
import { AnimatedText } from "../components/AnimatedText";
import { SocialMediaPost } from "../components/SocialMediaPost";

export const Scene5AIGeneration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneDuration = fps * 5;

  // Morphing animation progress
  const morphProgress = interpolate(frame, [fps * 1.5, fps * 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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

  // Sparkle positions
  const sparkles = [
    { x: -100, y: -80, delay: fps * 2.5 },
    { x: 120, y: -60, delay: fps * 2.7 },
    { x: -80, y: 100, delay: fps * 2.9 },
    { x: 110, y: 80, delay: fps * 3.1 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfacePrimary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        perspective: 1500,
      }}
    >
      {/* Title with exit animation */}
      <Sequence from={0} durationInFrames={sceneDuration} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="AI Generates Compliant Alternatives"
            fontSize={30}
            color={colors.textPrimary}
            fontWeight={600}
            animation="fadeUp"
            isDisplay={true}
          />
        </div>
      </Sequence>

      {/* Transformation Visual with exit animation */}
      <Sequence from={12} durationInFrames={sceneDuration - 12} premountFor={fps} layout="none">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 50,
            position: "relative",
            opacity: exitOpacity,
            transform: `translateY(${exitY}px)`,
          }}
        >
          {/* Original Post (with violation) */}
          <div
            style={{
              transform: `scale(${interpolate(morphProgress, [0, 0.5], [0.75, 0.65], {
                extrapolateRight: "clamp",
              })})`,
              opacity: interpolate(morphProgress, [0, 0.5], [1, 0.5], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            <SocialMediaPost showViolation={true} violationText="Health claim" delay={0} />
          </div>

          {/* Arrow / Transform indicator */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: radii.full,
                background: `conic-gradient(${colors.accent} ${morphProgress * 360}deg, ${colors.border} 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: radii.full,
                  backgroundColor: colors.surfaceSecondary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth="2"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
            </div>
            <div
              style={{
                fontFamily: fontFamily.body,
                fontSize: 12,
                fontWeight: 600,
                color: colors.accent,
              }}
            >
              AI FIX
            </div>
          </div>

          {/* Fixed Post (compliant) */}
          <div
            style={{
              transform: `scale(${spring({
                frame: Math.max(0, frame - fps * 2.2),
                fps,
                config: { damping: 15, stiffness: 120 },
              }) * 0.75})`,
              opacity: morphProgress,
              position: "relative",
            }}
          >
            <SocialMediaPost showViolation={false} delay={fps * 1.5} />

            {/* Compliant badge */}
            <div
              style={{
                position: "absolute",
                top: -16,
                right: -16,
                width: 44,
                height: 44,
                borderRadius: radii.full,
                backgroundColor: colors.positive,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px rgba(5, 150, 105, 0.4)`,
                transform: `scale(${spring({
                  frame: Math.max(0, frame - fps * 3),
                  fps,
                  config: { damping: 10, stiffness: 180 },
                })})`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Sparkles */}
            {sparkles.map((sparkle, i) => {
              const sparkleProgress = spring({
                frame: Math.max(0, frame - sparkle.delay),
                fps,
                config: { damping: 8, stiffness: 200 },
              });
              const fadeOut = interpolate(
                frame - sparkle.delay,
                [0, fps * 0.8],
                [1, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${sparkle.x}px)`,
                    top: `calc(50% + ${sparkle.y}px)`,
                    color: colors.accent,
                    fontSize: 20,
                    opacity: sparkleProgress * fadeOut,
                    transform: `scale(${sparkleProgress})`,
                  }}
                >
                  ✦
                </div>
              );
            })}
          </div>
        </div>
      </Sequence>

      {/* Caption with exit animation */}
      <Sequence from={fps * 3.2} durationInFrames={fps * 1.5} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="One click to generate policy-safe images"
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
