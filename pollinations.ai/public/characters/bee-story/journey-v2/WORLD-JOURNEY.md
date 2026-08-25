# Pollinations World Journey

## Purpose

Replace the existing feature-block presentation with a short, continuous 2D pixel-art journey. Polli walks from left to right through a changing world while the product story unfolds around her.

The experience should feel like a miniature adventure game, not a slideshow or a sequence of cards.

This document records the current direction. It distinguishes decisions that are already locked from content and animation work that comes later.

## Story structure

The journey has five narrative worlds, always in this order:

1. **Start Free** — welcome the viewer through the Pollinations gate, then show that everyone can begin with Quest Pollen.
2. **Building Tools** — introduce the tools and infrastructure used to build.
3. **Publish** — show that apps, models, and agents can be published.
4. **Earn** — connect user spending, BYOP, publishing, and developer earnings.
5. **Build Together** — finish with open source, creativity, and the wider community.

The worlds are narrative chapters, not visible title cards. Their meaning will eventually come from scenery, character actions, and animated objects.

## Locked experience decisions

- One uninterrupted side-scrolling walk from beginning to end.
- Polli remains a separate animated foreground character.
- Backgrounds must not contain another Polli.
- The landscape moves continuously behind Polli; the experience must not feel like six slides.
- The walk follows a full day, from sunrise to a warm starry night.
- The world stays visually minimal so feature elements can later appear, animate, and disappear without creating clutter.
- Keep the background itself free of product cards and feature overlays. The opening's separate Nom Nom and Computer Head greeters are the only mascot exception in the arrival landscape.
- The bottom explanatory banner from earlier versions should not return. Important ideas must ultimately exist inside the animated composition.
- First validate the worlds and their continuity. Add feature overlays only afterward.

## Integration invariants

Approved scenes are source components, not visual references to reinterpret.

- Build the complete journey by offsetting each approved scene on one global timeline.
- Do not redraw, substitute, simplify, or manually reconstruct an approved asset or animation when integrating it.
- Preserve each scene's internal keyframes, object scale, entrance, exit, and disappearance method exactly. Integration may change only its global start time.
- The panorama always moves at the velocity established by the 65-second full journey. Short previews use the same pixels-per-second value.
- Increase or reduce pacing by changing the physical spacing between world objects, never by changing world velocity.
- Polli stays at the established foreground position while the world advances, except for an explicitly approved local action such as the opening flight.
- World objects grow or arrive in the landscape and leave because the landscape moves. They do not behave like centered slides.
- Opacity animation is forbidden. Do not fade anything in or out.
- World objects are never hidden at their exit. They remain fully visible and leave naturally with the moving landscape.
- Every world-attached object uses the panorama's exact translation and duration. It must never have an independent follow, exit, or speed animation.
- Temporary elements may use a discrete `visibility` switch only at the beginning or end of a physical transition.
- Entrances and exits must use motion: grow from the ground, pop, compress, collapse, sparkle, flip, fly, slide, move behind scenery, or travel offscreen.
- A snap, collapse, sparkle burst, or other approved exit must never become a visibility or opacity shortcut during integration.

Current approved sources:

| Scene | Source of truth |
|---|---|
| Start Free arrival | `opening-v1/worlds-panorama-with-portal.png`; greeters in `opening-v1/`; Polli entrance and timing in `journey-progress.html` |
| Start Free phase | `phase-refactor-v1/everyone-starts-free-banner.png`; message frames in `start-free-v3/`; free-standing Pollen-pot frames in `start-free-v4/`; timing and reusable Pollen circulation in `journey-progress.html` |
| Generate AI Media phase | `phase-refactor-v1/generate-ai-media-banner.png` and the seven capability friends in `capability-parade-v2/` |

Current phase-title grammar:

