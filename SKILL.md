---
name: reel
description: 将 Markdown 文档或 URL 转换为带配音和字幕的 Remotion 教程视频,六阶段流水线自动编排
version: 1.0.0
---

# /reel

输入一篇 Markdown 文档或 URL，AI 执行多阶段流水线，生成带 TTS 配音和 SRT 字幕的 Remotion 视频。

## 触发方式

```
/reel <markdown-file | url>
```

## 核心理念

**LLM 从预建组件模板库中选择并填充参数，不生成 React 代码。**

渲染层由 10 个预编译的 Remotion 场景模板组成。AI 的职责是：
1. 解析文档结构
2. 匹配场景模板
3. 生成配音文案
4. 编排渲染参数
5. 触发渲染

## 流水线（三层六阶段）

### 编排层 (Orchestration)

**Stage 1 — Researcher**: 解析输入为结构化内容

给定 MD 文件路径或 URL，输出 `ContentManifest` JSON：

```json
{
  "title": "文档标题",
  "sections": [
    {
      "id": "section-1",
      "type": "heading" | "paragraph" | "list" | "code" | "table" | "blockquote",
      "title": "章节标题",
      "content": "原始内容",
      "children": []
    }
  ]
}
```

工作流程：
1. 如果是 URL → 用 WebFetch 获取内容，转为 Markdown
2. 解析 Markdown AST（标题、段落、列表、代码块、表格、引用）
3. 按标题层级分组为 sections
4. 输出 ContentManifest JSON 到 `workdir/content-manifest.json`

**Stage 2 — Screenwriter**: 内容 → 分镜脚本

输入 ContentManifest，输出 `Storyboard` JSON：

```json
{
  "title": "视频标题",
  "scenes": [
    {
      "id": "scene-001",
      "sectionId": "section-1",
      "template": "TitleScene",
      "props": {
        "title": "标题文字",
        "subtitle": "副标题",
        "durationInFrames": 150
      },
      "narration": "大家好，今天我们来聊聊...",
      "narrationDurationEst": 8.5,
      "durationInFrames": 270
    }
  ],
  "totalDurationInFrames": 5400,
  "estimatedDurationSec": 180
}
```

工作流程：
1. 为每个 section 匹配最合适的场景模板（见下方匹配规则）
2. 撰写口语化配音文案（中文，口播风格，句子短小）
3. 估算配音时长（中文约 3 字/秒，+ 20% 余量）
4. 添加 TitleScene 作为开场和 OutroScene 作为结尾
5. 输出 Storyboard JSON 到 `workdir/storyboard.json`

**⚠️ 分镜确认点**：输出分镜后，暂停，请用户确认或修改。用户确认后才进入 Stage 3。

**Stage 3 — Director**: 分镜 → 生产计划

输入 Storyboard，输出 `ProductionPlan` JSON：

```json
{
  "title": "视频标题",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "scenes": [
    {
      "id": "scene-001",
      "templateFile": "TitleScene.tsx",
      "propsJson": { "title": "标题文字", "subtitle": "副标题" },
      "audioFile": "assets/audio/scene-001.mp3",
      "srtFile": "assets/srt/scene-001.srt",
      "durationInFrames": 270
    }
  ],
  "totalFrames": 5400
}
```

工作流程：
1. 将 Storyboard 翻译为可执行的生产参数
2. 计算精确帧数（按 30fps + 配音时长）
3. 指定每个场景的模板文件和资源文件路径
4. 输出 ProductionPlan JSON 到 `workdir/production-plan.json`

### 执行层 (Execution)

**Stage 4 — Asset Generator**: 批量生成配音和字幕

工作流程：
1. 读取 ProductionPlan，收集所有 narration 文本
2. 调用 TTS 脚本批量生成 mp3 + srt
3. 输出到 `workdir/assets/audio/` 和 `workdir/assets/srt/`
4. 更新 ProductionPlan 中的音频/srt 路径

