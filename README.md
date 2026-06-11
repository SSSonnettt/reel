# 🎬 Reel

将 Markdown 文档或 URL 转换为带配音和字幕的 Remotion 教程视频。

## 项目简介

Reel 是一个自动化视频生成工具，通过多阶段流水线将技术文档转换为专业的教程视频。核心特点：

- **AI 驱动的内容解析**：自动解析 Markdown 结构，匹配最佳视觉场景
- **TTS 配音**：使用 Edge TTS 生成中文神经网络语音
- **SRT 字幕**：自动生成时间轴精确的字幕文件
- **Remotion 渲染**：基于 React 的视频渲染引擎，输出 1920×1080 @ 30fps 高清视频
- **模板化设计**：10 个预编译场景模板，AI 只选择模板和填充参数，不生成 React 代码

## 安装步骤

### 前置要求

- Node.js >= 18
- Python 3.8+
- npm 或 pnpm

### 1. 克隆项目

```bash
git clone git@github.com:SSSonnettt/reel.git
cd reel
```

### 2. 安装 Python 依赖

```bash
pip install edge-tts
```

### 3. 验证安装

```bash
# 测试 TTS
python3 scripts/generate-voiceover.py --text "测试配音" --output-audio test.mp3 --output-srt test.srt
```

## 使用方法

### 快速开始

Reel 提供了一套完整的流水线脚本，可以手动执行或通过 AI Agent 自动编排。

#### 1. 准备输入文档

创建一个 Markdown 文件，例如 `docs/my-tutorial.md`：

```markdown
# React Hooks 完全指南

React Hooks 彻底改变了我们编写组件的方式。

## 为什么使用 Hooks

- 更简洁的代码
- 更好的逻辑复用
- 避免组件层级过深

## useState 示例

```jsx
const [count, setCount] = useState(0);
```

## 对比传统方式

| 特性 | Class 组件 | Hooks |
|------|-----------|-------|
| 代码量 | 多 | 少 |
| 复用性 | 低 | 高 |
```

#### 2. 执行流水线

**方式 A：使用 AI Agent（推荐）**

在支持 Reel skill 的 AI 环境中：

```
/reel docs/my-tutorial.md
```

AI 将自动执行完整的六阶段流水线。

**方式 B：手动执行各阶段**

```bash
# Stage 1-3：由 AI 完成内容解析、分镜设计、生产计划
# 输出：workdir/storyboard.json, workdir/production-plan.json

# Stage 4：生成配音和字幕
python3 scripts/generate-voiceover-batch.py \
  --input workdir/production-plan.json \
  --output-dir workdir/assets

# Stage 5：组装 Remotion 项目
npx ts-node scripts/compositor.ts \
  --plan workdir/production-plan.json \
  --output workdir/remotion-project

# Stage 6：渲染视频
cd workdir/remotion-project
npm install
npx remotion render Composition ../out/video.mp4
```

#### 3. 查看输出

视频将输出到 `workdir/out/video.mp4`

## 核心架构

### 三层六阶段流水线

#### 编排层（Orchestration）

1. **Researcher**：解析 Markdown/URL → ContentManifest
2. **Screenwriter**：ContentManifest → Storyboard（需用户确认）
3. **Director**：Storyboard → ProductionPlan

#### 执行层（Execution）

4. **Asset Generator**：批量生成 TTS 配音（mp3）和字幕（srt）
5. **Compositor**：组装 Remotion 项目，注入场景数据
6. **Renderer**：渲染最终视频

### 场景模板库

Reel 提供 10 个预编译场景模板：

| 模板 | 用途 | 触发条件 |
|------|------|---------|
| `TitleScene` | 开场标题 | H1 标题（自动添加） |
| `CodeScene` | 代码展示 | 代码块存在 |
| `ConfigTableScene` | 配置表格 | Markdown 表格 |
| `StepScene` | 操作步骤 | 有序列表 |
| `BulletScene` | 要点列表 | 无序列表 / 段落兜底 |
| `QuoteScene` | 引用块 | blockquote |
| `StatsScene` | 数据统计 | 含百分比或数字 |
| `BenefitsScene` | 优势列表 | 含"优势/好处/收益" |
| `CompareScene` | 前后对比 | 含"对比/区别/之前/之后" |
| `OutroScene` | 结尾总结 | 含"总结/回顾"（自动添加） |

