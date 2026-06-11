/**
 * Compositor (Stage 5) — 从模板 + ProductionPlan 组装 Remotion 项目。
 *
 * 用法:
 *   npx ts-node scripts/compositor.ts --plan workdir/production-plan.json --out workdir/remotion-project
 *
 * 流程:
 *   1. 复制 Remotion 项目模板
 *   2. 生成 config.ts（填充场景数据）
 *   3. 生成 Composition.tsx（注入场景组件 import）
 *   4. 只复制用到的场景组件到项目中
 */

import * as fs from "fs";
import * as path from "path";

// ============================================================
// 类型定义
// ============================================================
interface SceneDefinition {
  id: string;
  templateFile: string;
  propsJson: Record<string, unknown>;
  audioFile: string;
  srtFile: string;
  durationInFrames: number;
}

interface ProductionPlan {
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: SceneDefinition[];
  totalFrames: number;
}

// ============================================================
// 工具函数
// ============================================================
function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function generateConfig(plan: ProductionPlan): string {
  const planJson = JSON.stringify(plan, null, 2)
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");

  return `/**
 * 视频配置 — 由 Compositor (Stage 5) 自动生成。
 * 来源: production-plan.json
 */

import { ProductionPlan, SceneDefinition } from "./types";

export const PRODUCTION_PLAN: ProductionPlan = ${JSON.stringify(plan, null, 2)};

export const SCENES: SceneDefinition[] = PRODUCTION_PLAN.scenes;
export const VIDEO_TITLE: string = PRODUCTION_PLAN.title;
export const TOTAL_FRAMES: number = PRODUCTION_PLAN.totalFrames;
export const FPS: number = PRODUCTION_PLAN.fps;
export const WIDTH: number = PRODUCTION_PLAN.width;
export const HEIGHT: number = PRODUCTION_PLAN.height;
`;
}

