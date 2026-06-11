import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

/**
 * 结尾总结场景 — 感谢观看 + 总结要点 + CTA。
 */
export const OutroScene: React.FC<SceneProps> = ({
  title = "感谢观看",
  subtitle,
  items,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const subtitleDelay = 15;
  const subtitleSpring = spring({
    frame: Math.max(0, frame - subtitleDelay),
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // 总结点逐条出现
  const summaryItems = items || [];

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
        padding: "80px 120px",
        opacity: exitFade,
      }}
    >
      {/* 装饰环 */}
      <div
        style={{
          width: titleSpring * 160,
          height: titleSpring * 160,
          borderRadius: "50%",
          border: "2px solid rgba(99,102,241,0.3)",
          position: "absolute",
          boxShadow: "0 0 40px rgba(99,102,241,0.1)",
        }}
      />

      {/* 主标题 */}
      <h1
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          margin: 0,
          opacity: titleSpring,
          transform: `scale(${0.9 + titleSpring * 0.1})`,
          textShadow: "0 4px 20px rgba(99,102,241,0.3)",
          marginBottom: 20,
        }}
      >
        {title}
      </h1>

      {/* 副标题 */}
      {subtitle && (
        <p
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            marginTop: 8,
            marginBottom: 40,
            opacity: subtitleSpring,
            transform: `translateY(${(1 - subtitleSpring) * 15}px)`,
            textAlign: "center",
            maxWidth: "70%",
          }}
        >
          {subtitle}
        </p>
      )}

      {/* 总结要点 */}
      {summaryItems.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 32,
          }}
        >
          {summaryItems.map((item, index) => {
            const itemFrame = Math.max(0, frame - 30 - index * 12);
            const itemSpring = spring({
              frame: itemFrame,
              fps,
              config: { damping: 14, stiffness: 80 },
            });
            if (itemFrame <= 0) return null;

            return (
              <div
                key={index}
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.75)",
                  opacity: itemSpring,
                  transform: `translateY(${(1 - itemSpring) * 15}px)`,
                  textAlign: "center",
                  padding: "8px 24px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                }}
              >
                ✦ {item}
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
