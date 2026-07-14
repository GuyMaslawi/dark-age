import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const artDir = join(here, "..", "public", "art");

const COMFY = process.env.COMFY_URL ?? "http://127.0.0.1:8188";
const WORKFLOW = process.env.COMFY_WORKFLOW ?? join(here, "comfy", "darkage.api.json");
const SQUARE = Number(process.env.COMFY_SQUARE ?? 1024);
const WIDE_W = Number(process.env.COMFY_WIDE_W ?? 1344);
const WIDE_H = Number(process.env.COMFY_WIDE_H ?? 768);
const ONLY = process.env.ONLY;
const CKPT = process.env.COMFY_CKPT;
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;

const manifest = JSON.parse(readFileSync(join(artDir, "art-manifest.json"), "utf8"));
const template = JSON.parse(readFileSync(WORKFLOW, "utf8"));
const clientId = "darkage-batch";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function locate(graph) {
  const entries = Object.entries(graph);
  const sampler = entries.find(
    ([, n]) =>
      n.inputs &&
      "latent_image" in n.inputs &&
      "positive" in n.inputs &&
      "negative" in n.inputs,
  );
  if (!sampler) throw new Error("could not find a KSampler node in the workflow");
  const [, s] = sampler;
  const save = entries.find(([, n]) => String(n.class_type).includes("SaveImage"));
  if (!save) throw new Error("could not find a SaveImage node in the workflow");
  const ckpt = entries.find(([, n]) => n.class_type === "CheckpointLoaderSimple");
  return {
    samplerId: sampler[0],
    positiveId: s.inputs.positive[0],
    negativeId: s.inputs.negative[0],
    latentId: s.inputs.latent_image[0],
    saveId: save[0],
    ckptId: ckpt ? ckpt[0] : null,
  };
}

const ref = locate(template);

async function queuePrompt(graph) {
  const res = await fetch(`${COMFY}/prompt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: graph, client_id: clientId }),
  });
  if (!res.ok) throw new Error(`/prompt ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error).slice(0, 400));
  return data.prompt_id;
}

async function waitForImage(promptId) {
  for (let i = 0; i < 900; i += 1) {
    const res = await fetch(`${COMFY}/history/${promptId}`);
    const hist = await res.json();
    const entry = hist[promptId];
    if (entry && entry.outputs) {
      for (const nodeId of Object.keys(entry.outputs)) {
        const imgs = entry.outputs[nodeId].images;
        if (imgs && imgs.length) return imgs[0];
      }
      if (entry.status?.status_str === "error") throw new Error("generation error (see ComfyUI)");
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
  const g = structuredClone(template);
  const wide = asset.category === "location";
  g[ref.positiveId].inputs.text = asset.prompt;
  if ("width" in g[ref.latentId].inputs) {
    g[ref.latentId].inputs.width = wide ? WIDE_W : SQUARE;
    g[ref.latentId].inputs.height = wide ? WIDE_H : SQUARE;
  }
  const s = g[ref.samplerId].inputs;
  if ("seed" in s) s.seed = 100000 + index;
  else if ("noise_seed" in s) s.noise_seed = 100000 + index;
  g[ref.saveId].inputs.filename_prefix = `darkage/${asset.slug}`;
  if (CKPT && ref.ckptId) g[ref.ckptId].inputs.ckpt_name = CKPT;
  return g;
}

const targets = manifest.assets
  .filter((a) => !ONLY || a.category === ONLY)
  .slice(0, LIMIT === Infinity ? undefined : LIMIT);
let done = 0;
let skipped = 0;
let failed = 0;

console.log(`ComfyUI batch: ${targets.length} images`);
console.log(`  server:   ${COMFY}`);
console.log(`  workflow: ${WORKFLOW}`);
console.log(
  `  detected: sampler=${ref.samplerId} positive=${ref.positiveId} save=${ref.saveId}\n`,
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
