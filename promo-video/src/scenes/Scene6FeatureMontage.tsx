import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
  interpolate,
} from "remotion";
import { colors, radii, shadows } from "../styles/theme";
import { fontFamily } from "../styles/fonts";
import { AnimatedText } from "../components/AnimatedText";

type FeatureCardProps = {
  icon: React.ReactNode;
  label: string;
  delay: number;
  index: number;
  exitOpacity: number;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, label, delay, index, exitOpacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delayedFrame = Math.max(0, frame - delay);

  const scale = spring({
    frame: delayedFrame,
    fps,
    config: { damping: 15, stiffness: 180 },
  });

  // More dramatic 3D floating effect - each card bobs with more movement
  const floatY = Math.sin((frame + index * 15) * 0.1) * 8;
  const rotateX = Math.sin((frame + index * 20) * 0.06) * 8;
  const rotateY = Math.cos((frame + index * 10) * 0.07) * 10;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: 20,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: radii.xl,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.card,
        transform: `scale(${scale}) translateY(${floatY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
        minWidth: 120,
        opacity: exitOpacity,
      }}
    >
      <div style={{ color: colors.accent }}>{icon}</div>
      <div
        style={{
          fontFamily: fontFamily.body,
          fontSize: 13,
          fontWeight: 600,
          color: colors.textPrimary,
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const Scene6FeatureMontage: React.FC = () => {
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

  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      label: "Policy Guide",
      delay: 0,
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      label: "History",
      delay: 8,
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      ),
      label: "Exclusions",
      delay: 16,
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
      label: "Text Analysis",
      delay: 24,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.surfacePrimary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        perspective: 1200,
      }}
    >
      {/* Title with exit animation */}
      <Sequence from={0} durationInFrames={sceneDuration} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="Plus Everything You Need"
            fontSize={32}
            color={colors.textPrimary}
            fontWeight={600}
            animation="fadeUp"
            isDisplay={true}
          />
        </div>
      </Sequence>

      {/* Feature Cards Grid with 3D tilt and exit animation */}
      <Sequence from={10} durationInFrames={sceneDuration - 10} premountFor={fps} layout="none">
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 600,
            transform: `translateY(${exitY}px)`,
          }}
        >
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              label={feature.label}
              delay={feature.delay}
              index={i}
              exitOpacity={exitOpacity}
            />
          ))}
        </div>
      </Sequence>

      {/* Subtitle with exit animation */}
      <Sequence from={fps * 2} durationInFrames={fps * 1.5} premountFor={fps} layout="none">
        <div style={{ opacity: exitOpacity, transform: `translateY(${exitY}px)` }}>
          <AnimatedText
            text="Built for Meta advertisers"
            fontSize={18}
            color={colors.textSecondary}
            fontWeight={500}
            animation="fadeUp"
          />
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
