export type AnimationCharacter = {
    name: string;
    role: string;
    appearanceLock: string;
    motionLock: string;
    forbiddenChanges: string[];
};

export type AnimationAsset = {
    id: string;
    type:
        | "character-master"
        | "walk-cycle"
        | "background-plate"
        | "prop"
        | "reference-frame";
    name: string;
    purpose: string;
    prompt: string;
    requiredViews: string[];
};

export type AnimationShot = {
    id: string;
    title: string;
    durationSeconds: number;
    storyBeat: string;
    subjects: string[];
    startFrame: string;
    endFrame: string;
    action: string;
    camera: string;
    transitionOut: string;
    sound: string;
    keyframePrompt: string;
    motionPrompt: string;
    continuityAnchors: string[];
};

export type AnimationPlan = {
    projectTitle: string;
    summary: string;
    format: {
        aspectRatio: string;
        totalDurationSeconds: number;
        fps: number;
        delivery: string;
    };
    artDirection: {
        visualStyle: string;
        palette: string[];
        lighting: string;
        composition: string;
        texture: string;
    };
    motionLanguage: {
        pacing: string;
        characterMotion: string;
        cameraMotion: string;
        transitionRules: string[];
    };
    characters: AnimationCharacter[];
    assets: AnimationAsset[];
    globalNegativePrompt: string;
    shots: AnimationShot[];
    assemblyNotes: string[];
};

export const DEFAULT_ANIMATION_BRIEF = `Create the Pollinations homepage journey as one continuous story. Polli enters through the gate, completes quests and earns glowing Pollen; Text, Image, Audio, Video, Realtime, Embeddings and Agent friends walk past; developer tools grow into the landscape; three visitors use an App, Model and Agent and send Pollen to the creator; then everyone travels together into the waiting community. It should feel playful, warm and polished, with simple readable action and no awkward AI morphing.`;

const POLLI_WORLD_RULES = `
Use the approved Pollinations world:
- One continuous cozy 2D pixel-art journey on a 3:2 canvas, with chunky 8-bit clusters and gentle technology in warm nature.
- Palette: lime #ecf874, cream, mint, lavender, peach and dark purple #110518. No humans, realism, cyberpunk, harsh neon or corporate illustration.
- Polli normally travels screen-right. The capability friends enter from screen-right and travel screen-left on one shared foot-contact line.
- The landscape moves right-to-left at a constant pace. World-attached objects leave with the landscape.
- Nothing fades. Use travel beyond frame, growth, collapse, sparkle or flight for entrances and exits.
- Polli is one character layer. A ground pose and flight pose may switch but must never appear together.
- Walking uses a locked master design and a real 1-2-3-2 cycle. Only limbs and a small body bounce change. Identity, palette, prop, label, scale, facing and perspective stay fixed.
- Pollen is shown as glowing grains, never coins. The green Quest pot and gold Paid pot remain visually consistent.
- Any written chapter labels should be added later as HTML or an editing overlay, not generated into image frames.
`;

export const ANIMATION_DIRECTOR_PROMPT = `You are a senior animation director and prompt engineer. Convert one creative brief into a production-ready animation prompt pack for a hybrid image-generation and image-to-video workflow.

The pack must be practical, visually coherent and designed to avoid common generative-video failures: identity drift, limb morphing, sliding feet, random camera movement, changing props, illegible generated text and uncontrolled scene transitions.

Production rules:
1. Break the story into short controllable shots, normally 3-8 seconds each. Never ask a video model to create the whole film in one generation.
2. Give each shot one dominant action. State the start pose, end pose, screen direction, foot contact and camera behavior concretely.
3. Create reusable assets before shots: character masters, real walk-cycle poses, clean background plates and important props. Asset prompts must request isolated, reusable source art where appropriate.
4. Every character gets a compact appearance lock and motion lock. Repeat the relevant locks in asset and keyframe prompts instead of referring vaguely to "the same character".
5. Keyframe prompts describe a still image: exact subject placement, pose, environment, composition, light, palette and style. They must be self-contained.
6. Motion prompts describe only the change through time: subject motion, camera motion, timing, start state, end state and what must remain locked. Do not ask the video model to redesign the art.
7. Prefer pose-to-pose animation, held background plates and controlled parallax over unconstrained text-to-video walking.
8. Preserve screen direction and spatial geography across shot boundaries. End frames should make the next shot easy to begin.
9. Do not generate logos, captions or important words inside imagery unless the brief explicitly requires them. Plan text as an editorial overlay.
10. The requested durations must add up to the requested total, within one second. Use 24 fps unless another frame rate is necessary.
11. Be decisive. Do not include alternatives, commentary, markdown or prose outside the requested JSON object.`;

