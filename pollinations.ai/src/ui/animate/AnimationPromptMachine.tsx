import { Pollinations } from "@pollinations/sdk";
import { useAuthActions, useAuthState } from "@pollinations/sdk/react";
import {
    Alert,
    Button,
    ClipboardIcon,
    CopyButton,
    DownloadIcon,
    FieldStack,
    Heading,
    Input,
    SparklesIcon,
    Surface,
    Switch,
    Text,
    Textarea,
} from "@pollinations/ui";
import { useMemo, useState } from "react";
import {
    ANIMATION_DIRECTOR_PROMPT,
    ANIMATION_PLAN_SCHEMA,
    type AnimationAsset,
    type AnimationPlan,
    type AnimationShot,
    animationPlanFilename,
    animationRequest,
    DEFAULT_ANIMATION_BRIEF,
    formatAnimationPlan,
    parseAnimationPlan,
} from "./animationPlan";

type ViteImportMeta = ImportMeta & {
    env?: { VITE_POLLINATIONS_API_BASE_URL?: string };
};

const API_BASE_URL = (
    (import.meta as ViteImportMeta).env?.VITE_POLLINATIONS_API_BASE_URL ||
    "https://gen.pollinations.ai"
).replace(/\/$/, "");

const ASPECT_RATIOS = ["3:2", "16:9", "9:16", "1:1"];

function errorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : "The animation plan could not be generated.";
}

function promptCopyButton({ value, label }: { value: string; label: string }) {
    return (
        <CopyButton value={value} tooltip={null} className="polli:gap-2">
            {(copied) => (
                <>
                    <ClipboardIcon className="h-4 w-4" />
                    {copied ? "Copied" : label}
                </>
            )}
        </CopyButton>
    );
}

function AssetCard({ asset }: { asset: AnimationAsset }) {
    return (
        <Surface className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Text size="micro" tone="muted" weight="bold">
                        {asset.type.toUpperCase()}
                    </Text>
                    <Heading as="h3" size="card">
                        {asset.name}
                    </Heading>
                </div>
                {promptCopyButton({
                    value: asset.prompt,
                    label: "Copy prompt",
                })}
            </div>
            <Text size="sm">{asset.purpose}</Text>
            <div className="rounded-lg bg-theme-bg-subtle p-3 text-sm leading-6 text-theme-text-base">
                {asset.prompt}
            </div>
            <Text size="xs" tone="muted">
                Required views: {asset.requiredViews.join(" · ")}
            </Text>
        </Surface>
    );
}

function ShotCard({ shot }: { shot: AnimationShot }) {
    return (
        <Surface as="details" className="group p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                    <Text size="micro" tone="muted" weight="bold">
                        {shot.id.toUpperCase()} · {shot.durationSeconds} SECONDS
                    </Text>
                    <Heading as="h3" size="card">
                        {shot.title}
                    </Heading>
                </div>
                <span
                    aria-hidden="true"
                    className="text-xl text-theme-text-muted transition-transform group-open:rotate-45"
                >
                    +
                </span>
            </summary>
            <div className="flex flex-col gap-5 border-t border-theme-border/30 p-4">
                <Text size="sm">{shot.storyBeat}</Text>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="font-semibold text-theme-text-strong">
                            Start frame
                        </dt>
                        <dd className="mt-1 text-theme-text-base">
                            {shot.startFrame}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-semibold text-theme-text-strong">
                            End frame
                        </dt>
                        <dd className="mt-1 text-theme-text-base">
                            {shot.endFrame}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-semibold text-theme-text-strong">
                            Action
                        </dt>
                        <dd className="mt-1 text-theme-text-base">
                            {shot.action}
                        </dd>
                    </div>
                    <div>
                        <dt className="font-semibold text-theme-text-strong">
                            Camera
                        </dt>
                        <dd className="mt-1 text-theme-text-base">
                            {shot.camera}
                        </dd>
                    </div>
                </dl>
                <div className="flex flex-col gap-2 rounded-lg bg-theme-bg-subtle p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Text size="xs" weight="bold">
                            KEYFRAME PROMPT
                        </Text>
                        {promptCopyButton({
                            value: shot.keyframePrompt,
                            label: "Copy",
                        })}
                    </div>
                    <Text size="sm">{shot.keyframePrompt}</Text>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-theme-bg-subtle p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Text size="xs" weight="bold">
                            MOTION PROMPT
                        </Text>
                        {promptCopyButton({
                            value: shot.motionPrompt,
                            label: "Copy",
                        })}
                    </div>
                    <Text size="sm">{shot.motionPrompt}</Text>
                </div>
                <Text size="xs" tone="muted">
                    Transition: {shot.transitionOut} · Sound: {shot.sound}
                </Text>
            </div>
        </Surface>
    );
}