TTS 脚本调用：
```bash
python3 scripts/generate-voiceover.py \
  --text "配音文本" \
  --output-audio workdir/assets/audio/scene-001.mp3 \
  --output-srt workdir/assets/srt/scene-001.srt
```

**Stage 5 — Compositor**: 组装 Remotion 项目

工作流程：
1. 复制 Remotion 项目模板到 `workdir/remotion-project/`
2. 基于 ProductionPlan 生成 `config.ts`（场景数据）
3. 生成 `Composition.tsx`（场景编排）
4. 确保 `Root.tsx` 注册 Composition
5. 拷贝用到的模板组件到项目目录
6. 安装依赖：`cd workdir/remotion-project && npm install`

**Stage 6 — Renderer**: 渲染输出

```bash
cd workdir/remotion-project && \
  npx remotion render Composition out/video.mp4
```

输出 → `workdir/out/video.mp4`

## 场景模板匹配规则

按优先级从高到低匹配：

| 优先级 | 模板 | 匹配条件 |
|--------|------|---------|
| 1 | CodeScene | 代码块（```) 存在 |
| 2 | ConfigTableScene | Markdown 表格存在 |
| 3 | StepScene | 有序列表存在 |
| 4 | BulletScene | 无序列表存在 |
| 5 | QuoteScene | blockquote 存在 |
| 6 | StatsScene | 内容含百分比或统计数字 |
| 7 | BenefitsScene | 内容含"为什么/优势/好处/收益" |
| 8 | CompareScene | 内容含"旧/新/对比/区别/之前/之后" |
| 9 | TitleScene | H1 标题（作为开场） |
| 10 | OutroScene | 内容含"总结/小结/回顾" |
| — | BulletScene | 默认（段落兜底） |

## 模板库（10 个场景组件）

全部位于 `templates/remotion-project/src/components/scenes/`：

| 文件 | 用途 |
|------|------|
| `TitleScene.tsx` | 开场标题，居中大字 + 副标题 |
| `BenefitsScene.tsx` | 优势列表，图标 + 文字飞入 |
| `StepScene.tsx` | 操作步骤，编号 + 逐条出现 |
| `ConfigTableScene.tsx` | 配置项表格展示 |
| `StatsScene.tsx` | 数据/统计数字，大数字 + 标签 |
| `CompareScene.tsx` | 前后对比，双栏布局 |
| `CodeScene.tsx` | 代码展示，语法高亮 + 逐行 |
| `BulletScene.tsx` | 要点列表，bullet 动画 |
| `QuoteScene.tsx` | 引用，引号 + 斜体 |
| `OutroScene.tsx` | 结尾总结 + CTA |

每个模板接受统一的 Props 接口：

```ts
interface SceneProps {
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
  narration?: string;
  audioSrc?: string;
  srtSrc?: string;
  durationInFrames: number;
  style?: Record<string, unknown>;
}
```

## AI 工作目录约定

```
workdir/
├── content-manifest.json     # S1 输出
├── storyboard.json           # S2 输出（用户确认）
├── production-plan.json      # S3 输出
├── assets/
│   ├── audio/                # S4 输出 mp3
│   └── srt/                  # S4 输出 srt
├── remotion-project/         # S5 组装
└── out/
    └── video.mp4             # S6 最终输出
```

## 关于 TTS

默认使用 Edge TTS（免费，中文神经网络语音），Python 脚本位于 `scripts/generate-voiceover.py`，依赖 `edge-tts` 库。

## 参考文档

- `references/scene-templates.md`
- `references/tts-setup.md`
- `references/remotion-patterns.md`

## 约束

- 所有文案使用中文
- 视频尺寸固定 1920×1080 @ 30fps
- 不生成 React 代码 — 只选择模板 + 填充参数
- 分镜必须经用户确认后才执行渲染
- Phase 1 不做 AI 图像/视频生成、多语种、特效音效
