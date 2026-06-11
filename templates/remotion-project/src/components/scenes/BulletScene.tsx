import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

const STAGGER_DELAY = 10;

/**
 * 要点列表场景。逐条飞入。
 */
export const BulletScene: React.FC<SceneProps> = ({
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
            borderLeft: "4px solid #6366f1",
            paddingLeft: 24,
          }}
        >
          {title}
        </h2>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {items.map((item, index) => {
          const itemFrame = Math.max(0, frame - index * STAGGER_DELAY);
          const itemSpring = spring({
            frame: itemFrame,
            fps,
            config: { damping: 15, stiffness: 80 },
          });
          if (itemFrame <= 0 && index > 0) return null;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                opacity: itemSpring,
                transform: `translateX(${(1 - itemSpring) * -40}px)`,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  marginTop: 12,
                  flexShrink: 0,
                  boxShadow: "0 0 12px rgba(99,102,241,0.5)",
                }}
              />
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                  lineHeight: 1.6,
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
