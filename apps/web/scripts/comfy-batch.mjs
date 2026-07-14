import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const artDir = join(here, "..", "public", "art");

const COMFY = process.env.COMFY_URL ?? "http://127.0.0.1:8188";
const CKPT = process.env.COMFY_CKPT;
const STEPS = Number(process.env.COMFY_STEPS ?? 30);
const CFG = Number(process.env.COMFY_CFG ?? 6.5);
const SAMPLER = process.env.COMFY_SAMPLER ?? "dpmpp_2m";
const SCHEDULER = process.env.COMFY_SCHEDULER ?? "karras";
const SQUARE = Number(process.env.COMFY_SQUARE ?? 1024);
const WIDE_W = Number(process.env.COMFY_WIDE_W ?? 1344);
const WIDE_H = Number(process.env.COMFY_WIDE_H ?? 768);
const ONLY = process.env.ONLY;

if (!CKPT) {
  console.error(
    "Set COMFY_CKPT to your checkpoint filename, e.g.\n" +
      "  COMFY_CKPT=juggernautXL_v9.safetensors node apps/web/scripts/comfy-batch.mjs\n" +
      "(it must exist in ComfyUI/models/checkpoints/)",
  );
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(artDir, "art-manifest.json"), "utf8"));
const template = JSON.parse(readFileSync(join(here, "comfy", "darkage.api.json"), "utf8"));
const clientId = `darkage-${STEPS}-${SQUARE}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function queuePrompt(graph) {
  const res = await fetch(`${COMFY}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: clientId }),
  });
  if (!res.ok) throw new Error(`/prompt ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.prompt_id;
}

async function waitForImage(promptId) {
  for (let i = 0; i < 600; i += 1) {
    const res = await fetch(`${COMFY}/history/${promptId}`);
    const hist = await res.json();
    const entry = hist[promptId];
    if (entry && entry.outputs) {
      for (const nodeId of Object.keys(entry.outputs)) {
        const imgs = entry.outputs[nodeId].images;
        if (imgs && imgs.length) return imgs[0];
      }
      if (entry.status?.status_str === "error") throw new Error("generation error");
    }
    await sleep(1000);
  }
  throw new Error("timeout waiting for image");
}

async function download(image) {
  const q = new URLSearchParams({
    filename: image.filename,
    subfolder: image.subfolder ?? "",
    type: image.type ?? "output",
  });
  const res = await fetch(`${COMFY}/view?${q}`);
  if (!res.ok) throw new Error(`/view ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function buildGraph(asset, index) {
  const graph = structuredClone(template);
  const wide = asset.category === "location";
  graph["4"].inputs.ckpt_name = CKPT;
  graph["5"].inputs.width = wide ? WIDE_W : SQUARE;
  graph["5"].inputs.height = wide ? WIDE_H : SQUARE;
  graph["6"].inputs.text = asset.prompt;
  graph["3"].inputs.seed = 100000 + index;
  graph["3"].inputs.steps = STEPS;
  graph["3"].inputs.cfg = CFG;
  graph["3"].inputs.sampler_name = SAMPLER;
  graph["3"].inputs.scheduler = SCHEDULER;
  graph["9"].inputs.filename_prefix = `darkage/${asset.slug}`;
  return graph;
}

const targets = manifest.assets.filter((a) => !ONLY || a.category === ONLY);
let done = 0;
let skipped = 0;
let failed = 0;

console.log(
  `ComfyUI batch: ${targets.length} images via ${COMFY} (ckpt: ${CKPT})\n`,
);

for (let i = 0; i < targets.length; i += 1) {
  const asset = targets[i];
  const finalPath = join(artDir, ...asset.path.split("/").slice(1));
  if (existsSync(finalPath)) {
    skipped += 1;
    continue;
  }
  const label = `[${i + 1}/${targets.length}] ${asset.path}`;
  try {
    const promptId = await queuePrompt(buildGraph(asset, i));
    const image = await waitForImage(promptId);
    const bytes = await download(image);
    mkdirSync(dirname(finalPath), { recursive: true });
    writeFileSync(finalPath, bytes);
    done += 1;
    console.log(`  ✓ ${label}`);
  } catch (err) {
    failed += 1;
    console.log(`  ✗ ${label} — ${err.message}`);
  }
}

console.log(`\nDone. generated ${done}, skipped(existing) ${skipped}, failed ${failed}.`);