- Start Free opens on a fixed one-second establishing hold. Polli then spends 4.2 seconds following the curved road from deep inside the gate to her foreground position while the panorama remains still.
- The panorama begins its one constant movement only after Polli completes that entrance. `EVERYONE STARTS FREE` starts dropping 0.15 seconds later, with no empty walking gap.
- The entrance is a road-spanning monument whose crown reinterprets only the botanical Pollinations mark. It contains no wordmark, brand name, welcome copy, UI, or floating panel.
- The road visibly passes through the arch. Polli emerges through it when movement begins; Computer Head and Nom Nom wait at opposite sides with small idle motions and leave naturally with the world.
- The welcome is communicated by the place and characters. `EVERYONE STARTS FREE` is the first written message.
- Later phase titles use one shared wide, shallow rope banner design.
- Each banner enters physically from above, settles high in the sky with a short bounce, stays for its phase, and retracts upward. Opacity never changes.
- `EVERYONE STARTS FREE` introduces one compact floating-island message that moves through `COMPLETE A QUEST`, `EARN YOUR FIRST POLLEN`, and `COMPLETE MORE QUESTS / KEEP EARNING POLLEN`.
- The message island lives in the open sky. Its copy occupies most of the asset; it never touches or competes with the road.
- Pollen is shown as small glowing grains, never coins.
- The persistent Pollen wallet is exactly two free-standing honey pots with no island, platform, shelf, or floor: Paid is gold/amber with a card symbol; Quest is mint/green with a sprout symbol.
- The two-pot wallet stays close to the bottom-left edge so later developer earnings can reuse it. It does not open, close, fade, or change position between chapters; only pot levels and circulating Pollen animate.
- The wallet pops in with `EARN YOUR FIRST POLLEN`, not before or after it. Start Free then sends Quest Pollen into the green pot.
- Quest rewards use a five-grain first burst, followed by a denser fourteen-grain burst for continued Quests.
- The first Quest burst reaches the green pot as its low state appears; the larger burst begins filling it before the high state appears. Shortening Start Free must shift these reward delays with the phase.
- During the Generate AI Media parade, the Paid and Quest pots continuously send their matching gold and green Pollen upward toward the capability friends. The stream begins only as the first friend arrives and ends with the final friend. Airborne Pollen is always transient animation and is never baked into a wallet state image.
- More precisely, media spending begins when the first capability friend reaches the screen center and ends when the last friend reaches the center. No Pollen may continue after that event window.
- Spent Pollen terminates inside the capability friends' body-and-prop zone. It never flies into empty sky.
- `@pollinations/ui` wallet tokens and icons are the canonical source for wallet identity. Older generated-media prompts must not override them.
- `GENERATE AI MEDIA` replaces `GEN API` and remains for the entire capability sequence.
- The Generate AI Media banner exits only after Text, Image, Audio, Video, Real-time, Embeddings, and Agents have passed.
- Start Free begins with the welcome frame at time zero. Its banner yields directly to Generate AI Media while Polli uses her existing alternating wing frames to descend into one brief walking step.
- Polli's Start Free descent completes through its own continuous curve before Generate AI Media takes control of her transform and visibility layers. Its duration is derived from the next flight's start time, so the two flights meet at one matching frame and never overlap or flash.
- Generate AI Media starts as Polli reaches the road: its banner drops immediately after the landing, Polli lifts first, and the complete friend parade appears directly at the right edge. Polli then flies to the upper-left for the parade; every media event, including the Pollen-spending stream, moves together if this chapter is retimed.
- Polli remains in the upper-left until the last capability friend passes, then returns to the road only briefly. Build Your Way follows immediately; never leave an empty panorama between the two chapters.
- The local review page keeps its phase controls outside the presentation frame. Start Free begins at time zero and includes the welcome frame; it is not a separate chapter. Each button reconstructs the complete animation state at Start Free, Generate AI Media, Build Your Way, or Connect · Publish · Earn and continues playback from that point.
- Pollen spending keeps its exact approved delay relative to the parade: it begins at the first friend's center crossing and ends at the final friend's center crossing. Moving the parade earlier moves the complete Pollen stream earlier without changing its internal rhythm.
- At the approved media-flight moment, Polli flies into a visible top-left hover instead of leaving the frame. She remains there while the media group passes, then starts returning after the final friend has arrived.
- After landing, Polli uses her existing alternating wing frames to fly physically downward below the road as Build Your Way begins. She stays visible and hovering along the lower edge without being clipped or covering the tool landmarks.
- These seven items form one capability parade, not seven separate slides.
- Capability names are integrated into carried placards and props.
- Pollinations-universe characters carry the capabilities toward Polli from the right while the world keeps its constant speed.
- Every capability friend enters from screen-right, faces left, and travels left toward Polli, opposite Polli's rightward journey. Forward-facing or right-facing character frames are invalid.
- Several capabilities may share the frame. Empty pauses between isolated features are a regression.
- Every capability friend shares one visible foot-contact line on the road. Transparent canvas padding must be compensated so no character floats above or sinks below the path.

