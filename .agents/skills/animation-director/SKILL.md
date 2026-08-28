---
name: animation-director
description: Turn a creative brief into a coherent animation plan, source-asset prompts, keyframes, shot prompts, motion directions, and continuity locks. Use for storyboards, character journeys, image-to-video plans, animation prompt packs, or diagnosing generative animation drift; do not use for ordinary single-image requests.
---

# Animation Director

Produce an animation that can be generated and revised shot by shot without
changing character identity, spatial geography, art direction, or screen
direction.

## Choose the production method

- Default to a hybrid pipeline: generate reusable source art, animate short
  controlled shots, then assemble and render programmatically.
- Use fully programmatic animation when exact timing, interface overlays, text,
  or deterministic motion matters more than organic movement.
- Use image-to-video for character acting, atmosphere, cloth, foliage, or
  camera motion that would be expensive to animate manually.
- Do not recommend one long text-to-video generation for a multi-scene story.
  Break it into independently replaceable shots.

Keep prompts provider-neutral unless the user names a renderer. Runway,
Higgsfield, Pollinations video models, and similar tools are render targets;
they do not replace the continuity and shot-planning layer.

## Build the prompt pack

From the user's brief, establish:

1. Delivery format: aspect ratio, duration, frame rate, loop or narrative.
2. Art direction: visual style, palette, lighting, texture, and composition.
3. World geography: fixed landmarks, travel direction, camera axis, and
   transition rules.
4. Character locks: one compact appearance anchor and one movement anchor per
   character, plus forbidden changes.
5. Source assets: character masters, true walk-cycle poses, clean background
   plates, props, and reference frames that must exist before shots.
6. Shot list: normally 3-8 seconds per shot, one dominant action per shot.
7. Assembly notes: transitions, overlays, sound beats, and which movement is
   better rendered in code.

For every shot, provide:

- story beat and exact duration;
- subjects and screen direction;
- start frame and end frame;
- one dominant action;
- camera behavior;
- transition out and sound intention;
- a self-contained still-image/keyframe prompt;
- a motion-only prompt describing change through time;
- continuity anchors that must remain unchanged.

Durations should add up to the requested total within one second.

## Prompt discipline

- Repeat relevant identity anchors inside every asset and keyframe prompt.
  Never rely on phrases such as "the same character."
- Describe a still image in the keyframe prompt: pose, placement, environment,
  composition, light, palette, and style.
- Describe only motion in the motion prompt: action, timing, camera, start/end
  state, foot contact, and locked elements. Do not let the video model redesign
  the frame.
- Prefer pose-to-pose animation, held background plates, controlled parallax,
  and real walk cycles over unconstrained generated walking.
- Preserve the camera axis and screen direction across adjacent shots.
- Plan captions, logos, labels, and important words as code or editorial
  overlays rather than generated pixels unless the user explicitly requires
  in-world text.
- Include a global negative prompt covering identity drift, duplicated limbs,
  morphing props, sliding feet, random cuts, camera wobble, style drift,
  illegible text, and unrequested subjects.

## Pollinations journey

When the brief concerns Polli, Website V2, the homepage journey, the capability
friends, Pollen, or the community finale, first read:

- `pollinations.ai/public/characters/bee-story/journey-v2/WORLD-JOURNEY.md`
- `operations/social/prompts/brand/visual.md`
- `operations/social/prompts/brand/bee.md`

Inspect existing journey assets before proposing new ones. Treat approved
assets and the world-journey motion contracts as source of truth. Do not redraw
or replace them merely to simplify the plan.

## Saving work

Keep editable animation plans and render source under
`pollinations.ai/video/projects/<project-slug>/`. Put only browser-delivered
renders and posters under `pollinations.ai/public/`, preserving an existing
feature folder when one already owns the assets. Do not create files unless the
user asks to save or implement the plan.
