# Pollinations World Journey

## Experience

The homepage story is one continuous 2D pixel-art journey, not a slideshow. Polli travels through a changing world while product ideas appear as physical characters and objects.

The current sequence is:

1. **Start Free** — Polli enters through the Pollinations gate, completes Quests, and earns Pollen.
2. **Generate AI Media** — Text, Image, Audio, Video, Real-time, Embeddings, and Agents walk in from screen-right.
3. **Build Your Way** — Pollen Wallet, CLI, MCP, and Media Storage grow into the landscape.
4. **Connect · Publish · Earn** — visitors use an App, Model, and Agent; the resulting Pollen flows to the developer wallet.
5. **Community** — Polli and the three visitors resume their journey and join the waiting Pollinations community.

## Non-negotiable motion rules

- The landscape moves from right to left at one constant pace, except for the approved nine-second Earn hold.
- Polli normally travels screen-right. Generate AI Media friends travel screen-left, opposite Polli.
- Nothing fades in or out. Entrances and exits use movement, growth, collapse, sparkle, flight, or natural travel beyond the viewport.
- World-attached objects leave because the world moves. Do not hide them early or give them an independent exit.
- Approved assets are source components. Integration may change global timing and scale, but must not redraw or substitute them.
- Polli is a single character layer. Ground and flight poses may switch, but must never appear together.
- The final Community scene is continuous with Earn. The camera resumes before the finale becomes visible; there is no hard cut.

## Coordinate system

- The animation canvas is always `3 / 2`.
- All animated sizes and distances use container-relative units (`cqw`, `cqh`) or percentages of their scene layer.
- Do not use browser viewport units, breakpoint-specific character sizes, or fixed pixel widths for animated objects.
- Review controls live outside the canvas and may use normal interface units.

## Phase contracts

### Start Free

- The opening holds for one second before Polli follows the road through the gate.
- Computer Head and Nom Nom remain attached to the opening world and leave naturally with it.
- `EVERYONE STARTS FREE` is the first written message.
- The message sequence is `COMPLETE A QUEST` → `EARN YOUR FIRST POLLEN` → `COMPLETE MORE QUESTS / KEEP EARNING POLLEN`.
- Pollen is shown as glowing grains, never coins.
- Quest rewards flow into the green Quest pot. The gold Paid pot and green Quest pot remain the persistent wallet language.

### Generate AI Media

- `GENERATE AI MEDIA` stays visible for the complete parade.
- Friends appear in this order: Text, Image, Audio, Video, Real-time, Embeddings, Agents.
- Every friend enters from the right, faces left, shares one foot-contact line, and cycles `1 → 2 → 3 → 2`.
- Polli flies to the top-left while the group passes, then returns to the road.
- Paid and Quest Pollen travel from the matching pots to the friends only between the first and last center crossings.

### Build Your Way

- Pollen Wallet, CLI, MCP, and Media Storage are landscape landmarks on one tight rhythm.
- Each landmark grows from a compressed seed burst, remains fully visible, and exits only with the panorama.
- `POLLEN WALLET` is the public term. Do not expose the internal BYOP label here.
- Media Storage represents image, audio, and video storage only; it does not imply app, model, or agent hosting.
- No extra Nom Nom or Computer Head sprites appear in this phase.

### Connect · Publish · Earn

- The camera pauses while App, Model, and Agent stations replace one another at the center.
- Three non-human visitors enter and remain: sky bird receives Image, moss acorn receives Text, lantern salamander receives Video.
- Each delivery sends Paid and Quest Pollen directly to the matching persistent pots.
- Polli stays near the upper-left, clear of the stations and wallet flow.
- When the phase ends, the two left-facing visitors turn before the group begins travelling screen-right.

### Community

- Polli and the three Earn visitors continue into the finale; do not replace them with duplicates.
- They visibly walk or fly together while the camera resumes.
- Waiting community characters are already positioned in the destination.
- The travelling group settles into open positions without overlaps.
- GitHub and Discord remain visible as community characters.
- The ending holds briefly with subtle celebration and no phase banner.

## Character motion contract

1. Lock one approved master design.
2. Change only limb pose and small body bounce between frames.
3. Preserve identity, facing direction, palette, prop, label, scale, and perspective.
4. Frame 3 must genuinely swap the leading leg; changing only foot spacing is invalid.
5. Use `capability-parade-v2/opposite-step-pose-guide.svg` to check leg ownership.
6. Reject painted checkerboards, inconsistent crops, duplicate steps, or a character turning inside a fixed square.

## Art direction

Source of truth:

- `operations/social/prompts/brand/visual.md`
- `operations/social/prompts/brand/bee.md`
- `operations/social/prompts/brand/characters-ref.jpg`

Keep the world cozy, chunky, minimal, and readable: large 8-bit pixel clusters, warm nature, gentle technology, lime `#ecf874`, cream, mint, lavender, peach, and dark purple `#110518`. No humans, realistic rendering, cyberpunk imagery, harsh neon, or corporate illustration.