### Build Your Way

- `BUILD YOUR WAY` follows the media parade after a short breathing distance. It uses the same physical rope-banner entrance as the previous phases.
- Pollen Wallet, CLI, MCP, and Media Storage are landmarks attached to the world layer. They never fade, float independently, or move at a speed different from the panorama.
- Each landmark activates in the right-hand presentation zone, then approaches Polli as the world carries it left. This keeps Polli from covering the feature name.
- Pollen Wallet arrives first; CLI, MCP, and Media Storage retain their approved positions on the same tight 2.3-second rhythm. Removing a landmark closes its complete 2.3-second slot instead of leaving an empty screen.
- All four landmarks use one shared compact footprint and the same perceived scale. No item becomes a larger chapter card or destination screen.
- Every landmark integrates one large, readable wooden name plaque that occupies roughly one quarter of the composition.
- Each landmark's `data-center-time` is the single timing source for both its world position and activation. Never duplicate that value in inline CSS.
- Pollen Wallet, CLI, MCP, and Media Storage enter with one fast physical seed burst: compressed point, upward growth, landing overshoot, and a brief geometric sparkle. They then remain fully present and leave only with the moving world. The effect uses CSS geometry and one helper element, not extra image frames or opacity fades.
- Pollen Wallet is the universal user-wallet doorway: people connect with Pollinations and spend their own Paid or Quest Pollen through any Pollinations-powered creation, including an app, tool, agent, device, terminal, automation, or headless workflow. Never frame it as requiring a frontend. Its public label is `POLLEN WALLET`; do not expose the internal BYOP term in the journey.
- CLI is a compact terminal shrine with a pulsing screen.
- MCP is a cheerful rounded connector-flower hub with three tool buds. It must never become a twisted tree, bare branch, ominous crystal, ghostly face, or dark device.
- Media Storage is one compact living archive. Its plaque reads `MEDIA STORAGE`, with three large bays for image, audio, and video. It does not imply app, model, or agent hosting.
- Build Your Way contains no Nom Nom or Computer Head sprites. The landmarks carry the product identity without extra mascots.
- Landmark animation uses physical bounce, screen light, sequential connector pulses, and media-bay lights. Opacity is never used to enter or exit.

### Connect · Publish · Earn

- `CONNECT · PUBLISH · EARN` follows Build Your Way and bridges the Publish and Earn worlds. It uses the shared rope-banner entrance and remains one continuous landscape sequence.
- Build Your Way keeps its approved exit timing. After its banner has left, the world travels one complete viewport from the Media Storage landmark before Pollen Wallet may appear. Polli rises first, then the `CONNECT · PUBLISH · EARN` banner lands, then the revenue showcase begins.
- The camera stops once for nine seconds in the golden-hour world. Nothing in the background jumps or drifts during the hold, and the camera resumes at exactly its prior speed afterward.
- Three deliberately different center-stage beats replace one another: Pollen Wallet connection, Community Models aggregation, then a giant Agent Robot. This is not another roadside-landmark parade.
- Pollen Wallet returns as the universal connective mechanism, not a second product: any app, tool, agent, device, terminal, automation, or headless workflow can connect a user's Paid or Quest Pollen without requiring a frontend.
- Community Models is one living network assembled from many visibly different model beings. The connected organism physically grows into place, then compresses and bursts away.
- The Agent Robot walks in from screen-right toward screen-left, pauses in a confused working pose, creates falling text, image, audio, and video objects, then ignites its backpack and rockets offscreen.
- Every beat sends both Paid and Quest Pollen into the matching persistent pots at lower-left. The pollen colors and destinations never swap.
- Scenes enter through spring growth, assembly, walking, or ignition and leave through collapse, burst, or flight. Opacity fades, cards, app windows, humans, and cross-dissolves are forbidden.
- Polli rises from her low Build Your Way hover into the upper-left and remains visibly engaged while the three beats replace one another.

Current validation gate:

