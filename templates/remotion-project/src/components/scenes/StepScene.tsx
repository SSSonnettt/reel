import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

const STAGGER_DELAY = 12;

/**
 * 操作步骤场景 — 带编号的步骤列表，逐条按序出现。
 */
export const StepScene: React.FC<SceneProps> = ({
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
        padding: "80px 120px",
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
            borderLeft: "4px solid #22c55e",
            paddingLeft: 24,
          }}
        >
          {title}
        </h2>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item, index) => {
          const itemFrame = Math.max(0, frame - index * STAGGER_DELAY);
          const itemSpring = spring({
            frame: itemFrame,
            fps,
            config: { damping: 14, stiffness: 90 },
          });
          if (itemFrame <= 0 && index > 0) return null;

          const stepNum = String(index + 1).padStart(2, "0");

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                opacity: itemSpring,
                transform: `translateY(${(1 - itemSpring) * 30}px)`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#ffffff",
                  flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
                  fontFamily: "monospace",
                }}
              >
                {stepNum}
              </div>
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.5,
                  flex: 1,
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
