// 场景模板统一 Props 接口
export interface SceneProps {
  // 核心内容（根据模板选择使用）
  title?: string;
  subtitle?: string;
  items?: string[];
  code?: string;
  language?: string;
  table?: { headers: string[]; rows: string[][] };
  stats?: { label: string; value: string }[];
  compare?: { left: { title: string; items: string[] }; right: { title: string; items: string[] } };
  quote?: string;
  quoteAuthor?: string;

  // 资源
  narration?: string;
  audioSrc?: string;
  srtSrc?: string;

  // 时长控制
  durationInFrames: number;

  // 样式覆盖（可选）
  style?: Record<string, unknown>;
}

// 生产计划中的单个场景定义
export interface SceneDefinition {
  id: string;
  templateFile: string;
  propsJson: Record<string, unknown>;
  audioFile: string;
  srtFile: string;
  durationInFrames: number;
}

// 完整生产计划
export interface ProductionPlan {
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: SceneDefinition[];
  totalFrames: number;
}

// 字幕条目
export interface SubtitleEntry {
  index: number;
  startTime: string;
  endTime: string;
  startMs: number;
  endMs: number;
  text: string;
}

// 视频配置常量
export const VIDEO_CONFIG = {
  FPS: 30,
  WIDTH: 1920,
  HEIGHT: 1080,
  DEFAULT_DURATION_SEC: 5,
} as const;