function generateComposition(plan: ProductionPlan): string {
  // 提取用到的模板文件（去重）
  const templates = [...new Set(plan.scenes.map((s) => s.templateFile))];
  const componentNames = templates.map((t) => t.replace(".tsx", ""));

  // 生成 import 语句
  const imports = templates
    .map((t, i) => {
      const name = componentNames[i];
      return `import { ${name} } from "./components/scenes/${t}";`;
    })
    .join("\n");

  // 生成 SCENE_COMPONENTS 映射
  const mappingEntries = componentNames
    .map((name) => `  "${name}": ${name},`)
    .join("\n");

  return `import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, Audio } from "remotion";
import { Background } from "./components/Background";
import { SubtitleOverlay, parseSRT } from "./components/SubtitleOverlay";
import { SceneDefinition, SubtitleEntry } from "./types";

${imports}

// 场景组件映射 — 由 Compositor 自动生成
const SCENE_COMPONENTS: Record<string, React.ComponentType<any>> = {
${mappingEntries}
};

interface VideoCompositionProps {
  title: string;
  scenes: SceneDefinition[];
  fps: number;
  width: number;
  height: number;
}

export const VideoComposition: React.FC<VideoCompositionProps> = ({
  title,
  scenes,
  fps,
}) => {
  const frame = useCurrentFrame();

  const sceneOffsets = useMemo(() => {
    const offsets: { sceneId: string; startFrame: number; endFrame: number }[] = [];
    let currentFrame = 0;
    for (const scene of scenes) {
      offsets.push({
        sceneId: scene.id,
        startFrame: currentFrame,
        endFrame: currentFrame + scene.durationInFrames,
      });
      currentFrame += scene.durationInFrames;
    }
    return offsets;
  }, [scenes]);

  const activeSceneOffset = useMemo(() => {
    return sceneOffsets.find(
      (s) => frame >= s.startFrame && frame < s.endFrame
    );
  }, [sceneOffsets, frame]);

  return (
    <AbsoluteFill>
      <Background />

      {scenes.map((scene, index) => {
        const offset = sceneOffsets[index];
        const SceneComponent =
          SCENE_COMPONENTS[scene.templateFile.replace(".tsx", "")];

        return (
          <Sequence
            key={scene.id}
            from={offset.startFrame}
            durationInFrames={scene.durationInFrames}
          >
            {scene.audioFile && <Audio src={scene.audioFile} />}

            {SceneComponent ? (
              <SceneComponent
                {...scene.propsJson}
                durationInFrames={scene.durationInFrames}
                audioSrc={scene.audioFile}
                srtSrc={scene.srtFile}
              />
            ) : (
              <ScenePlaceholder
                name={scene.templateFile}
                props={scene.propsJson}
              />
            )}

            {scene.srtFile && (
              <SceneSubtitleOverlay srtFile={scene.srtFile} fps={fps} />
            )}
          </Sequence>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          fontSize: 12,
          color: "rgba(255,255,255,0.3)",
          fontFamily: "monospace",
          pointerEvents: "none",
          zIndex: 200,
        }}
      >
        {frame} / {sceneOffsets[sceneOffsets.length - 1]?.endFrame || 0} |{" "}
        {activeSceneOffset?.sceneId || "idle"}
      </div>
    </AbsoluteFill>
  );
};

const ScenePlaceholder: React.FC<{
  name: string;
  props: Record<string, unknown>;
}> = ({ name, props }) => (
  <AbsoluteFill
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ff6b6b",
      fontFamily: "monospace",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 24, marginBottom: 12 }}>⚠ 未找到场景组件</div>
    <div style={{ fontSize: 18, opacity: 0.8 }}>{name}</div>
    <pre
      style={{
        fontSize: 12,
        opacity: 0.5,
        marginTop: 16,
        maxWidth: "80%",
        overflow: "auto",
      }}
    >
      {JSON.stringify(props, null, 2)}
    </pre>
  </AbsoluteFill>
);

const SceneSubtitleOverlay: React.FC<{ srtFile: string; fps: number }> = ({
  srtFile,
}) => {
  const [entries, setEntries] = React.useState<SubtitleEntry[]>([]);

  React.useEffect(() => {
    fetch(srtFile)
      .then((r) => r.text())
      .then((text) => setEntries(parseSRT(text)))
      .catch(() => {});
  }, [srtFile]);

  if (entries.length === 0) return null;
  return <SubtitleOverlay entries={entries} />;
};
`;
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const planIdx = args.indexOf("--plan");
  const outIdx = args.indexOf("--out");

  if (planIdx === -1 || outIdx === -1) {
    console.error("用法: npx ts-node compositor.ts --plan <plan.json> --out <dir>");
    process.exit(1);
  }

  const planPath = args[planIdx + 1];
  const outDir = args[outIdx + 1];
  const templateDir = path.resolve(__dirname, "..", "templates", "remotion-project");

  // 1. 读取 ProductionPlan
  const plan: ProductionPlan = JSON.parse(
    fs.readFileSync(planPath, "utf-8")
  );
  console.log(`📋 生产计划: "${plan.title}" — ${plan.scenes.length} 个场景`);

  // 2. 复制项目模板（排除 scenes 目录和将被覆盖的文件）
  console.log("📁 复制项目模板...");
  fs.mkdirSync(outDir, { recursive: true });

  // 复制除了 scenes 和 config.ts、Composition.tsx 以外的所有文件
  for (const entry of fs.readdirSync(templateDir, { withFileTypes: true })) {
    const src = path.join(templateDir, entry.name);
    const dest = path.join(outDir, entry.name);

    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "output") {
      continue;
    }

    if (entry.isDirectory()) {
      if (entry.name === "src") {
        // 复制 src 但排除 scenes 目录
        copyDirExcluding(src, dest, ["scenes"]);
      } else {
        copyDir(src, dest);
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // 3. 创建 scenes 目录并只复制用到的模板
  const neededTemplates = new Set(plan.scenes.map((s) => s.templateFile));
  const scenesSrc = path.join(templateDir, "src", "components", "scenes");
  const scenesDest = path.join(outDir, "src", "components", "scenes");
  fs.mkdirSync(scenesDest, { recursive: true });

  console.log(`📋 需要的模板: ${[...neededTemplates].join(", ")}`);
  for (const template of neededTemplates) {
    const srcFile = path.join(scenesSrc, template);
    const destFile = path.join(scenesDest, template);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`  ✅ ${template}`);
    } else {
      console.warn(`  ⚠️ ${template} 不存在于模板库中`);
    }
  }

  // 4. 生成 config.ts
  const configContent = generateConfig(plan);
  fs.writeFileSync(path.join(outDir, "src", "config.ts"), configContent, "utf-8");
  console.log("✅ 生成 config.ts");

  // 5. 生成 Composition.tsx（含动态 import）
  const compositionContent = generateComposition(plan);
  fs.writeFileSync(
    path.join(outDir, "src", "Composition.tsx"),
    compositionContent,
    "utf-8"
  );
  console.log("✅ 生成 Composition.tsx");

  console.log(`\n🎬 项目已组装到: ${outDir}`);
  console.log("下一步:");
  console.log(`  cd ${outDir} && npm install && npm run dev`);
}

function copyDirExcluding(src: string, dest: string, exclude: string[]): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirExcluding(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main().catch((err) => {
  console.error("❌ Compositor 失败:", err);
  process.exit(1);
});
