# TTS 环境配置指南

## Edge TTS（默认，免费）

Edge TTS 是微软 Edge 浏览器的文本转语音引擎，提供高质量的神经网络中文语音，免费使用。

### 安装

```bash
pip install edge-tts
```

### 验证安装

```bash
python3 -c "import edge_tts; print('Edge TTS 已就绪')"
```

### 可用中文语音

| 简称 | 完整名称 | 风格 | 推荐场景 |
|------|---------|------|---------|
| `xiaoxiao` | zh-CN-XiaoxiaoNeural | 女声，活泼 | 教程/讲解 |
| `yunxi` | zh-CN-YunxiNeural | 男声，沉稳 | 技术讲解 |
| `yunjian` | zh-CN-YunjianNeural | 男声，新闻 | 叙述/新闻 |
| `xiaoyi` | zh-CN-XiaoyiNeural | 女声，温柔 | 品牌宣传 |
| `yunyang` | zh-CN-YunyangNeural | 男声，专业 | 专业培训 |
| `xiaochen` | zh-CN-XiaochenNeural | 女声，知性 | 知识分享 |

### 基本用法

```bash
# 单条生成
python3 scripts/generate-voiceover.py \
  --text "大家好，欢迎收看本教程。" \
  --output-audio workdir/assets/audio/scene-001.mp3 \
  --output-srt workdir/assets/srt/scene-001.srt \
  --voice xiaoxiao \
  --rate +5%

# 批量生成（从 ProductionPlan）
python3 scripts/generate-voiceover-batch.py \
  --plan workdir/production-plan.json \
  --workdir workdir \
  --voice xiaoxiao
```

### 语速调整

- `+0%` — 正常语速
- `+10%` — 稍快（推荐教程用）
- `+20%` — 快速
- `-10%` — 稍慢

中文推荐 `+5%` ~ `+10%`，听感自然不拖沓。

## 备选 TTS 方案

### ElevenLabs（高质量付费）

```bash
pip install elevenlabs
```

需设置 API key: `export ELEVENLABS_API_KEY=xxx`

### OpenAI TTS（付费）

```bash
pip install openai
```

需设置 API key: `export OPENAI_API_KEY=xxx`

## TTS Provider 实现模式

如需添加新的 TTS Provider，实现以下接口：

```python
class TTSProvider:
    async def generate(self, text: str) -> dict:
        """返回 {"audio": bytes, "subtitles": str}"""
        pass
```

并在 `generate-voiceover.py` 中注册。
