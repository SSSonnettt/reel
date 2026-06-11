import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

/**
 * 前后对比场景 — 双栏布局，左旧右新。
 */
export const CompareScene: React.FC<SceneProps> = ({
  title,
  compare,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const left = compare?.left || { title: "之前", items: [] };
  const right = compare?.right || { title: "之后", items: [] };

  const leftSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const rightDelay = 15;
  const rightSpring = spring({
    frame: Math.max(0, frame - rightDelay),
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const dividerGrow = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const exitFade =
    frame > durationInFrames - 30
      ? 1 - (frame - (durationInFrames - 30)) / 30
      : 1;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "60px 80px",
        opacity: exitFade,
      }}
    >
      {title && (
        <h2
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          {title}
        </h2>
      )}

      <div style={{ display: "flex", flex: 1, gap: 0, position: "relative" }}>
        <div
          style={{
            flex: 1,
            padding: "32px 40px",
            opacity: leftSpring,
            transform: `translateX(${(1 - leftSpring) * -60}px)`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#ef4444",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>❌</span> {left.title}
          </div>
          {left.items.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.6)",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                textDecoration: "line-through",
                textDecorationColor: "rgba(239,68,68,0.3)",
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            width: 2,
            alignSelf: "stretch",
            background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
            opacity: dividerGrow,
            transform: `scaleY(${dividerGrow})`,
            boxShadow: "0 0 16px rgba(99,102,241,0.3)",
            margin: "20px 0",
          }}
        />

        <div
          style={{
            flex: 1,
            padding: "32px 40px",
            opacity: rightSpring,
            transform: `translateX(${(1 - rightSpring) * 60}px)`,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#22c55e",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>✅</span> {right.title}
          </div>
          {right.items.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.9)",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