- The integrated preview contains the seven approved friends in this order: Text, Image, Audio, Video, Real-time, Embeddings, Agents.
- All seven use transparent production derivatives and preserve their approved identity, prop, label, palette, scale, and left-facing direction.
- Every friend enters from screen-right during the Generate AI Media chapter, walks screen-left on one shared foot-contact line, cycles `1 -> 2 -> 3 -> 2`, and exits naturally offscreen.
- The procession uses one constant crossing duration and staggered start positions; it never speeds up or slows down the world.
- Do not restore the previous floating cards, detached modality icons, repeated carrier art, or scattered character layout.
- The complete transparent character crosses the landscape as one object. Never animate a multi-pose sheet as a visible cropping window or make the character turn in place inside a fixed square.

### Approved asset lock

- Creative approval locks the exact source asset. Never replace it with an older asset, a convenient substitute, or a new interpretation.
- Technical cleanup may create a derivative only for transparency, cropping, frame extraction, or file optimization. It must preserve the approved artwork.
- If cleanup fails, stop integration and report the blocker. The element remains absent rather than silently changing design.
- Visual QA must show the approved asset at entry, midpoint, and exit before it enters the full journey.

### Character motion contract

Apply this contract to every capability friend before integration:

1. Lock one approved master design. Later frames may change only limbs and a small amount of body bounce; identity, facing direction, scale, palette, prop, text, and perspective remain fixed.
2. Declare the character's travel direction in screen coordinates. Polli moves screen-right; capability friends enter from screen-right, face screen-left, and move screen-left.
3. Produce three separate full-body sources: leading step, passing/up pose, and genuinely opposite step. The loop is `1 -> 2 -> 3 -> 2`.
4. Define each step by its hip-to-foot connection, not by ambiguous phrases such as “right leg forward.” Frame 3 must swap which hip supplies the advancing leg; changing only boot spacing is invalid.
5. Use `capability-parade-v2/opposite-step-pose-guide.svg` as the reusable leg-ownership guide. It specifies the screen-right hip crossing forward toward screen-left while the screen-left hip trails toward screen-right.
6. Review the three stills side by side and as a loop. Reject the set if Frames 1 and 3 repeat the same leg ownership, if any frame flips direction, or if a character turns inside a fixed crop.
7. Approve creative motion before transparency cleanup. Integration requires real alpha, consistent cropping, and equal sprite scale; a painted checkerboard is never production-ready transparency.

Each character package contains only the locked master, pose guide, three frame sources, and one loop preview. A failed frame is marked rejected and must not be reused or silently substituted.

| Element | Approved source | State | Production derivative |
|---|---|---|---|
| Text | `capability-parade-v2/text-master-source.png` | Three-frame leftward cycle integrated | `capability-parade-v2/text-frame-{1-left-step,2-passing,3-right-step}.png` |
| Image | `capability-parade-v2/image-master-source.png` | Three-frame leftward cycle integrated | `capability-parade-v2/image-frame-{1-left-step,2-passing,3-right-step}.png` |
| Audio | `capability-parade-v2/audio-master-source.png` | Three-frame leftward cycle integrated | `capability-parade-v2/audio-frame-{1-left-step,2-passing,3-right-step}.png` |
| Video | `capability-parade-v2/video-master-source.png` | Three-frame leftward cycle integrated | `capability-parade-v2/video-frame-{1-left-step,2-passing,3-right-step}.png` |
| Real-time | `capability-parade-v2/realtime-master-source.png` | Three-frame leftward cycle integrated | `capability-parade-v2/realtime-frame-{1-left-step,2-passing,3-right-step}.png` |
| Embeddings | `capability-parade-v2/embeddings-master-source.png` | Three-frame leftward cycle integrated | `capability-parade-v2/embeddings-frame-{1-left-step,2-passing,3-right-step}.png` |
| Agents | `capability-parade-v2/agents-approved-source.png` | Three-frame leftward cycle integrated | `capability-parade-v2/agents-frame-{1-left-step,2-passing,3-right-step}.png` |

The motion order is `1 -> 2 -> 3 -> 2`. Every frame keeps its friend facing screen-left: each enters from the right and travels right-to-left, opposite Polli. Frame 3 changes only the limb phase; mirroring the head, torso, prop, text, or travel direction is forbidden.

