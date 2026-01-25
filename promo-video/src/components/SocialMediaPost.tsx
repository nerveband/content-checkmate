import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img } from "remotion";
import { colors, radii, shadows } from "../styles/theme";
import { fontFamily } from "../styles/fonts";

type SocialMediaPostProps = {
  delay?: number;
  showViolation?: boolean;
  violationText?: string;
};

export const SocialMediaPost: React.FC<SocialMediaPostProps> = ({
  delay = 0,
  showViolation = false,
  violationText = "Potential health claim",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delayedFrame = Math.max(0, frame - delay);

  const scale = spring({
    frame: delayedFrame,
    fps,
    config: { damping: 200 },
  });

  const violationOpacity = showViolation
    ? interpolate(delayedFrame, [20, 35], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  const violationPulse = showViolation ? 0.85 + 0.15 * Math.sin(delayedFrame * 0.12) : 1;

  return (
    <div
      style={{
        width: 380,
        backgroundColor: colors.surfaceSecondary,
        borderRadius: radii.xl,
        boxShadow: shadows.elevated,
        overflow: "hidden",
        transform: `scale(${scale})`,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Post Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: 14,
          gap: 12,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.full,
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.surfaceSecondary,
            fontWeight: 700,
            fontSize: 16,
            fontFamily: fontFamily.body,
          }}
        >
          AB
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: fontFamily.body,
              fontWeight: 600,
              fontSize: 14,
              color: colors.textPrimary,
            }}
          >
            acme_brand
          </div>
          <div
            style={{
              fontFamily: fontFamily.body,
              fontSize: 12,
              color: colors.textMuted,
            }}
          >
            Sponsored
          </div>
        </div>
        <div style={{ color: colors.textMuted, fontSize: 20 }}>•••</div>
      </div>

      {/* Post Image */}
      <div
        style={{
          width: "100%",
          height: 280,
          backgroundColor: "#f0f0f0",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Placeholder product image */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Product mockup */}
          <div
            style={{
              width: 120,
              height: 180,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radii.lg,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              gap: 8,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: radii.full,
                backgroundColor: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div
              style={{
                fontFamily: fontFamily.body,
                fontWeight: 700,
                fontSize: 11,
                color: colors.textPrimary,
                textAlign: "center",
              }}
            >
              WELLNESS
            </div>
            <div
              style={{
                fontFamily: fontFamily.body,
                fontSize: 9,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Premium Supplement
            </div>
          </div>
        </div>

        {/* Violation Bounding Box Overlay */}
        {showViolation && (
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              height: 60,
              border: `3px solid ${colors.negative}`,
              borderRadius: radii.md,
              backgroundColor: `rgba(220, 38, 38, ${0.15 * violationPulse})`,
              opacity: violationOpacity,
              boxShadow: `0 0 ${12 * violationPulse}px rgba(220, 38, 38, 0.4)`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -26,
                left: 8,
                backgroundColor: colors.negative,
                color: colors.surfaceSecondary,
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: radii.sm,
                fontFamily: fontFamily.body,
              }}
            >
              {violationText}
            </div>
          </div>
        )}
      </div>

      {/* Post Caption */}
      <div style={{ padding: 14 }}>
        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>

        {/* Caption text */}
        <div
          style={{
            fontFamily: fontFamily.body,
            fontSize: 13,
            color: colors.textPrimary,
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 600 }}>acme_brand</span>{" "}
          <span
            style={{
              backgroundColor: showViolation ? colors.negativeLight : "transparent",
              padding: showViolation ? "2px 4px" : 0,
              borderRadius: radii.sm,
            }}
          >
            Our supplement cures fatigue and boosts immunity!
          </span>{" "}
          🌿 Try it today! #wellness #health
        </div>
      </div>
    </div>
  );
};