export const ANIMATION_PLAN_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: [
        "projectTitle",
        "summary",
        "format",
        "artDirection",
        "motionLanguage",
        "characters",
        "assets",
        "globalNegativePrompt",
        "shots",
        "assemblyNotes",
    ],
    properties: {
        projectTitle: { type: "string" },
        summary: { type: "string" },
        format: {
            type: "object",
            additionalProperties: false,
            required: [
                "aspectRatio",
                "totalDurationSeconds",
                "fps",
                "delivery",
            ],
            properties: {
                aspectRatio: { type: "string" },
                totalDurationSeconds: { type: "number" },
                fps: { type: "number" },
                delivery: { type: "string" },
            },
        },
        artDirection: {
            type: "object",
            additionalProperties: false,
            required: [
                "visualStyle",
                "palette",
                "lighting",
                "composition",
                "texture",
            ],
            properties: {
                visualStyle: { type: "string" },
                palette: { type: "array", items: { type: "string" } },
                lighting: { type: "string" },
                composition: { type: "string" },
                texture: { type: "string" },
            },
        },
        motionLanguage: {
            type: "object",
            additionalProperties: false,
            required: [
                "pacing",
                "characterMotion",
                "cameraMotion",
                "transitionRules",
            ],
            properties: {
                pacing: { type: "string" },
                characterMotion: { type: "string" },
                cameraMotion: { type: "string" },
                transitionRules: {
                    type: "array",
                    items: { type: "string" },
                },
            },
        },
        characters: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: [
                    "name",
                    "role",
                    "appearanceLock",
                    "motionLock",
                    "forbiddenChanges",
                ],
                properties: {
                    name: { type: "string" },
                    role: { type: "string" },
                    appearanceLock: { type: "string" },
                    motionLock: { type: "string" },
                    forbiddenChanges: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
            },
        },
        assets: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: [
                    "id",
                    "type",
                    "name",
                    "purpose",
                    "prompt",
                    "requiredViews",
                ],
                properties: {
                    id: { type: "string" },
                    type: {
                        type: "string",
                        enum: [
                            "character-master",
                            "walk-cycle",
                            "background-plate",
                            "prop",
                            "reference-frame",
                        ],
                    },
                    name: { type: "string" },
                    purpose: { type: "string" },
                    prompt: { type: "string" },
                    requiredViews: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
            },
        },
        globalNegativePrompt: { type: "string" },
        shots: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: [
                    "id",
                    "title",
                    "durationSeconds",
                    "storyBeat",
                    "subjects",
                    "startFrame",
                    "endFrame",
                    "action",
                    "camera",
                    "transitionOut",
                    "sound",
                    "keyframePrompt",
                    "motionPrompt",
                    "continuityAnchors",
                ],
                properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    durationSeconds: { type: "number" },
                    storyBeat: { type: "string" },
                    subjects: {
                        type: "array",
                        items: { type: "string" },
                    },
                    startFrame: { type: "string" },
                    endFrame: { type: "string" },
                    action: { type: "string" },
                    camera: { type: "string" },
                    transitionOut: { type: "string" },
                    sound: { type: "string" },
                    keyframePrompt: { type: "string" },
                    motionPrompt: { type: "string" },
                    continuityAnchors: {
                        type: "array",
                        items: { type: "string" },
                    },
                },
            },
        },
        assemblyNotes: {
            type: "array",
            items: { type: "string" },
        },
    },
} as const;

export function animationRequest({
    brief,
    durationSeconds,
    aspectRatio,
    usePolliWorld,
}: {
    brief: string;
    durationSeconds: number;
    aspectRatio: string;
    usePolliWorld: boolean;
}) {
    return `CREATIVE BRIEF\n${brief.trim()}\n\nDELIVERY\n- Total duration: ${durationSeconds} seconds\n- Aspect ratio: ${aspectRatio}\n- Output: a polished website animation assembled from short generated shots\n${
        usePolliWorld
            ? `\nWORLD PRESET\n${POLLI_WORLD_RULES}`
            : "\nWORLD PRESET\nCreate a coherent original world from the brief and lock it across every asset and shot."
    }`;
}

export function parseAnimationPlan(content: string): AnimationPlan {
    const cleaned = content
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "");
    const value = JSON.parse(cleaned) as Partial<AnimationPlan>;

    if (
        !value.projectTitle ||
        !value.format ||
        !value.artDirection ||
        !value.motionLanguage ||
        !Array.isArray(value.assets) ||
        !Array.isArray(value.shots) ||
        value.shots.length === 0
    ) {
        throw new Error("The model returned an incomplete animation plan.");
    }

    return value as AnimationPlan;
}

export function formatAnimationPlan(plan: AnimationPlan): string {
    const assets = plan.assets
        .map(
            (asset) =>
                `### ${asset.id} — ${asset.name}\n${asset.purpose}\n\nPrompt: ${asset.prompt}\n\nViews: ${asset.requiredViews.join(", ")}`,
        )
        .join("\n\n");
    const shots = plan.shots
        .map(
            (shot) =>
                `### ${shot.id} — ${shot.title} (${shot.durationSeconds}s)\n${shot.storyBeat}\n\nStart: ${shot.startFrame}\nEnd: ${shot.endFrame}\nAction: ${shot.action}\nCamera: ${shot.camera}\nTransition: ${shot.transitionOut}\nSound: ${shot.sound}\n\nKeyframe prompt: ${shot.keyframePrompt}\n\nMotion prompt: ${shot.motionPrompt}\n\nContinuity: ${shot.continuityAnchors.join("; ")}`,
        )
        .join("\n\n");

    return `# ${plan.projectTitle}\n\n${plan.summary}\n\n## Format\n${plan.format.aspectRatio}, ${plan.format.totalDurationSeconds}s, ${plan.format.fps} fps — ${plan.format.delivery}\n\n## Art direction\n${plan.artDirection.visualStyle}\nPalette: ${plan.artDirection.palette.join(", ")}\nLighting: ${plan.artDirection.lighting}\nComposition: ${plan.artDirection.composition}\nTexture: ${plan.artDirection.texture}\n\n## Global negative prompt\n${plan.globalNegativePrompt}\n\n## Assets to create first\n\n${assets}\n\n## Shot prompts\n\n${shots}\n\n## Assembly notes\n${plan.assemblyNotes.map((note) => `- ${note}`).join("\n")}`;
}

export function animationPlanFilename(title: string): string {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
    return `${slug || "animation"}-prompt-pack.json`;
}
