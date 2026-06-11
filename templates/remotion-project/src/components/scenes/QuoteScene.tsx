import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

/**
 * 引用场景 — 大引号 + 斜体文字，优雅展示引用内容。
 */
export const QuoteScene: React.FC<SceneProps> = ({
  title,
  quote = "",
  quoteAuthor,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 引号入场
  const quoteSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // 作者延迟入场
  const authorDelay = 20;
  const authorSpring = spring({
    frame: Math.max(0, frame - authorDelay),
    fps,
    config: { damping: 15, stiffness: 70 },
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
        padding: "80px 160px",
        opacity: exitFade,
      }}
    >
      {title && (
        <h2
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 40,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          {title}
        </h2>
      )}

      {/* 左引号 */}
      <div
        style={{
          fontSize: 120,
          color: "rgba(99,102,241,0.25)",
          lineHeight: 0.5,
          fontFamily: "Georgia, serif",
          alignSelf: "flex-start",
          marginBottom: -20,
          transform: `scale(${quoteSpring})`,
        }}
      >
        &ldquo;
      </div>

      {/* 引用文字 */}
      <blockquote
        style={{
          fontSize: 36,
          fontWeight: 500,
          fontStyle: "italic",
          color: "rgba(255,255,255,0.9)",
          textAlign: "center",
          lineHeight: 1.7,
          margin: "0 0 32px 0",
          opacity: quoteSpring,
          transform: `translateY(${(1 - quoteSpring) * 20}px)`,
          border: "none",
          padding: 0,
        }}
      >
        {quote}
      </blockquote>

      {/* 右引号 */}
      <div
        style={{
          fontSize: 120,
          color: "rgba(99,102,241,0.25)",
          lineHeight: 0.5,
          fontFamily: "Georgia, serif",
          alignSelf: "flex-end",
          marginTop: -40,
          marginBottom: 20,
        }}
      >
        &rdquo;
      </div>

      {/* 作者 */}
      {quoteAuthor && (
        <div
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.5)",
            opacity: authorSpring,
            transform: `translateY(${(1 - authorSpring) * 10}px)`,
          }}
        >
          — {quoteAuthor}
        </div>
      )}
    </AbsoluteFill>
  );
};
