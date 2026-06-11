# 场景模板参考

## 概述

doc-to-video 使用 10 个预编译的 Remotion 场景模板。AI（编排层）根据文档内容自动匹配最合适的模板，不生成 React 代码。

## 模板列表

### 1. TitleScene
- **用途**: 开场标题
- **匹配**: H1 标题 或 强制作为第一个场景
- **props**: `title`, `subtitle`
- **动画**: 标题弹性缩放 + 副标题延迟淡入
- **配色**: 白字 + 紫色装饰线

### 2. BulletScene
- **用途**: 要点列表
- **匹配**: 无序列表、默认段落的兜底模板
- **props**: `title`, `items`
- **动画**: 逐条从左侧飞入，错开延迟
- **配色**: 左侧紫色边框 + 渐变 bullet

### 3. StepScene
- **用途**: 操作步骤
- **匹配**: 有序列表
- **props**: `title`, `items`
- **动画**: 绿色编号方块 + 文字从下方升起
- **配色**: 绿色步骤编号

### 4. CodeScene
- **用途**: 代码展示
- **匹配**: 代码块（```）
- **props**: `title`, `code`, `language`
- **动画**: 代码块缩放入场 + 逐行高亮出现
- **配色**: 终端深色背景 + 黄色高亮行

### 5. ConfigTableScene
- **用途**: 配置项表格
- **匹配**: Markdown 表格
- **props**: `title`, `table` (headers, rows)
- **动画**: 表头固定 + 数据行逐行飞入
- **配色**: 青色表头

### 6. StatsScene
- **用途**: 统计数据展示
- **匹配**: 内容含百分比或数字统计
- **props**: `title`, `stats` (label, value)
- **动画**: 数字从中心弹性弹出
- **配色**: 紫粉渐变数字

### 7. BenefitsScene
- **用途**: 优势/好处列表
- **匹配**: 含"为什么/优势/好处/收益"关键词
- **props**: `title`, `items`
- **动画**: 2 列网格，缩放 + 上浮入场
- **配色**: 金色渐变标题 + emoji 图标

### 8. CompareScene
- **用途**: 前后对比
- **匹配**: 含"旧/新/对比/区别/之前/之后"关键词
- **props**: `title`, `compare` (left/right: title + items)
- **动画**: 左栏右栏分别从两侧滑入 + 分隔线生长
- **配色**: 左侧红色 + 右侧绿色

### 9. QuoteScene
- **用途**: 引用
- **匹配**: blockquote
- **props**: `title`, `quote`, `quoteAuthor`
- **动画**: 大引号 + 引用文字淡入 + 作者延迟出现
- **配色**: 半透明紫色引号

### 10. OutroScene
- **用途**: 结尾总结
- **匹配**: 含"总结/小结/回顾"关键词 或 强制作为最后一个场景
- **props**: `title`, `subtitle`, `items`
- **动画**: 装饰环缩放 + 标题 + 总结点逐条出现
- **配色**: 紫色环 + 白字

## 匹配优先级

```
1. CodeScene      — 代码块存在时最高优先级
2. ConfigTableScene — 表格
3. StepScene       — 有序列表
4. BulletScene     — 无序列表
5. QuoteScene      — blockquote
6. StatsScene      — 百分比/数字
7. BenefitsScene   — 关键词匹配
8. CompareScene    — 关键词匹配
9. TitleScene      — 开场（强制）
10. OutroScene     — 结尾（强制）
```

## Props 接口

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

## 扩展指南

添加新模板的步骤：
1. 在 `src/components/scenes/` 创建新的 `.tsx` 文件
2. 实现 `SceneProps` 接口
3. 在 SKILL.md 的匹配规则表中注册
4. 更新 `Composition.tsx` 中的场景组件映射

每个模板组件应自行处理入场/退场动画（前 30 帧入场，最后 30 帧淡出）。
