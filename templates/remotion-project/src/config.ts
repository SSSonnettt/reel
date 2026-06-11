import { ProductionPlan, SceneDefinition } from "./types";

/**
 * 视频配置 — 由 Stage 5 Compositor 根据 ProductionPlan 自动生成。
 *
 * 此文件在模板中以占位形式存在，实际构建时被覆盖。
 * 手动开发调试时可修改下方的 SCENES 数组来预览单个场景。
 */

// 默认生产计划（占位，运行时由 Compositor 覆盖）
export const PRODUCTION_PLAN: ProductionPlan = {
  title: "未命名视频",
  fps: 30,
  width: 1920,
  height: 1080,
  scenes: [],
  totalFrames: 0,
};

// 便捷访问
export const SCENES: SceneDefinition[] = PRODUCTION_PLAN.scenes;
export const VIDEO_TITLE: string = PRODUCTION_PLAN.title;
export const TOTAL_FRAMES: number = PRODUCTION_PLAN.totalFrames;
export const FPS: number = PRODUCTION_PLAN.fps;
export const WIDTH: number = PRODUCTION_PLAN.width;
export const HEIGHT: number = PRODUCTION_PLAN.height;
