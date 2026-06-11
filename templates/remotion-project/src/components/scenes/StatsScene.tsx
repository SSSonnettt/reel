import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

const STAGGER = 12;

/**
 * 数据展示场景 — 大数字 + 标签，逐个弹出。
 */
export const StatsScene: React.FC<SceneProps> = ({
  title,
  stats = [],
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
        alignItems: "center",
        justifyContent: "center",
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
            marginBottom: 56,
            textAlign: "center",
          }}
        >
          {title}
        </h2>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 48,
          flexWrap: "wrap",
          maxWidth: 1400,
        }}
      >
        {stats.map((stat, index) => {
          const statFrame = Math.max(0, frame - index * STAGGER * 2);
          const statSpring = spring({
            frame: statFrame,
            fps,
            config: { damping: 10, stiffness: 100, mass: 0.8 },
          });
          if (statFrame <= 0 && index > 0) return null;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                transform: `scale(${statSpring})`,
                opacity: statSpring,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  background:
                    "linear-gradient(135deg, #6366f1, #a78bfa, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.1,
                  filter: "drop-shadow(0 0 20px rgba(99,102,241,0.3))",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  textAlign: "center",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
