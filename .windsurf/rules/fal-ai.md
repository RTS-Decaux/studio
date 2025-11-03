---
trigger: model_decision
description: fal.ai Integration Rules
---

## 0) First Principles

- **Server-only secrets.** fal API key never touches the browser. Calls happen in server actions/API routes/Edge Functions. ([docs.fal.ai][1])
- **Queue, don’t block.** Use fal’s job queue; poll status or receive webhooks; return streams/progress to the client. ([fal.ai][2])
- **Concurrency aware.** Default limit: **10 concurrent tasks per user** across endpoints (raiseable on enterprise). Build back-pressure. ([docs.fal.ai][3])

---

## 1) Models & Capabilities

- Use **catalog endpoints** for image/video/audio/3D (e.g., FLUX text-to-image, ESRGAN upscale, Veo 3, Sora 2, WAN 2.5). Pick by task, not brand. ([fal.ai][4])
- Prefer vendor-maintained schemas and example payloads from each model page. Keep model IDs centralized and whitelisted. ([fal.ai][5])

---

## 2) API Client Pattern (Node/TS)

```ts
// Server action / API route only
import { fal } from "@fal-ai/client";

// Submit
const { request_id } = await fal.queue.submit("fal-ai/flux/dev", {
  input: { prompt, seed: 0 },
  webhookUrl: process.env.FAL_WEBHOOK_URL, // optional
});

// Poll (progress/logs)
const status = await fal.queue.status("fal-ai/flux/dev", {
  requestId: request_id,
  logs: true,
});

// Result
const result = await fal.queue.result("fal-ai/flux/dev", {
  requestId: request_id,
});
// result.data -> URLs, metadata
```

Use **submit → status → result**; never busy-wait on the client. ([fal.ai][2])

---

## 3) Webhooks & Idempotency

- Prefer **webhooks** for long jobs (video). Verify signatures and store a **dedupe key** per job to make result writes idempotent. ([fal.ai][6])
- On duplicate callbacks, update status only; do not re-bill. (See fal community demos for custom billing headers when self-hosting.) ([GitHub][7])

---

## 4) Media I/O

- Inputs are **URLs or base64 data URIs**. Host user uploads privately (e.g., Supabase Storage) and pass **signed URLs** to fal. ([fal.ai][2])
- Outputs return **URLs + metadata**; persist them server-side, attach to a project/entity, and issue signed delivery to clients. ([fal.ai][2])
- For video workflows, use fal’s **FFmpeg utils** for composition, waveform, and metadata extraction. ([fal.ai][6])

---

## 5) Ratelimits, Retries, Back-pressure

- Enforce **in-app concurrency ≤10**; queue overflow → respond 429 with `retry_after`. ([docs.fal.ai][3])
- Retry **idempotent** operations with exponential backoff + jitter on 5xx/timeouts; never retry non-idempotent writes.
- For bursty media jobs, add a server-side **token bucket** per user/org and a global circuit breaker.

---

## 6) Cost & Compute

- Model pricing varies; consult **Models Pricing** to estimate per-call costs. For dedicated GPUs, see fal **Serverless & Compute pricing** (H100/H200/A100/B200). ([docs.fal.ai][8])
- Track billable units per job; expose cost in job metadata for analytics/budgets. ([GitHub][7])

---

## 7) Validation & Schemas

- Validate inputs with Zod before submit; cap resolution/duration/frames and sanitize prompts.
- Prefer **model-specific schemas** from docs; reject unknown fields (fail fast). ([fal.ai][5])

---

## 8) Observability

- Log: model id, request_id, status timeline, tokens/frames/pixels, latency, retries, cost.
- Surface **progress logs** to users where available. ([fal.ai][2])
- Emit events: `job_queued`, `job_started`, `job_progress`, `job_succeeded`, `job_failed`.

---

## 9) Security & Compliance

- API key in server secrets only.
- Validate webhook origin + signature; drop unknown hosts.
- Scan generated URLs before exposing publicly; enforce per-user/project ACLs.
- Redact prompts/outputs in logs; store minimal PII.

---

## 10) Error Discipline

- Classify: **4xx** (input/validation) vs **429** (rate-limited) vs **5xx** (provider).
- Return structured errors `{ code, message, hint, requestId }`.
- On partial failures (multi-asset jobs), return successful artifacts + actionable errors.

---

## 11) Agent Contract (drop-in)

