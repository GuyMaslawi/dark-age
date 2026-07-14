# Generate all art with ComfyUI (local, free)

`comfy-batch.mjs` drives your **local ComfyUI** through its API: it reads every
prompt from `public/art/art-manifest.json`, generates each image, and saves it
straight into `public/art/<category>/<slug>.png` with the correct name. Images
that already exist are skipped, so you can stop and re-run anytime.

The script **auto-detects** the prompt / latent / sampler / save nodes in any
standard txt2img workflow, so you can point it at whatever model setup you
already have working in ComfyUI (checkpoint, or separate diffusion+CLIP+VAE
loaders like Z-Image / Flux — either works).

## One-time setup

1. **Start ComfyUI** and confirm your workflow generates one image (click **Run**).
2. **Enable API export:** Settings (⚙ bottom-left) → search `dev` → turn on
   *"Enable Dev mode Options (API save, etc.)"*.
3. **Export your workflow:** main menu (top-left) → **Workflow → Export (API)**.
   Save it, e.g. `~/Desktop/my-workflow.json`.

## Run it

Point the script at your exported workflow:

```
COMFY_WORKFLOW=~/Desktop/my-workflow.json node apps/web/scripts/comfy-batch.mjs
```

It keeps your workflow's model and sampler settings (steps, cfg, etc.) and only
swaps the prompt, image size, and output filename per asset.

The bundled `darkage.api.json` is a fallback SDXL-checkpoint workflow; use it
only if you don't export your own (then also pass `COMFY_CKPT=your_model.safetensors`).

That generates all 93 images. Refresh the game — the art replaces the SVG
placeholders automatically, no code changes.

### Do one category at a time
```
ONLY=location node apps/web/scripts/comfy-batch.mjs   # the 15 scenes (16:9)
ONLY=portrait  ... ONLY=monster ... ONLY=item
```

## Options (env vars)

| var | default | notes |
| --- | --- | --- |
| `COMFY_CKPT` | — | **required**, checkpoint filename |
| `COMFY_URL` | `http://127.0.0.1:8188` | ComfyUI address |
| `COMFY_STEPS` | `30` | sampler steps |
| `COMFY_CFG` | `6.5` | guidance |
| `COMFY_SAMPLER` | `dpmpp_2m` | |
| `COMFY_SCHEDULER` | `karras` | |
| `COMFY_SQUARE` | `1024` | size for monsters/items/portraits |
| `COMFY_WIDE_W` / `COMFY_WIDE_H` | `1344` / `768` | size for locations (16:9) |
| `ONLY` | — | `location` \| `monster` \| `item` \| `portrait` |

**Using an SD1.5 checkpoint?** Add:
```
COMFY_SQUARE=768 COMFY_WIDE_W=896 COMFY_WIDE_H=512 COMFY_CKPT=... node apps/web/scripts/comfy-batch.mjs
```

The negative prompt and node graph live in `darkage.api.json` — tweak if you want.
