# Generate all art with ComfyUI (local, free)

`comfy-batch.mjs` drives your **local ComfyUI** through its API: it reads every
prompt from `public/art/art-manifest.json`, generates each image, and saves it
straight into `public/art/<category>/<slug>.png` with the correct name. Images
that already exist are skipped, so you can stop and re-run anytime.

## One-time setup

1. **Start ComfyUI** (it serves the API at `http://127.0.0.1:8188`):
   ```
   python main.py
   ```
2. **Have a checkpoint** in `ComfyUI/models/checkpoints/`. For this dark-fantasy
   style an **SDXL** model works great — e.g. `juggernautXL_v9`, `dreamshaperXL`,
   or base SDXL. (SD1.5 also works — see sizes below.)

## Run it

From the repo root, pass your checkpoint filename:

```
COMFY_CKPT=juggernautXL_v9.safetensors node apps/web/scripts/comfy-batch.mjs
```

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
