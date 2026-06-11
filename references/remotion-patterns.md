# Remotion 最佳实践

## 项目结构

```
remotion-project/
├── package.json
├── tsconfig.json
├── src/
│   ├── Root.tsx              # 入口 — 注册 Composition
│   ├── Composition.tsx       # 主合成 — 场景编排
│   ├── config.ts             # 配置 — 场景数据（由 Compositor 生成）
│   ├── types.ts              # TypeScript 类型定义
│   └── components/
│       ├── Background.tsx    # 背景组件
│       ├── SubtitleOverlay.tsx  # 字幕叠加
│       └── scenes/           # 10 个场景模板
│           ├── TitleScene.tsx
│           ├── BulletScene.tsx
│           ├── StepScene.tsx
│           ├── CodeScene.tsx
│           ├── ConfigTableScene.tsx
│           ├── StatsScene.tsx
│           ├── BenefitsScene.tsx
│           ├── CompareScene.tsx
│           ├── QuoteScene.tsx
│           └── OutroScene.tsx
└── output/                   # 渲染输出
```

## 核心概念

### Composition 注册

在 `Root.tsx` 中注册一个 Composition，指定 ID、组件、时长、FPS、分辨率：

```tsx
<Composition
  id="Reel"
  component={VideoComposition}
  durationInFrames={totalFrames}
  fps={30}
  width={1920}
  height={1080}
/>
```

### Sequence 时间编排

使用 `<Sequence>` 将每个场景放在正确的时间段：

```tsx
{scenes.map((scene, index) => (
  <Sequence
    key={scene.id}
    from={startFrame}    // 场景开始的帧号
    durationInFrames={scene.durationInFrames}
  >
    <SceneComponent {...scene.propsJson} />
  </Sequence>
))}
```

### 动画 — spring()

使用 Remotion 的 `spring()` 函数创建物理弹跳动画：

```tsx
const opacity = spring({
  frame,                    // 当前帧
  fps,                      // 帧率
  config: {
    damping: 15,            // 阻尼（越大弹跳越少）
    stiffness: 80,          // 刚度（越大越快）
  },
});
```

常用配置：
- 标题入场: `{ damping: 12, stiffness: 100 }` — 快速弹性
- 列表项入场: `{ damping: 15, stiffness: 80 }` — 平滑飞入
- 数字弹跳: `{ damping: 10, stiffness: 100, mass: 0.8 }` — 大幅弹跳

### 音频

```tsx
<Audio src={audioFile} />
```

音频文件放在 `public/` 目录或使用绝对路径。Stage 5 会将音频路径写入 `audioFile` 字段。

### 字幕

使用 `SubtitleOverlay` 组件，传入解析好的 `SubtitleEntry[]`：

```tsx
<SubtitleOverlay entries={subtitleEntries} />
```

SRT 解析由 `parseSRT()` 工具函数处理。

## 渲染命令

```bash
# 开发预览
npx remotion studio

# 渲染输出
npx remotion render Reel out/video.mp4

# 指定质量
npx remotion render Reel out/video.mp4 --crf 18

# 渲染指定范围
npx remotion render Reel out/video.mp4 --frames=0-300
```

## 性能注意事项

1. **避免在 render 中做重计算**: 使用 `useMemo` 缓存计算结果
2. **Sequence 要精确**: `from` + `durationInFrames` 不能超出 Composition 的 `durationInFrames`
3. **AbsoluteFill**: 使用 `<AbsoluteFill>` 让组件填满整个视频区域
4. **不要用 CSS transitions**: 使用 Remotion 的 `spring()` 或 `interpolate()` 保持帧精确

## 视频规格

- 分辨率: 1920×1080 (Full HD)
- 帧率: 30 fps
- 编码: H.264
- 容器: MP4
