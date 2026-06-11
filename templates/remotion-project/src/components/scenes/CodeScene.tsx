import React, { useMemo } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

/**
 * 代码展示场景 — 深色终端风格背景，逐行高亮出现。
 */
export const CodeScene: React.FC<SceneProps> = ({
  title,
  code = "",
  language,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeLines = useMemo(() => code.split("\n"), [code]);

  const blockSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  const linesPerFrame = 5;
  const visibleLines = Math.floor(frame / linesPerFrame);

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
            fontSize: 36,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: 32,
            borderLeft: "4px solid #f59e0b",
            paddingLeft: 24,
          }}
        >
          {title}
        </h2>
      )}
      {language && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          {language}
        </div>
      )}
      <div
        style={{
          background: "rgba(0,0,0,0.5)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "32px 40px",
          overflow: "hidden",
          transform: `scale(${0.95 + blockSpring * 0.05})`,
          opacity: blockSpring,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: 26,
            fontFamily:
              "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace",
            lineHeight: 1.8,
            color: "#e2e8f0",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {codeLines.map((line, i) => (
            <div
              key={i}
              style={{
                opacity: i < visibleLines ? 1 : 0.15,
                borderLeft:
                  i < visibleLines && i === visibleLines - 1
                    ? "3px solid #f59e0b"
                    : "3px solid transparent",
                paddingLeft: 12,
                color: i < visibleLines ? "#e2e8f0" : "rgba(226,232,240,0.3)",
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.2)",
                  marginRight: 16,
                  userSelect: "none",
                  fontSize: 20,
                }}
              >
                {String(i + 1).padStart(2, " ")}
              </span>
              {line || " "}
            </div>
          ))}
        </pre>
      </div>
    </AbsoluteFill>
  );
};