Before accepting an integrated preview, compare every scene against its source prototype. If they differ for any reason other than global timing, treat it as a regression.

## Art direction

The source of truth is:

- `operations/social/prompts/brand/visual.md`
- `operations/social/prompts/brand/bee.md`
- `operations/social/prompts/brand/characters-ref.jpg`

Approved direction:

- Cozy, chunky 8-bit pixel art.
- Large, readable pixel clusters rather than intricate illustration.
- Soft, minimal, emotionally warm environments.
- Nature and growth motifs mixed with gentle technology.
- Prominent lime `#ecf874` in every region.
- Warm cream, mint, lavender, and peach supporting colors.
- Dark purple `#110518` for outlines and contrast.
- No humans, cyberpunk imagery, harsh neon, realistic rendering, or corporate illustration.

The approved starting reference is `candidate-a-chunky.png`. Its simplicity is important because later scenes will contain many moving elements.

## Full-day light arc

| World | Time | Emotional role |
|---|---|---|
| Welcome | Sunrise | Discovery and invitation |
| Start Free | Warm morning | Accessible, optimistic beginning |
| Building Tools | Bright midday | Clarity, capability, activity |
| Publish | Late afternoon | Momentum and release |
| Earn | Golden hour | Reward and circulation |
| Build Together | Blue hour into night | Arrival, warmth, community |

The ending should be clearly nighttime, but never dark or ominous. Windows, lantern-plants, fireflies, pollen lights, and stars can make the shared world feel alive. The final night is an arrival rather than an ending in darkness.

## World identities

The present prototype proves that a continuous panorama works, but its regions are too similar. The repeated dirt road, foreground rocks, and purple cable make the world feel like one biome with different decorations.

The next pass should preserve Polli's walking geometry while changing the land itself:

| World | Walkable terrain | Foreground and regional character |
|---|---|---|
| Welcome | Dirt garden path | Wild plants, open gate, soft dawn meadow |
| Start Free | Glowing orchard soil and root terraces | Pollen seeds, young growth, generous open space |
| Building Tools | Wooden boardwalks and glass channels | Circuit-grown plants, garden workshops, precise structures |
| Publish | Pale ridge stone | Clouds, launch flowers, beacons, greater vertical openness |
| Earn | Bridges and riverbanks | Reeds, golden water, terraces, gentle waterwheels |
| Build Together | Converging garden paths and woven roots | Shared gardens, warm pavilions, lights, night sky |

The foreground boundary must transform with each region. A continuous journey does not require one continuous road.

## Continuity system

Continuity should come from controlled invariants, not repeated scenery.

### Invariants

Every world must share:

- Canvas ratio and pixel density.
- Camera height and side-on perspective.
- Horizon range.
- Polli's foot-contact line.
- Compatible edge density and atmospheric depth.
- A gradual daylight progression.

### Variables

Each world is free to change:

- Ground material and path shape.
- Foreground silhouette.
- Vegetation and architecture.
- Palette emphasis within the brand colors.
- Openness, elevation, and regional landmarks.

### Transition method

Do not generate every new world from the complete preceding image. That approach preserves accidental repetition.

Instead:

1. Generate one strong anchor image for each of the six worlds independently from the same geometry specification.
2. Validate the six anchors together before expanding them.
3. Use the exit edge of one anchor and entrance edge of the next to create a dedicated bridge image.
4. Let one region's materials evolve into the next region's materials inside the bridge.
5. Inspect every stitched seam at full size and in motion.
6. Use foreground occlusion such as plants, mist, branches, or bridges only where it helps a transition feel natural.

Example material evolution:

`garden path -> glowing roots -> wooden boardwalk -> pale ridge stone -> river bridge -> woven community paths`

Polli's uninterrupted walk and the changing sky provide the strongest perceptual glue.

## Later content overlays

These belong to the next phase, after the background journey is approved.

### Welcome

- A concise introduction to Pollinations.
- An immediate feeling of openness, friendliness, and possibility.

### Start Free

- Quest Pollen as the simple way to begin.
- Introduce one element at a time rather than displaying a full feature panel.

### Building Tools

- Generate AI Media.
- Media Storage.
- CLI.
- MCP.
- Wallet, with greater visual prominence.
- App hosting is deliberately omitted until the product is ready.

