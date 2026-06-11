import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

const STAGGER_DELAY = 10;
const ICONS = ["✨", "🚀", "💡", "🔒", "⚡", "🎯", "📈", "🛡️"];

/**
 * 优势列表场景 — 图标 + 文字飞入。
 */
export const BenefitsScene: React.FC<SceneProps> = ({
  title,
  items = [],
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitFade =
    frame > durationInFrames - 30
      ? 1 - (frame - (durationInFrames - 30)) / 30
      : 1;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "60px 100px",
        opacity: exitFade,
      }}
    >
      {title && (
        <h2
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 48,
            textAlign: "center",
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </h2>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          maxWidth: 1400,
          alignSelf: "center",
          width: "100%",
        }}
      >
        {items.map((item, index) => {
          const itemFrame = Math.max(0, frame - index * STAGGER_DELAY);
          const itemSpring = spring({
            frame: itemFrame,
            fps,
            config: { damping: 14, stiffness: 80 },
          });
          if (itemFrame <= 0 && index > 1) return null;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: "28px 32px",
                border: "1px solid rgba(255,255,255,0.06)",
                opacity: itemSpring,
                transform: `scale(${0.9 + itemSpring * 0.1}) translateY(${(1 - itemSpring) * 20}px)`,
              }}
            >
              <span style={{ fontSize: 40, flexShrink: 0 }}>
                {ICONS[index % ICONS.length]}
              </span>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.5,
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