## 项目结构

```
reel/
├── SKILL.md                    # AI Skill 定义
├── templates/
│   └── remotion-project/       # Remotion 项目模板
│       ├── src/
│       │   ├── components/
│       │   │   ├── scenes/     # 10 个场景模板
│       │   │   ├── Background.tsx
│       │   │   └── SubtitleOverlay.tsx
│       │   ├── Composition.tsx
│       │   ├── Root.tsx
│       │   ├── config.ts
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── scripts/
│   ├── generate-voiceover.py       # TTS 配音生成
│   ├── generate-voiceover-batch.py # 批量配音生成
│   ├── compositor.ts               # 项目组装脚本
│   └── render.sh                   # 渲染脚本
├── references/
│   ├── scene-templates.md          # 场景模板文档
│   ├── tts-setup.md                # TTS 配置指南
│   └── remotion-patterns.md        # Remotion 最佳实践
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-06-11-doc-to-video-design.md
```

## 输出目录结构

执行流水线后，`workdir/` 将包含：

```
workdir/
├── content-manifest.json     # S1 输出：内容解析结果
├── storyboard.json           # S2 输出：分镜脚本（用户确认点）
├── production-plan.json      # S3 输出：生产计划
├── assets/
│   ├── audio/                # S4 输出：mp3 配音文件
│   └── srt/                  # S4 输出：srt 字幕文件
├── remotion-project/         # S5 组装：Remotion 项目
└── out/
    └── video.mp4             # S6 输出：最终视频
```

## 示例命令

### 生成单个场景配音

```bash
python3 scripts/generate-voiceover.py \
  --text "大家好，今天我们来聊聊 React Hooks" \
  --output-audio workdir/assets/audio/scene-001.mp3 \
  --output-srt workdir/assets/srt/scene-001.srt
```

### 批量生成所有场景配音

```bash
python3 scripts/generate-voiceover-batch.py \
  --input workdir/production-plan.json \
  --output-dir workdir/assets
```

### 手动渲染视频

```bash
cd workdir/remotion-project
npx remotion render Composition out/video.mp4 --frames=5400
```

### 预览 Remotion 项目

```bash
cd workdir/remotion-project
npm start
# 打开 http://localhost:3000
```

## 配置选项

### TTS 语音设置

编辑 `scripts/generate-voiceover.py`，修改语音参数：

```python
VOICE = "zh-CN-XiaoxiaoNeural"  # 中文女声
# VOICE = "zh-CN-YunxiNeural"  # 中文男声
RATE = "+0%"                    # 语速调整
PITCH = "+0Hz"                  # 音调调整
```

### 视频参数

固定配置（位于 `templates/remotion-project/src/config.ts`）：

- 分辨率：1920×1080
- 帧率：30fps
- 格式：MP4 (H.264)

## 约束与限制

- ✅ 所有文案使用中文
- ✅ 视频尺寸固定 1920×1080 @ 30fps
- ✅ 不生成 React 代码 — 只选择模板 + 填充参数
- ✅ 分镜必须经用户确认后才执行渲染
- ❌ Phase 1 不支持：AI 图像/视频生成、多语种、特效音效

## 开发指南

### 添加新场景模板

1. 在 `templates/remotion-project/src/components/scenes/` 创建组件
2. 实现统一的 `SceneProps` 接口
3. 在 `SKILL.md` 的匹配规则中添加触发条件
4. 更新 `references/scene-templates.md`

### 自定义 TTS 引擎

修改 `scripts/generate-voiceover.py`，替换为其他 TTS 服务（如 Azure TTS、Google Cloud TTS）。

## 技术栈

- **视频渲染**：Remotion (React)
- **TTS**：Edge TTS (Python)
- **编排**：TypeScript + Python
- **字幕**：SRT 格式

## License

MIT

## 相关链接

- [GitHub 仓库](https://github.com/SSSonnettt/reel)
- [Remotion 官方文档](https://www.remotion.dev/)
- [Edge TTS](https://github.com/rany2/edge-tts)
