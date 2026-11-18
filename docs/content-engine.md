# Content engine — architecture and build plan

Status: **design ready, not built.** This document answers the product question
in task #202: what a Kavi content engine can produce, what it needs, and how to
ship it without turning the brand into generic AI output.

## Goal

Turn a written idea, brief or voice note into publishable content for Kavi
Solutions and for client work:

- short-form video (reels, shorts, vertical clips);
- long-form video (YouTube, explainers, interviews);
- audio (podcast clips, voiceovers);
- graphical content (carousels, quote cards, 2D/3D visuals);
- written content (posts, captions, blogs, newsletters);
- a consistent on-camera character based on Teja's face and voice, with consent.

The engine is a production pipeline, not a single "generate" button. Every
output passes a human approval step before publishing.

## What "character" means

Two separate assets:

1. **Face/avatar** — a consenting likeness, either a trained avatar model or a
   shot library with lip-sync. Do not clone a public figure.
2. **Voice** — a consented voice model or recorded voice bank.

Both must have a written consent record, a defined usage scope and a kill switch
that removes the model and generated assets on request.

## Pipeline

```
idea / brief / voice note
        │
   script + hook + structure        (LLM, brand voice)
        │
   shot list + visual direction     (LLM + templates)
        │
   assets: avatar / b-roll / graphics / screen capture
        │
   voice + lip-sync + edit          (TTS, avatar, FFmpeg/Remotion)
        │
   captions + thumbnail + alt text  (LLM + template)
        │
   human review / approval          (admin queue)
        │
   publish: LinkedIn / Instagram / Facebook / YouTube / blog
        │
   analytics + feedback loop
```

## Tool options

| Layer | Managed option | Self-hosted / lower-cost option |
| --- | --- | --- |
| Script / captions | OpenAI, Gemini, Claude | local Llama/Qwen with brand prompt |
| Voice | ElevenLabs, PlayHT | Coqui/XTTS with consented voice bank |
| Talking avatar | HeyGen, D-ID, Synthesia | recorded presenter + lip-sync (Wav2Lip) |
| Video editing | CapCut, Descript | FFmpeg + Remotion templates |
| Graphics | Canva, Figma templates | SVG/React templates + Satori |
| 3D / motion | Runway, Pika, Blender | Blender + prebuilt scene templates |
| Publishing | Buffer, Metricool | existing `social-agent/` + platform APIs |
| Approval | admin panel | Telegram approval (already in social-agent) |

The existing `social-agent/` already covers image posts, captions, Telegram
approval and LinkedIn/Facebook/Instagram publishing. The content engine should
extend that pipeline rather than replace it.

## MVP phases

**Phase 1 — text + image posts (mostly exists)**
- Brief intake form in admin.
- Brand voice prompt and output templates.
- Image selection/upload, caption variants, Telegram approval, publish.
- Store output history and performance.

**Phase 2 — short video from a script**
- Script -> shot list -> voiceover -> subtitles -> vertical export.
- Template-driven editing (intro, captions, lower-thirds, CTA).
- Human approves the final file before publish.

**Phase 3 — digital presenter**
- Consented face/voice model.
- Avatar video for talking-head explainers.
- Watermark/asset registry and revocation process.

**Phase 4 — multi-format campaign**
- One brief produces a blog, carousel, reel, long video and newsletter.
- Calendar and cross-platform scheduling.
- Analytics loop: which hook/format performed, feed back into templates.

## What is needed

- A content brief schema: audience, goal, platform, length, language, CTA.
- Brand assets: logo, colours, fonts, intro/outro, lower-thirds, music licence.
- A small shot/stock library and a consented presenter asset.
- Storage for source and rendered files (S3/MinIO), with retention rules.
- GPU or managed API budget for voice/video generation.
- An approval queue with role-based access.
- Platform API credentials and a publishing calendar.
- A review checklist for factual claims, privacy and copyright.

## Risks and guardrails

- **Likeness and voice:** written consent, scope, expiry and deletion process.
- **Misinformation:** human fact-check before publish; no auto-publish for
  claims about clients, government or financial services.
- **Copyright:** licensed music, stock and fonts only.
- **Platform policy:** disclose AI-generated presenter content where required.
- **Cost:** video generation is metered; set per-job budgets and cache assets.
- **Brand fatigue:** templates should vary; don't publish the same avatar style
  every day.

## Recommendation

Start with Phase 2 (short video from a script) on top of the existing
`social-agent/` calendar. It produces visible output with manageable cost, and
it does not require a face clone. Add the digital presenter only after consent,
brand assets and an approval process are in place.
