import { type CSSProperties, useEffect, useRef, useState } from "react";

const STAGES = [
    {
        segment: "welcome",
        headline: "Welcome to Pollinations.",
        caption:
            "Polli calls the API, starts the soundtrack and opens the world.",
        duration: 6_000,
        camera: 0,
    },
    {
        segment: "start-free",
        headline: "Start with free Pollen.",
        caption:
            "Complete a Quest and receive Quest Pollen to begin exploring and building.",
        duration: 10_000,
        camera: 0.2,
    },
    {
        segment: "building-tools",
        headline: "Building tools.",
        caption:
            "App hosting, the Gen API, media hosting, MCP, SDK and the wallet appear one by one.",
        duration: 25_000,
        camera: 0.4,
    },
    {
        segment: "publish",
        headline: "Publish on Pollen.",
        caption:
            "Publish an app, a model and an agent through the same open platform.",
        duration: 12_000,
        camera: 0.6,
    },
    {
        segment: "earn",
        headline: "Earn Pollen.",
        caption:
            "Useful activity flows back to the maker while users remain in control of their wallet.",
        duration: 10_000,
        camera: 0.8,
    },
    {
        segment: "build-together",
        headline: "Open source. Built together.",
        caption:
            "Apps, users, builders, models and agents meet in one large, active community.",
        duration: 15_000,
        camera: 1,
    },
] as const;

const STAGE_STARTS = STAGES.map((_, index) =>
    STAGES.slice(0, index).reduce((total, stage) => total + stage.duration, 0),
);
const TOTAL_MS = STAGES.reduce((total, stage) => total + stage.duration, 0);
const PANORAMA =
    "/characters/bee-story/gpt-image-2/panorama-blockout/world-panorama.webp";

function stageAt(elapsed: number) {
    for (let index = STAGE_STARTS.length - 1; index >= 0; index -= 1) {
        if (elapsed >= STAGE_STARTS[index]) return index;
    }
    return 0;
}

export function ThreeWays() {
    const [phase, setPhase] = useState(0);
    const [soundOn, setSoundOn] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [inView, setInView] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const startedAt = useRef(0);
    const phaseRef = useRef(0);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(query.matches);
        const onChange = (event: MediaQueryListEvent) =>
            setReducedMotion(event.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const observer = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { rootMargin: "240px 0px", threshold: 0.01 },
        );
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        if (reducedMotion) {
            setPhase(STAGES.length - 1);
            return;
        }
        if (!inView) return;

        startedAt.current = performance.now() - STAGE_STARTS[phaseRef.current];
        const interval = window.setInterval(() => {
            const elapsed = (performance.now() - startedAt.current) % TOTAL_MS;
            setPhase(stageAt(elapsed));
        }, 200);
        return () => window.clearInterval(interval);
    }, [inView, reducedMotion]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (!soundOn || phase === 0 || !inView) {
            audio.pause();
            return;
        }
        if (audio.paused) {
            audio.currentTime = 0;
            void audio.play().catch(() => setSoundOn(false));
        }
    }, [inView, phase, soundOn]);

    function toggleSound() {
        const audio = audioRef.current;
        if (!audio) return;
        if (soundOn) {
            audio.pause();
            setSoundOn(false);
            return;
        }
        setSoundOn(true);
        if (phase > 0) {
            audio.currentTime = 0;
            void audio.play().catch(() => setSoundOn(false));
        }
    }

    return (
        <section className="flex flex-col gap-5">
            <div
                ref={stageRef}
                className="bee-story-stage bee-story-stage--storyboard"
                data-phase={phase}
                data-segment={STAGES[phase].segment}
            >
                <audio
                    ref={audioRef}
                    loop
                    preload="metadata"
                    src="/characters/bee-story/machine-garden-story-78s.mp3"
                >
                    <track
                        default
                        kind="captions"
                        label="English"
                        src="/characters/bee-story/hive-soundtrack.vtt"
                        srcLang="en"
                    />
                </audio>

                <button
                    type="button"
                    className="bee-story-sound"
                    aria-label={
                        soundOn
                            ? "Mute animation soundtrack"
                            : "Play animation soundtrack"
                    }
                    aria-pressed={soundOn}
                    onClick={toggleSound}
                >
                    <span aria-hidden="true">{soundOn ? "♫" : "×"}</span>
                    sound {soundOn ? "on" : "off"}
                </button>

                <div aria-hidden="true" className="bee-story-world">
                    <img
                        alt=""
                        src={PANORAMA}
                        style={
                            {
                                "--camera-x": `${STAGES[phase].camera * -500}%`,
                            } as CSSProperties
                        }
                    />
                </div>

                <div
                    key={STAGES[phase].segment}
                    aria-hidden="true"
                    className="bee-story-cast"
                >
                    <div className="bee-story-sprite bee-story-polli" />
                    <div className="bee-story-sprite bee-story-robot" />
                    <div className="bee-story-sprite bee-story-nomnom" />
                </div>

                <ol className="sr-only">
                    {STAGES.map((stage) => (
                        <li key={stage.headline}>
                            {stage.headline} {stage.caption}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