function PlanResult({ plan }: { plan: AnimationPlan }) {
    const markdown = useMemo(() => formatAnimationPlan(plan), [plan]);
    const json = useMemo(() => JSON.stringify(plan, null, 2), [plan]);
    const downloadHref = useMemo(
        () => `data:application/json;charset=utf-8,${encodeURIComponent(json)}`,
        [json],
    );
    const plannedDuration = plan.shots.reduce(
        (total, shot) => total + shot.durationSeconds,
        0,
    );

    return (
        <div className="flex min-w-0 flex-col gap-8">
            <Surface variant="card-themed" className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                        <Text size="micro" tone="muted" weight="bold">
                            ANIMATION BLUEPRINT
                        </Text>
                        <Heading as="h2">{plan.projectTitle}</Heading>
                        <Text className="mt-2">{plan.summary}</Text>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {promptCopyButton({
                            value: markdown,
                            label: "Copy prompt pack",
                        })}
                        <Button
                            as="a"
                            href={downloadHref}
                            download={animationPlanFilename(plan.projectTitle)}
                            intent="neutral"
                            className="polli:gap-2"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Download JSON
                        </Button>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-theme-bg-subtle p-3">
                        <Text size="micro" tone="muted" weight="bold">
                            DELIVERY
                        </Text>
                        <Text size="sm" weight="semibold">
                            {plan.format.aspectRatio} · {plan.format.fps} fps
                        </Text>
                    </div>
                    <div className="rounded-lg bg-theme-bg-subtle p-3">
                        <Text size="micro" tone="muted" weight="bold">
                            TIMELINE
                        </Text>
                        <Text size="sm" weight="semibold">
                            {plannedDuration}s · {plan.shots.length} shots
                        </Text>
                    </div>
                    <div className="rounded-lg bg-theme-bg-subtle p-3">
                        <Text size="micro" tone="muted" weight="bold">
                            SOURCE ASSETS
                        </Text>
                        <Text size="sm" weight="semibold">
                            {plan.assets.length} prompts
                        </Text>
                    </div>
                </div>
            </Surface>

            <section className="flex flex-col gap-4">
                <div>
                    <Heading as="h2">Make these assets first</Heading>
                    <Text size="sm" tone="muted" className="mt-1">
                        Stable source art gives every generated shot the same
                        cast and world.
                    </Text>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                    {plan.assets.map((asset) => (
                        <AssetCard key={asset.id} asset={asset} />
                    ))}
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <div>
                    <Heading as="h2">Shot-by-shot prompts</Heading>
                    <Text size="sm" tone="muted" className="mt-1">
                        Generate the keyframe, then animate it with the matching
                        motion prompt.
                    </Text>
                </div>
                <div className="flex flex-col gap-3">
                    {plan.shots.map((shot) => (
                        <ShotCard key={shot.id} shot={shot} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export function AnimationPromptMachine() {
    const { apiKey, isHydrated } = useAuthState();
    const { login } = useAuthActions();
    const [brief, setBrief] = useState(DEFAULT_ANIMATION_BRIEF);
    const [durationSeconds, setDurationSeconds] = useState(45);
    const [aspectRatio, setAspectRatio] = useState("3:2");
    const [usePolliWorld, setUsePolliWorld] = useState(true);
    const [plan, setPlan] = useState<AnimationPlan | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function generate() {
        const trimmedBrief = brief.trim();
        if (!apiKey) {
            setError("Connect your Pollinations account before generating.");
            return;
        }
        if (!trimmedBrief) {
            setError("Describe the animation you want to make.");
            return;
        }
        if (durationSeconds < 5 || durationSeconds > 180) {
            setError("Choose a duration between 5 and 180 seconds.");
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const client = new Pollinations({
                apiKey,
                baseUrl: API_BASE_URL,
            });
            const response = await client.chat(
                [
                    { role: "system", content: ANIMATION_DIRECTOR_PROMPT },
                    {
                        role: "user",
                        content: animationRequest({
                            brief: trimmedBrief,
                            durationSeconds,
                            aspectRatio,
                            usePolliWorld,
                        }),
                    },
                ],
                {
                    model: "openai-large",
                    temperature: 0.4,
                    maxTokens: 12_000,
                    private: true,
                    responseFormat: {
                        type: "json_schema",
                        json_schema: {
                            name: "animation_prompt_pack",
                            description:
                                "A production-ready asset and shot prompt pack for a short animation.",
                            schema: ANIMATION_PLAN_SCHEMA,
                            strict: true,
                        },
                    },
                },
            );
            const content = response.choices[0]?.message.content;
            if (typeof content !== "string") {
                throw new Error("The model did not return an animation plan.");
            }
            setPlan(parseAnimationPlan(content));
        } catch (generationError) {
            setError(errorMessage(generationError));
        } finally {
            setIsGenerating(false);
        }
    }

    const needsConnection = isHydrated && !apiKey;

    return (
        <div className="flex flex-col gap-10">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <Surface variant="card-themed" className="flex flex-col gap-5">
                    <div>
                        <Heading as="h2">One brief in.</Heading>
                        <Text size="sm" tone="muted" className="mt-1">
                            The machine turns it into source assets, clean
                            keyframes and controllable motion prompts.
                        </Text>
                    </div>
                    <FieldStack
                        label="Creative brief"
                        helper="Describe the story and feeling. The machine handles shot structure and continuity."
                    >
                        <Textarea
                            value={brief}
                            onChange={(event) => setBrief(event.target.value)}
                            rows={12}
                            disabled={isGenerating}
                        />
                    </FieldStack>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FieldStack label="Duration">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={5}
                                    max={180}
                                    value={durationSeconds}
                                    onChange={(event) =>
                                        setDurationSeconds(
                                            Number(event.target.value),
                                        )
                                    }
                                    disabled={isGenerating}
                                    hideNumberSteppers
                                    className="polli:w-full"
                                />
                                <Text size="sm" tone="muted">
                                    sec
                                </Text>
                            </div>
                        </FieldStack>
                        <FieldStack label="Canvas">
                            <select
                                value={aspectRatio}
                                onChange={(event) =>
                                    setAspectRatio(event.target.value)
                                }
                                disabled={isGenerating}
                                className="h-[42px] w-full rounded-lg border border-theme-border bg-surface-opaque px-3 text-theme-text-strong disabled:opacity-50"
                            >
                                {ASPECT_RATIOS.map((ratio) => (
                                    <option key={ratio} value={ratio}>
                                        {ratio}
                                    </option>
                                ))}
                            </select>
                        </FieldStack>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg bg-theme-bg-subtle p-3">
                        <div>
                            <Text size="sm" weight="semibold">
                                Lock to the Polli world
                            </Text>
                            <Text size="xs" tone="muted">
                                Uses the approved palette, motion and continuity
                                rules.
                            </Text>
                        </div>
                        <Switch
                            checked={usePolliWorld}
                            onChange={setUsePolliWorld}
                            disabled={isGenerating}
                            ariaLabel="Lock to the Polli world"
                        />
                    </div>
                    {error && (
                        <Alert intent="danger" title="Could not make the pack">
                            {error}
                        </Alert>
                    )}
                    {needsConnection ? (
                        <Button
                            size="lg"
                            onClick={() => login()}
                            className="polli:w-full polli:gap-2"
                        >
                            Connect to generate
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            onClick={generate}
                            disabled={isGenerating || !brief.trim()}
                            className="polli:w-full polli:gap-2"
                        >
                            <SparklesIcon className="h-4 w-4" />
                            {isGenerating
                                ? "Directing the shots…"
                                : plan
                                  ? "Generate a new pack"
                                  : "Make the prompt pack"}
                        </Button>
                    )}
                    <Text size="xs" tone="muted">
                        Generation is private and uses your connected Pollen
                        balance.
                    </Text>
                </Surface>

                {plan ? (
                    <PlanResult plan={plan} />
                ) : (
                    <Surface className="flex min-h-[34rem] flex-col items-center justify-center gap-4 text-center">
                        <div className="rounded-full bg-theme-bg-active p-4 text-theme-text-strong">
                            <SparklesIcon className="h-8 w-8" />
                        </div>
                        <div className="max-w-md">
                            <Heading as="h2">
                                A production plan appears here.
                            </Heading>
                            <Text tone="muted" className="mt-2">
                                You will get the source artwork prompts first,
                                followed by one expandable card for every shot.
                            </Text>
                        </div>
                    </Surface>
                )}
            </div>
        </div>
    );
}
