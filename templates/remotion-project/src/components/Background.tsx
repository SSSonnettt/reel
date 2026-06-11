import React from "react";
import { AbsoluteFill } from "remotion";

interface BackgroundProps {
  /** 背景颜色，默认深色渐变 */
  bgColor?: string;
  /** 渐变方向 */
  gradient?: "to-br" | "to-b" | "to-r";
  /** 装饰圆点是否显示 */
  showDots?: boolean;
}

/**
 * 统一的视频背景组件。
 * 使用深色渐变 + 可选的装饰网格点。
 */
export const Background: React.FC<BackgroundProps> = ({
  bgColor,
  gradient = "to-br",
  showDots = true,
}) => {
  const gradientStyle: React.CSSProperties = (() => {
    if (bgColor) {
      return { backgroundColor: bgColor };
    }
    const stops: Record<string, string> = {
      "to-br": "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      "to-b": "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
      "to-r": "linear-gradient(90deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
    };
    return { background: stops[gradient] || stops["to-br"] };
  })();

  return (
    <AbsoluteFill style={gradientStyle}>
      {showDots && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}
      {/* 顶部光晕 */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "40%",
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
