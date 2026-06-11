import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { SubtitleEntry } from "../types";

interface SubtitleOverlayProps {
  /** 直接传入解析好的字幕条目 */
  entries?: SubtitleEntry[];
  /** 字幕位置偏移（px），默认距底部 80px */
  bottomOffset?: number;
  /** 字体大小 */
  fontSize?: number;
}

/**
 * SRT 字幕解析器 — 将 SRT 文本解析为 SubtitleEntry 数组
 */
export function parseSRT(srtText: string): SubtitleEntry[] {
  const blocks = srtText.trim().split(/\n\s*\n/);
  const entries: SubtitleEntry[] = [];

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    const index = parseInt(lines[0], 10);
    const timeLine = lines[1];
    const text = lines.slice(2).join("\n");

    const timeMatch = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!timeMatch) continue;

    const startMs =
      parseInt(timeMatch[1]) * 3600000 +
      parseInt(timeMatch[2]) * 60000 +
      parseInt(timeMatch[3]) * 1000 +
      parseInt(timeMatch[4]);
    const endMs =
      parseInt(timeMatch[5]) * 3600000 +
      parseInt(timeMatch[6]) * 60000 +
      parseInt(timeMatch[7]) * 1000 +
      parseInt(timeMatch[8]);

    entries.push({
      index,
      startTime: `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]},${timeMatch[4]}`,
      endTime: `${timeMatch[5]}:${timeMatch[6]}:${timeMatch[7]},${timeMatch[8]}`,
      startMs,
      endMs,
      text,
    });
  }

  return entries;
}

/**
 * 字幕叠加组件。
 * 根据当前帧匹配并显示对应的字幕文本。
 */
export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  entries: propEntries,
  bottomOffset = 80,
  fontSize = 36,
}) => {
  const frame = useCurrentFrame();
  const fps = 30;
  const currentMs = (frame / fps) * 1000;

  const entries = propEntries || [];

  const currentText = useMemo(() => {
    if (entries.length === 0) return null;
    const match = entries.find(
      (e) => currentMs >= e.startMs && currentMs <= e.endMs
    );
    return match?.text || null;
  }, [entries, currentMs]);

  if (!currentText) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "85%",
        textAlign: "center",
        fontSize,
        fontWeight: 600,
        color: "#ffffff",
        textShadow:
          "0 2px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)",
        lineHeight: 1.6,
        letterSpacing: "0.02em",
        pointerEvents: "none",
        zIndex: 100,
        padding: "12px 24px",
        borderRadius: 8,
        background: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(4px)",
      }}
    >
      {currentText}
    </div>
  );
};
