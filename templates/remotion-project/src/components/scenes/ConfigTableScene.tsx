import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneProps } from "../../types";

const ROW_STAGGER = 8;

/**
 * 配置项表格场景 — 表头 + 数据行，逐行飞入。
 */
export const ConfigTableScene: React.FC<SceneProps> = ({
  title,
  table,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headers = table?.headers || [];
  const rows = table?.rows || [];

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
            marginBottom: 40,
            borderLeft: "4px solid #06b6d4",
            paddingLeft: 24,
          }}
        >
          {title}
        </h2>
      )}

      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* 表头 */}
        <div
          style={{
            display: "flex",
            background: "rgba(6,182,212,0.15)",
            borderBottom: "2px solid rgba(6,182,212,0.3)",
          }}
        >
          {headers.map((header, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "16px 24px",
                fontSize: 24,
                fontWeight: 700,
                color: "#06b6d4",
                fontFamily: "monospace",
              }}
            >
              {header}
            </div>
          ))}
        </div>

        {/* 数据行 */}
        {rows.map((row, rowIndex) => {
          const rowFrame = Math.max(0, frame - rowIndex * ROW_STAGGER);
          const rowSpring = spring({
            frame: rowFrame,
            fps,
            config: { damping: 18, stiffness: 80 },
          });
          if (rowFrame <= 0 && rowIndex > 0) return null;

          return (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                background:
                  rowIndex % 2 === 0
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(255,255,255,0.04)",
                opacity: rowSpring,
                transform: `translateX(${(1 - rowSpring) * -30}px)`,
              }}
            >
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    fontSize: 22,
                    fontWeight: cellIndex === 0 ? 600 : 400,
                    color:
                      cellIndex === 0
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.7)",
                    fontFamily: cellIndex === 1 ? "monospace" : "inherit",
                    borderRight:
                      cellIndex < row.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}
                >
                  {cell}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
