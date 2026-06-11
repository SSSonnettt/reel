#!/usr/bin/env python3
"""
语音合成脚本 — 使用 Edge TTS 将文本转为 MP3 音频 + SRT 字幕。

依赖: pip install edge-tts

用法:
  python3 generate-voiceover.py \\
    --text "大家好，今天我们来聊聊..." \\
    --output-audio assets/audio/scene-001.mp3 \\
    --output-srt assets/srt/scene-001.srt \\
    [--voice zh-CN-XiaoxiaoNeural] \\
    [--rate +10%]
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("错误: 请先安装 edge-tts: pip install edge-tts")
    sys.exit(1)


# 中文语音选项
VOICES = {
    "xiaoxiao": "zh-CN-XiaoxiaoNeural",       # 女声，活泼
    "yunxi": "zh-CN-YunxiNeural",             # 男声，沉稳
    "yunjian": "zh-CN-YunjianNeural",         # 男声，新闻
    "xiaoyi": "zh-CN-XiaoyiNeural",           # 女声，温柔
    "yunyang": "zh-CN-YunyangNeural",         # 男声，专业
    "xiaochen": "zh-CN-XiaochenNeural",       # 女声，知性
}


async def generate(
    text: str,
    output_audio: str,
    output_srt: str,
    voice: str = "zh-CN-XiaoxiaoNeural",
    rate: str = "+5%",
) -> None:
    """生成 TTS 音频和字幕"""

    # 确保输出目录存在
    Path(output_audio).parent.mkdir(parents=True, exist_ok=True)
    Path(output_srt).parent.mkdir(parents=True, exist_ok=True)

    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate,
    )

    # 生成字幕
    submaker = edge_tts.SubMaker()
    with open(output_audio, "wb") as audio_file:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_file.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                submaker.create_sub(
                    (chunk["offset"], chunk["duration"]), chunk["text"]
                )

    # 写出 SRT 字幕
    with open(output_srt, "w", encoding="utf-8") as srt_file:
        srt_file.write(submaker.generate_subs())

    # 验证输出
    audio_size = os.path.getsize(output_audio)
    srt_size = os.path.getsize(output_srt)
    print(f"✅ 音频: {output_audio} ({audio_size / 1024:.1f} KB)")
    print(f"✅ 字幕: {output_srt} ({srt_size} bytes)")


async def main():
    parser = argparse.ArgumentParser(
        description="Edge TTS 语音合成 — 生成 MP3 和 SRT"
    )
    parser.add_argument(
        "--text", "-t", required=True, help="要合成的文本"
    )
    parser.add_argument(
        "--output-audio", "-a", required=True, help="输出音频文件路径 (.mp3)"
    )
    parser.add_argument(
        "--output-srt", "-s", required=True, help="输出字幕文件路径 (.srt)"
    )
    parser.add_argument(
        "--voice", "-v",
        default="zh-CN-XiaoxiaoNeural",
        help=f"语音名称 (默认: zh-CN-XiaoxiaoNeural). 可用: {', '.join(VOICES.keys())}"
    )
    parser.add_argument(
        "--rate", "-r",
        default="+5%",
        help="语速调整 (默认: +5%%, 如 -10%%, +20%%)"
    )

    args = parser.parse_args()

    # 解析简化语音名
    voice = VOICES.get(args.voice, args.voice)

    print(f"🎤 语音: {voice}")
    print(f"📝 文本长度: {len(args.text)} 字")
    print(f"⚡ 语速: {args.rate}")

    await generate(
        text=args.text.strip(),
        output_audio=args.output_audio,
        output_srt=args.output_srt,
        voice=voice,
        rate=args.rate,
    )


if __name__ == "__main__":
    asyncio.run(main())
