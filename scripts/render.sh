#!/bin/bash
# Stage 6 — 渲染 Remotion 项目输出 MP4
# 用法: ./scripts/render.sh <remotion-project-dir> [output-path]

set -e

PROJECT_DIR="${1:-workdir/remotion-project}"
OUTPUT="${2:-workdir/out/video.mp4}"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "错误: 项目目录不存在: $PROJECT_DIR"
  exit 1
fi

echo "🎬 开始渲染..."
echo "  项目: $PROJECT_DIR"
echo "  输出: $OUTPUT"

# 确保输出目录存在
mkdir -p "$(dirname "$OUTPUT")"

cd "$PROJECT_DIR"

# 安装依赖（如果 node_modules 不存在）
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 渲染
npx remotion render Reel "$OUTPUT"

echo ""
echo "✅ 渲染完成: $OUTPUT"