- All fal calls run **server-side** via `@fal-ai/client`. The client only initiates jobs and streams progress. ([fal.ai][2])
- Use **queue submit → status/result**; prefer **webhooks** for long jobs. Include back-pressure and idempotency keys. ([fal.ai][2])
- Respect concurrency (≤10/user unless raised). On limit, delay or decline with guidance. ([docs.fal.ai][3])
- Choose models by task from fal’s catalog (image/video/3D); use model docs’ schemas/examples. ([fal.ai][4])
- Never expose secrets; never call fal from the browser.

---

## 12) Minimal Server Action Example (Next.js)

```ts
"use server";
import { z } from "zod";
import { fal } from "@fal-ai/client";

const Input = z.object({ prompt: z.string().min(1).max(800) });

export async function generateImage(formData: FormData) {
  const { prompt } = Input.parse({ prompt: formData.get("prompt") });

  const { request_id } = await fal.queue.submit("fal-ai/flux/dev", {
    input: { prompt, guidance: 3.5, seed: 0 },
    webhookUrl: process.env.FAL_WEBHOOK_URL, // optional
  });

  // Option A: poll (short jobs)
  const result = await fal.queue.result("fal-ai/flux/dev", {
    requestId: request_id,
  });
  return { requestId: request_id, output: result.data };
}
```

Uses the official **queue submit/status/result** flow. ([fal.ai][2])

---

## 13) Folder Skeleton

```
/app
  /api
    /fal/webhook/route.ts
    /media/generate/route.ts
/lib
  fal/client.ts        # thin wrapper around @fal-ai/client
  media/policies.ts    # caps, validation, rate limits
  media/jobs.ts        # submit/status/result helpers
  media/cost.ts        # billable units aggregation
```

---

## 14) When to Use Which Model (Examples)

- **Text→Image (creative, controllable):** `fal-ai/flux/dev`. ([fal.ai][5])
- **Upscale/Clean:** `fal-ai/esrgan`. ([fal.ai][2])
- **Text→Video (1080p, audio):** `fal-ai/veo-3`. ([fal.ai][9])
- **Advanced T2V (OpenAI Sora 2):** `fal-ai/sora-2/text-to-video` (partner). ([fal.ai][10])
- **WAN 2.5 (5–10s, 480p/1080p):** `fal-ai/wan-25-preview/text-to-video`. ([fal.ai][11])

---

## 15) Don’ts

- No client-side fal calls or exposed keys.
- No synchronous waits for long jobs; use webhooks or polling. ([fal.ai][2])
- No unbounded concurrency; always enforce limits. ([docs.fal.ai][3])
- No free-form payloads; follow model schemas. ([fal.ai][5])

---

## 16) Useful Links

- **Docs & Models:** fal docs, model pages & guides. ([docs.fal.ai][1])
- **Pricing:** models & compute. ([docs.fal.ai][8])
- **Video utils:** FFmpeg APIs. ([fal.ai][6])

This contract keeps media generation predictable, scalable, and safe while giving your team maximum leverage from fal’s queue-first API.

[1]: https://docs.fal.ai/?utm_source=chatgpt.com "fal docs - Fal.ai"
[2]: https://fal.ai/models/fal-ai/esrgan/api?utm_source=chatgpt.com "Upscale Images"
[3]: https://docs.fal.ai/model-apis/faq?utm_source=chatgpt.com "FAQ | fal.ai Documentation"
[4]: https://fal.ai/?utm_source=chatgpt.com "Generative AI APIs | Run Img, 3D, Video AI Models 4x Faster ..."
[5]: https://fal.ai/models/fal-ai/flux/dev/api?utm_source=chatgpt.com "FLUX.1 [dev]: Text-to-Image AI Generator"
[6]: https://fal.ai/video?utm_source=chatgpt.com "AI Video APIs for Developers"
[7]: https://github.com/fal-ai-community/fal-demos?utm_source=chatgpt.com "Private Model Hosting Demos with Fal"
[8]: https://docs.fal.ai/platform-apis/v1/models/pricing?utm_source=chatgpt.com "Pricing - fal docs"
[9]: https://fal.ai/models/fal-ai/veo3/api?utm_source=chatgpt.com "Google Veo 3: AI Video Generator | Text-to-Video AI + Audio"
[10]: https://fal.ai/models/fal-ai/sora-2/text-to-video/api?utm_source=chatgpt.com "Sora 2 | Text to Video"
[11]: https://fal.ai/models/fal-ai/wan-25-preview/text-to-video/api?utm_source=chatgpt.com "Wan 2.5 Text to Video"
