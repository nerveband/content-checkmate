import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { colors, radii, shadows } from "../styles/theme";
import { fontFamily } from "../styles/fonts";

type AppMockupProps = {
  delay?: number;
  state?: "empty" | "analyzing" | "results";
  showBoundingBox?: boolean;
};

export const AppMockup: React.FC<AppMockupProps> = ({
  delay = 0,
  state = "empty",
  showBoundingBox = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delayedFrame = Math.max(0, frame - delay);

  const scale = spring({
    frame: delayedFrame,
    fps,
    config: { damping: 200 },
  });

  const boundingBoxPulse = showBoundingBox ? 0.85 + 0.15 * Math.sin(delayedFrame * 0.12) : 1;

  return (
    <div
      style={{
        width: 750,
        height: 480,
        backgroundColor: colors.surfacePrimary,
        borderRadius: radii["2xl"],
        overflow: "hidden",
        transform: `scale(${scale})`,
        boxShadow: shadows.elevated,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          backgroundColor: colors.surfaceSecondary,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        {/* Logo */}
        <Img
          src={staticFile("mascot.png")}
          style={{ width: 36, height: 36, objectFit: "contain" }}
        />
        <div>
          <div
            style={{
              fontFamily: fontFamily.display,
              fontWeight: 600,
              fontSize: 18,
              color: colors.textPrimary,
            }}
          >
            Content Checkmate
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginLeft: "auto",
          }}
        >
          {["Media & Text", "Text Only", "Image Editor", "Policy Guide", "History"].map(
            (tab, i) => (
              <div
                key={tab}
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: 13,
                  fontWeight: 500,
                  color: i === 0 ? colors.accent : colors.textSecondary,
                  borderBottom: i === 0 ? `2px solid ${colors.accent}` : "none",
                  paddingBottom: 4,
                }}
              >
                {tab}
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", height: 424 }}>
        {/* Left Panel - Upload/Preview */}
        <div
          style={{
            flex: 2,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Image Preview Area */}
          <div
            style={{
              flex: 1,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: radii.xl,
              border: `1px solid ${colors.border}`,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {state === "empty" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  color: colors.textMuted,
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div style={{ fontFamily: fontFamily.body, fontSize: 14 }}>
                  Drag & drop or click to upload
                </div>
              </div>
            ) : (
              <>
                {/* Mock uploaded image */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 50%, #A5B4FC 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 100,
                      height: 150,
                      backgroundColor: colors.surfaceSecondary,
                      borderRadius: radii.lg,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: radii.full,
                        backgroundColor: colors.accent,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: fontFamily.body,
                        fontWeight: 700,
                        fontSize: 9,
                        color: colors.textPrimary,
                      }}
                    >
                      WELLNESS
                    </div>
                  </div>
                </div>

                {/* Bounding Box - Centered on the social post */}
                {showBoundingBox && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 130,
                      height: 80,
                      border: `3px solid ${colors.negative}`,
                      borderRadius: radii.md,
                      backgroundColor: `rgba(220, 38, 38, ${0.12 * boundingBoxPulse})`,
                      boxShadow: `0 0 ${14 * boundingBoxPulse}px rgba(220, 38, 38, 0.35)`,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -24,
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: colors.negative,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: radii.sm,
                        fontFamily: fontFamily.body,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Health claim detected
                    </div>
                  </div>
                )}

                {/* Analyzing overlay */}
                {state === "analyzing" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        border: `3px solid ${colors.accent}`,
                        borderTopColor: "transparent",
                        borderRadius: radii.full,
                        transform: `rotate(${delayedFrame * 8}deg)`,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: fontFamily.body,
                        fontSize: 14,
                        fontWeight: 500,
                        color: colors.textSecondary,
                      }}
                    >
                      Analyzing content...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Analyze Button */}
          <button
            style={{
              backgroundColor: colors.accent,
              color: colors.surfaceSecondary,
              border: "none",
              padding: "14px 24px",
              borderRadius: radii.lg,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: fontFamily.body,
              cursor: "pointer",
              boxShadow: shadows.subtle,
            }}
          >
            Analyze Content
          </button>
        </div>

        {/* Right Panel - Results */}
        <div
          style={{
            flex: 1,
            padding: 20,
            backgroundColor: colors.surfaceSecondary,
            borderLeft: `1px solid ${colors.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontFamily: fontFamily.display,
              fontSize: 16,
              color: colors.textPrimary,
            }}
          >
            Analysis Results
          </div>

          {state === "results" ? (
            <>
              {/* Severity Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: colors.negativeLight,
                  color: colors.negativeDark,
                  padding: "6px 12px",
                  borderRadius: radii.full,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: fontFamily.body,
                  alignSelf: "flex-start",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                HIGH RISK
              </div>

              {/* Issue Card */}
              <div
                style={{
                  backgroundColor: colors.surfacePrimary,
                  borderRadius: radii.lg,
                  padding: 14,
                  borderLeft: `4px solid ${colors.negative}`,
                }}
              >
                <div
                  style={{
                    fontFamily: fontFamily.body,
                    fontSize: 12,
                    fontWeight: 600,
                    color: colors.negative,
                    marginBottom: 6,
                  }}
                >
                  Health Claim Violation
                </div>
                <div
                  style={{
                    fontFamily: fontFamily.body,
                    fontSize: 12,
                    color: colors.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  "Cures fatigue" makes unsubstantiated health claims
                </div>
              </div>

              {/* Recommendation Card */}
              <div
                style={{
                  backgroundColor: colors.positiveLight,
                  borderRadius: radii.lg,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontFamily: fontFamily.body,
                    fontSize: 12,
                    fontWeight: 600,
                    color: colors.positiveDark,
                    marginBottom: 6,
                  }}
                >
                  Recommendation
                </div>
                <div
                  style={{
                    fontFamily: fontFamily.body,
                    fontSize: 12,
                    color: colors.positive,
                    lineHeight: 1.5,
                  }}
                >
                  Replace with "Supports energy levels"
                </div>
              </div>

              {/* AI Fix Button */}
              <button
                style={{
                  backgroundColor: colors.surfacePrimary,
                  color: colors.accent,
                  border: `1px solid ${colors.accent}`,
                  padding: "10px 16px",
                  borderRadius: radii.lg,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: fontFamily.body,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Generate AI Fix
              </button>
            </>
          ) : (
            <div
              style={{
                fontFamily: fontFamily.body,
                fontSize: 13,
                color: colors.textMuted,
                fontStyle: "italic",
              }}
            >
              Upload content to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
