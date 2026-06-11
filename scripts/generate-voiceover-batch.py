#!/usr/bin/env python3
"""
批量语音合成脚本 — 读取 ProductionPlan JSON，批量生成所有场景的 TTS 音频和字幕。

用法:
  python3 generate-voiceover-batch.py \\
    --plan workdir/production-plan.json \\
    --workdir workdir
"""

import argparse
import asyncio
import json
import sys


async def generate_all(plan_path: str, workdir: str, voice: str, rate: str):
    """读取 ProductionPlan 并批量生成音频"""

    # 动态导入（文件名含连字符, Python 不允许直接 import）
    import importlib.util
    import os
    spec = importlib.util.spec_from_file_location(
        "generate_voiceover",
        os.path.join(os.path.dirname(__file__), "generate-voiceover.py")
    )
    gv = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gv)
    generate = gv.generate

    with open(plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)

    scenes = plan.get("scenes", [])
    total = len(scenes)
    print(f"📋 共 {total} 个场景待处理\n")

    for i, scene in enumerate(scenes, 1):
        props = scene.get("propsJson", {})
        narration = props.get("narration", "")

        if not narration:
            print(f"⏭️ [{i}/{total}] {scene['id']} — 无配音文本，跳过")
            continue

        # 路径默认使用 ProductionPlan 中的配置
        audio_file = scene.get("audioFile", f"assets/audio/{scene['id']}.mp3")
        srt_file = scene.get("srtFile", f"assets/srt/{scene['id']}.srt")

        print(f"🎤 [{i}/{total}] {scene['id']} → {len(narration)} 字")
        await generate(
            text=narration,
            output_audio=f"{workdir}/{audio_file}",
            output_srt=f"{workdir}/{srt_file}",
            voice=voice,
            rate=rate,
        )
        print()

    print(f"✅ 全部完成! {total} 个场景处理完毕")


async def main():
    parser = argparse.ArgumentParser(description="批量 TTS 生成")
    parser.add_argument("--plan", required=True, help="ProductionPlan JSON 路径")
    parser.add_argument("--workdir", required=True, help="工作目录")
    parser.add_argument("--voice", default="zh-CN-XiaoxiaoNeural", help="语音")
    parser.add_argument("--rate", default="+5%", help="语速")
    args = parser.parse_args()

    await generate_all(args.plan, args.workdir, args.voice, args.rate)


if __name__ == "__main__":
    asyncio.run(main())
