import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "./Composition";
import { PRODUCTION_PLAN, TOTAL_FRAMES, FPS, WIDTH, HEIGHT } from "./config";

/**
 * Remotion 根组件 — 注册视频 Composition。
 *
 * 此文件在项目模板中保持稳定，通常不需要修改。
 * 视频参数由 config.ts 驱动，由 Compositor (Stage 5) 自动生成。
 */
export const Root: React.FC = () => {
  const scenes = PRODUCTION_PLAN.scenes;
  const totalFrames = scenes.length > 0 ? TOTAL_FRAMES : 30 * 5;
  const title = scenes.length > 0 ? PRODUCTION_PLAN.title : "未命名视频";

  return (
    <>
      <Composition
        id="DocToVideo"
        component={VideoComposition}
        durationInFrames={totalFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title,
          scenes,
          fps: FPS,
          width: WIDTH,
          height: HEIGHT,
        }}
      />
    </>
  );
};
