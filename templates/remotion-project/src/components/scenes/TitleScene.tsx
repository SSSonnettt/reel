import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

/**
 * 开场标题场景。
 * 居中大标题 + 副标题，带弹性动画入场。
 */
export const TitleScene: React.FC<SceneProps> = ({
  title = "未命名标题",
  subtitle,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const titleScale = titleSpring * 0.15 + 0.85;

  const subtitleDelay = 15;
  const subtitleSpring = spring({
    frame: Math.max(0, frame - subtitleDelay),
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const lineWidth = spring({
    frame: Math.max(0, frame - 5),
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
        alignItems: "center",
        justifyContent: "center",
        opacity: exitFade,
      }}
    >
      <div
        style={{
          width: lineWidth * 200,
          height: 3,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          borderRadius: 2,
          marginBottom: 40,
        }}
      />
      <h1
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: "0.02em",
          transform: `scale(${titleScale})`,
          textShadow: "0 4px 20px rgba(99,102,241,0.3)",
          maxWidth: "80%",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            marginTop: 24,
            opacity: subtitleSpring,
            transform: `translateY(${(1 - subtitleSpring) * 20}px)`,
            maxWidth: "70%",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};
