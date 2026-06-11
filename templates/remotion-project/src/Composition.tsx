import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Audio } from "remotion";
import { Background } from "./components/Background";
import { SubtitleOverlay, parseSRT } from "./components/SubtitleOverlay";
import { SceneDefinition, SubtitleEntry } from "./types";

// 动态场景组件映射 — 由 Compositor (Stage 5) 在组装时注入 import
const SCENE_COMPONENTS: Record<string, React.ComponentType<any>> = {};

interface VideoCompositionProps {
  title: string;
  scenes: SceneDefinition[];
  fps: number;
  width: number;
  height: number;
}

/**
 * 主视频合成组件。
 * 将所有场景按 Sequence 顺序排列，每个场景在其时间段内播放。
 */
export const VideoComposition: React.FC<VideoCompositionProps> = ({
  title,
  scenes,
  fps,
}) => {
  const frame = useCurrentFrame();

  // 构建帧偏移映射
  const sceneOffsets = useMemo(() => {
    const offsets: { sceneId: string; startFrame: number; endFrame: number }[] = [];
    let currentFrame = 0;
    for (const scene of scenes) {
      offsets.push({
        sceneId: scene.id,
        startFrame: currentFrame,
        endFrame: currentFrame + scene.durationInFrames,
      });
      currentFrame += scene.durationInFrames;
    }
    return offsets;
  }, [scenes]);

  const activeSceneOffset = useMemo(() => {
    return sceneOffsets.find(
      (s) => frame >= s.startFrame && frame < s.endFrame
    );
  }, [sceneOffsets, frame]);

  return (
    <AbsoluteFill>
      {/* 全局背景 */}
      <Background />

      {/* 场景序列 */}
      {scenes.map((scene, index) => {
        const offset = sceneOffsets[index];
        const SceneComponent =
          SCENE_COMPONENTS[scene.templateFile.replace(".tsx", "")];

        return (
          <Sequence
            key={scene.id}
            from={offset.startFrame}
            durationInFrames={scene.durationInFrames}
          >
            {/* 场景音频 */}
            {scene.audioFile && <Audio src={scene.audioFile} />}

            {/* 场景组件 */}
            {SceneComponent ? (
              <SceneComponent
                {...scene.propsJson}
                durationInFrames={scene.durationInFrames}
                audioSrc={scene.audioFile}
                srtSrc={scene.srtFile}
              />
            ) : (
              <ScenePlaceholder
                name={scene.templateFile}
                props={scene.propsJson}
              />
            )}

            {/* 场景级字幕 */}
            {scene.srtFile && (
              <SceneSubtitleOverlay srtFile={scene.srtFile} fps={fps} />
            )}
          </Sequence>
        );
      })}

      {/* 帧计数指示器（调试用） */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
          fontFamily: "monospace",
          pointerEvents: "none",
          zIndex: 200,
        }}
      >
        {frame} / {sceneOffsets[sceneOffsets.length - 1]?.endFrame || 0} |{" "}
        {activeSceneOffset?.sceneId || "idle"}
      </div>
    </AbsoluteFill>
  );
};

/**
 * 场景占位 — 当模板组件未注册时显示调试信息
 */
const ScenePlaceholder: React.FC<{
  name: string;
  props: Record<string, unknown>;
}> = ({ name, props }) => (
  <AbsoluteFill
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ff6b6b",
      fontFamily: "monospace",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 24, marginBottom: 12 }}>⚠ 未找到场景组件</div>
    <div style={{ fontSize: 18, opacity: 0.8 }}>{name}</div>
    <pre
      style={{
        fontSize: 12,
        opacity: 0.5,
        marginTop: 16,
        maxWidth: "80%",
        overflow: "auto",
      }}
    >
      {JSON.stringify(props, null, 2)}
    </pre>
  </AbsoluteFill>
);

/**
 * 场景级字幕叠加 — 从 SRT 文件加载
 */
const SceneSubtitleOverlay: React.FC<{ srtFile: string; fps: number }> = ({
  srtFile,
}) => {
  const [entries, setEntries] = React.useState<SubtitleEntry[]>([]);

  React.useEffect(() => {
    fetch(srtFile)
      .then((r) => r.text())
      .then((text) => setEntries(parseSRT(text)))
      .catch(() => {
        // SRT 加载失败，静默降级
      });
  }, [srtFile]);

  if (entries.length === 0) return null;
  return <SubtitleOverlay entries={entries} />;
};