### Publish

- App.
- Model.
- Agent.
- Each arrives briefly and clearly as Polli encounters it.

### Earn

- Users can bring and spend their own Pollen through BYOP.
- Developers can earn from apps, models, and agents.
- The visual connection between user activity and developer earnings should be simple and unmistakable.

### Build Together

- Open source.
- A large, active community.
- Inventive beings from across the Pollinations universe, without generic humans or repeated characters.

NomNom and the monitor robot may appear later when their actions support the current feature. They should never transform into Polli or replace her.

## Current prototype

Local preview:

`http://127.0.0.1:5190/walk-test.html`

Implementation:

- `walk-test.html` — 65-second continuous horizontal journey.
- `worlds-panorama.png` — current 14,912 x 1,024 stitched panorama.
- `polli-walk-frame.png` — separate Polli walking sprite.
- `world-01-welcome-gate.png` through `world-12-build-together-core.png` — two current tiles per world.
- `world-seams-contact.png` — contact sheet used to inspect existing seams.
- `worlds-final-desktop.png` and `worlds-final-mobile.png` — current visual QA captures.
- `anchors-v2/` — six independently generated world anchors.
- `bridges-v2/` — five generated transition tiles plus the current bridged panorama.
- `bridges-v3/worlds-panorama-final-v2.png` — current 14,336 x 1,024 eleven-tile walk source. Its five transitions were generated from paired world-edge templates, cleared of duplicate edge landmarks, joined through aligned 256 px overlaps, and verified with one continuous walking surface.
- `bridges-v2/verified-seams-contact.png` — visual QA of all ten blended tile joins.

The current panorama is a structural prototype, not final art. It validates:

- Continuous travel can work.
- Polli can remain independent from the environment.
- A long world can be responsive on desktop and mobile.
- A gradual light overlay helps connect the journey.

It does not yet validate:

- Strong regional differences.
- A convincing full-day ending.
- Final world-to-world transitions.
- Feature storytelling beyond the first Welcome proof.

Opening sequence:

1. Welcome: `WELCOME TO POLLINATIONS` is integrated into one joyful garden gateway at the far-left edge. Both posts flank a visible feeder path that comes from the distant world, passes through the gate, and curves into the horizontal journey road. Polli begins smaller inside the gate, follows that curve, and reaches the shared walking line. A portal without a physically connected road is invalid.
2. Start Free: the phase banner introduces one compact floating-island message that changes quickly through `COMPLETE A QUEST`, `EARN YOUR FIRST POLLEN`, then `COMPLETE MORE QUESTS / KEEP EARNING POLLEN`.
3. The first reward sends five green Quest Pollen grains into the Quest honey pot. The final message sends a denser fourteen-grain stream into the same pot.
4. Only the mint/green Quest pot activates here. The gold/amber Paid pot remains empty until BYOP and developer earnings.

The message island crosses the open sky and leaves physically. The two free-standing Pollen pots pop into the bottom-left and remain there as a stable visual anchor for later chapters. They never open, close, or fade.

Fake parallax was removed because duplicating one complete panorama at different speeds caused the sky and ground to show different worlds. Parallax should return only when separate depth assets exist.

## Current validation status

Completed:

1. Six distinct world anchors were generated and reviewed together.
2. Five bridge tiles were generated from their adjacent anchors.
3. Anchor and bridge edges use a 256-pixel horizontal blend to remove generated boundary lines.
4. The full walk now moves from sunrise to a warm starry night.
5. Desktop and mobile playback pass without console errors.

Next decision:

1. Review the complete 65-second background journey in motion.
2. Refine any world or bridge whose density, terrain, or lighting feels wrong.
3. Lock the background journey.
4. Begin the separate feature-overlay and character-interaction phase.

Acceptance questions:

- Can each world be identified without a title?
- Does the terrain evolve rather than merely change decoration?
- Can Polli walk through every scene without jumping vertically?
- Does the sky progress naturally from sunrise to night?
- Is there enough negative space for later animated features?
- Does the final night feel warm, communal, and conclusive?

## Working principle

**Keep the journey geometry continuous and let the world transform.**

Polli is one character, never a stack of character layers. Walking and flying sprites must switch mutually exclusively inside the same character container so only one complete Polli can be visible at any instant.
