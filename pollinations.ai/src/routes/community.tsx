import { ArrowRightIcon, Button, Chip, Surface } from "@pollinations/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
    DISCORD_URL,
    REPO_URL,
    SUPPORTERS,
    useBuildDiary,
    useContributorCount,
    useContributors,
    useDiscordPresence,
    useVotingIssues,
} from "../data/community";
import {
    compact,
    useAppDirectory,
    usePlatformStats,
} from "../data/publicStats";
import { routeHead } from "../routeMeta";
import {
    ActionButton,
    ArrowLink,
    CalloutPanel,
    Card,
    Hero,
    PageHeader,
    PixelLabel,
    SectionHeader,
    StatRow,
} from "../ui/site/kit";

export const Route = createFileRoute("/community")({
    head: () => routeHead("/community"),
    component: CommunityPage,
});

/** The three doors in, in the order they cost you effort. */
const WAYS_IN = [
    {
        label: "Ship",
        title: "Ship an app",
        body: "Share what you built, get feedback, and help users discover it.",
        linkLabel: "Submit your app",
        href: "https://github.com/pollinations/pollinations/issues/new?template=APP-SUBMISSION.yml",
    },
    {
        label: "Code",
        title: "Fix a bug or improve the docs",
        body: "Open a PR, close an issue, or improve the examples.",
        linkLabel: "Good first issues",
        href: `${REPO_URL}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22`,
    },
    {
        label: "Talk",
        title: "Help in Discord",
        body: "Answer questions, share experiments, and tell the team what feels missing.",
        linkLabel: "Join the Discord",
        href: DISCORD_URL,
    },
];

const FEED_SKELETON_KEYS = ["first", "second", "third", "fourth"];
const CONTRIBUTOR_COUNT_FALLBACK = 136;

/**
 * Every feed on this page can fail — GitHub is rate-limited per visitor IP and
 * Discord's widget can be off. Returning null on failure quietly deleted whole
 * sections, so on a bad day the page was a hero and a CTA with no sign that
 * anything was missing. Each section now says what it could not load.
 */
function FeedState({
    loading,
    failed,
    what,
    rows = 3,
}: {
    loading: boolean;
    failed: boolean;
    what: string;
    rows?: number;
}) {
    if (loading) {
        return (
            <div className="flex flex-col gap-3" aria-busy="true">
                {FEED_SKELETON_KEYS.slice(0, rows).map((key) => (
                    <div
                        key={key}
                        aria-hidden="true"
                        className="h-14 animate-pulse rounded-2xl bg-theme-bg-subtle"
                    />
                ))}
            </div>
        );
    }
    return (
        <p className="rounded-2xl border border-theme-border border-dashed px-5 py-6 text-sm text-theme-text-muted">
            {failed
                ? `${what} couldn’t be loaded right now.`
                : `No ${what.toLowerCase()} yet.`}
        </p>
    );
}

function BuildWithCommunity() {
    const { data: issues, loading, failed } = useVotingIssues();
    const bare = loading || failed || issues.length === 0;

    return (
        <section className="flex flex-col gap-7">
            <SectionHeader
                eyebrow="Build together"
                title="Build with the community"
                subtitle="Ship what you made, improve the open source platform, join the conversation, and vote on what comes next."
            />

            <div className="grid grid-cols-1 gap-5 min-[700px]:grid-cols-3">
                {WAYS_IN.map((way) => (
                    <Card
                        key={way.label}
                        className="gap-2.5 p-7 min-[700px]:p-5 lg:p-7"
                    >
                        <PixelLabel>{way.label}</PixelLabel>
                        <h3 className="font-body text-xl font-semibold text-theme-text-strong">
                            {way.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-theme-text-base">
                            {way.body}
                        </p>
                        <ArrowLink href={way.href} className="mt-auto pt-2">
                            {way.linkLabel}
                        </ArrowLink>
                    </Card>
                ))}
            </div>

            <Surface
                variant="card-themed"
                className="flex flex-col gap-5 p-5 sm:p-6"
            >
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex max-w-xl flex-col gap-2">
                        <PixelLabel>Have your say</PixelLabel>
                        <h3 className="font-subheading text-2xl leading-tight text-theme-text-strong sm:text-3xl">
                            Open votes
                        </h3>
                        <p className="text-sm leading-relaxed text-theme-text-base sm:text-base">
                            Community feedback shapes the roadmap. Add your vote
                            to the ideas you want the project to build next.
                        </p>
                    </div>
                    {!bare && (
                        <Chip size="sm" className="shrink-0 tabular-nums">
                            {issues.length} open
                        </Chip>
                    )}
                </div>

                {bare ? (
                    <FeedState
                        loading={loading}
                        failed={failed}
                        what="Open votes"
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-3 min-[700px]:grid-cols-3">
                        {issues.map((issue) => (
                            <Card
                                key={issue.number}
                                as="a"
                                href={issue.url}
                                className="group gap-5 rounded-2xl p-5"
                            >
                                <span className="font-semibold leading-snug text-theme-text-strong">
                                    {issue.title}
                                </span>
                                <span className="mt-auto flex items-center justify-between gap-3">
                                    <PixelLabel
                                        variant="chrome"
                                        className="tabular-nums"
                                    >
                                        {issue.votes} vote
                                        {issue.votes === 1 ? "" : "s"}
                                    </PixelLabel>
                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-theme-text-soft group-hover:text-theme-text-strong">
                                        Vote
                                        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                                    </span>
                                </span>
                            </Card>
                        ))}
                    </div>
                )}
            </Surface>
        </section>
    );
}

function BuildDiary() {
    const [rangeEnd, setRangeEnd] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const {
        data: diary,
        loading,
        failed,
    } = useBuildDiary(14, rangeEnd ?? undefined);
    const { days, hasEarlier, hasLater } = diary;
    const entries = days.filter((day) => day.title !== null);
    const selected =
        entries.find((day) => day.date === selectedDate) ??
        entries[entries.length - 1];
    const selectedIndex = selected
        ? entries.findIndex((day) => day.date === selected.date)
        : -1;
    const previous = selectedIndex > 0 ? entries[selectedIndex - 1] : null;
    const next =
        selectedIndex >= 0 && selectedIndex < entries.length - 1
            ? entries[selectedIndex + 1]
            : null;
    const maxPrs = Math.max(...days.map((day) => day.prCount), 1);
    const points = days.map((day, index) => ({
        day,
        x: days.length === 1 ? 50 : 2 + (index / (days.length - 1)) * 96,
        y: 92 - (day.prCount / maxPrs) * 84,
    }));
    const curve = points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        const previousPoint = points[index - 1];
        const midpoint = (previousPoint.x + point.x) / 2;
        return `${path} C ${midpoint} ${previousPoint.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`;
    }, "");
    const area = points.length
        ? `${curve} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`
        : "";
    const bare = loading || failed || entries.length === 0;

    const formatDate = (date: string, full = false) =>
        new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            ...(full ? { year: "numeric" } : {}),
            timeZone: "UTC",
        });

    const shiftRange = (amount: number) => {
        const edge = amount < 0 ? days[0] : days[days.length - 1];
        if (!edge) return;
        const date = new Date(`${edge.date}T00:00:00Z`);
        date.setUTCDate(date.getUTCDate() + amount);
        setRangeEnd(date.toISOString().slice(0, 10));
        setSelectedDate(null);
    };

    return (
        <section className="flex flex-col gap-5">
            <SectionHeader
                eyebrow="Build diary"
                title="What we shipped in the community"
                subtitle="One day, one picture, and the pull requests that moved the project forward."
            />
            {bare ? (
                <FeedState
                    loading={loading}
                    failed={failed}
                    what="The build diary"
                    rows={2}
                />
            ) : (
                <>
                    <Surface
                        variant="card-themed"
                        className="flex flex-col gap-4 p-5 sm:p-6"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <PixelLabel variant="chrome">
                                PRs merged per day
                            </PixelLabel>
                            <div className="flex flex-wrap items-center gap-2">
                                {selected && (
                                    <Chip size="sm">
                                        {selected.prCount} merged
                                    </Chip>
                                )}
                                <Button
                                    size="sm"
                                    intent="neutral"
                                    disabled={!hasEarlier}
                                    onClick={() => shiftRange(-1)}
                                    className="gap-1.5"
                                >
                                    <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
                                    Earlier
                                </Button>
                                <Button
                                    size="sm"
                                    intent="neutral"
                                    disabled={!hasLater}
                                    onClick={() => shiftRange(14)}
                                    className="gap-1.5"
                                >
                                    Later
                                    <ArrowRightIcon className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="relative h-44 min-w-0 pl-9 sm:h-52">
                            <span className="sr-only">
                                Pull requests merged per day
                            </span>
                            <span className="absolute top-0 left-0 text-micro text-theme-text-muted tabular-nums">
                                {maxPrs}
                            </span>
                            <span className="absolute top-1/2 left-0 -translate-y-1/2 text-micro text-theme-text-muted tabular-nums">
                                {Math.ceil(maxPrs / 2)}
                            </span>
                            <span className="absolute bottom-7 left-0 text-micro text-theme-text-muted tabular-nums">
                                0
                            </span>
                            <div className="absolute top-2 right-1 bottom-7 left-9">
                                <span className="absolute top-[8%] right-0 left-0 border-theme-border border-t border-dashed" />
                                <span className="absolute top-1/2 right-0 left-0 border-theme-border border-t border-dashed" />
                                <span className="absolute top-[92%] right-0 left-0 border-theme-border border-t border-dashed" />
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                    className="absolute inset-0 h-full w-full overflow-visible"
                                >
                                    <path
                                        d={area}
                                        fill="color-mix(in oklab, var(--polli-color-bg-active) 32%, transparent)"
                                    />
                                    <path
                                        d={curve}
                                        fill="none"
                                        stroke="var(--polli-color-text-soft)"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                                {points.map(({ day, x, y }) => {
                                    const active = day.date === selected?.date;
                                    const available = day.title !== null;
                                    return (
                                        <button
                                            key={day.date}
                                            type="button"
                                            disabled={!available}
                                            onClick={() =>
                                                setSelectedDate(day.date)
                                            }
                                            aria-label={`${formatDate(day.date, true)}: ${day.prCount} pull request${day.prCount === 1 ? "" : "s"} merged`}
                                            aria-pressed={active}
                                            title={`${formatDate(day.date, true)} · ${day.prCount} PR${day.prCount === 1 ? "" : "s"}`}
                                            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-transform motion-reduce:transition-none ${
                                                active
                                                    ? "size-5 border-theme-text-strong bg-theme-bg-active"
                                                    : available
                                                      ? "size-3 border-theme-text-soft bg-surface-opaque hover:scale-125"
                                                      : "size-2 cursor-default border-theme-border bg-theme-bg-subtle"
                                            }`}
                                            style={{
                                                left: `${x}%`,
                                                top: `${y}%`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            <div className="absolute right-1 bottom-0 left-9 flex justify-between text-micro text-theme-text-muted">
                                <span>{formatDate(days[0].date)}</span>
                                <span>
                                    {formatDate(
                                        days[days.length - 1]?.date ?? "",
                                    )}
                                </span>
                            </div>
                        </div>
                    </Surface>

                    {selected && (
                        <Surface
                            variant="card"
                            className="grid overflow-hidden p-0 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]"
                        >
                            <img
                                key={selected.imageUrl}
                                src={selected.imageUrl ?? undefined}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                className="aspect-[4/3] h-full min-h-0 w-full bg-theme-bg-subtle object-cover md:aspect-auto md:min-h-72"
                            />
                            <div className="flex min-w-0 flex-col gap-4 p-5 sm:p-7">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <PixelLabel variant="chrome">
                                        {formatDate(selected.date, true)}
                                    </PixelLabel>
                                    <Chip size="sm">
                                        {selected.prCount} PR
                                        {selected.prCount === 1 ? "" : "s"}
                                    </Chip>
                                </div>
                                <h3 className="font-subheading text-2xl leading-tight text-theme-text-strong sm:text-3xl">
                                    {selected.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-theme-text-base sm:text-base">
                                    {selected.summary}
                                </p>
                                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-2">
                                    {selected.url && (
                                        <ArrowLink href={selected.url}>
                                            See the day’s PRs
                                        </ArrowLink>
                                    )}
                                    <div className="ml-auto flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            intent="neutral"
                                            disabled={!previous}
                                            onClick={() =>
                                                previous &&
                                                setSelectedDate(previous.date)
                                            }
                                            aria-label="Previous diary entry"
                                            title="Previous day"
                                            className="h-9 w-9 p-0"
                                        >
                                            <ArrowRightIcon className="h-4 w-4 rotate-180" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            intent="neutral"
                                            disabled={!next}
                                            onClick={() =>
                                                next &&
                                                setSelectedDate(next.date)
                                            }
                                            aria-label="Next diary entry"
                                            title="Next day"
                                            className="h-9 w-9 p-0"
                                        >
                                            <ArrowRightIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Surface>
                    )}
                </>
            )}
        </section>
    );
}

function Contributors() {
    const { data: people, loading, failed } = useContributors();
    const bare = loading || people.length === 0;

    return (
        <section className="flex flex-col gap-5">
            <SectionHeader
                eyebrow="Contributors"
                title="Top contributors"
                subtitle="These contributors have helped build and improve the platform. Want to join them?"
                action={
                    <ArrowLink href={REPO_URL}>Open the repository</ArrowLink>
                }
            />
            {bare && (
                <FeedState
                    loading={loading}
                    failed={failed && people.length === 0}
                    what="Contributors"
                    rows={2}
                />
            )}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))] gap-3.5">
                {people.map((person) => (
                    <Card
                        key={person.login}
                        as="a"
                        href={person.profileUrl}
                        className="flex-row items-center gap-3.5 rounded-2xl p-4"
                    >
                        <img
                            src={`${person.avatarUrl}&s=80`}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            width={40}
                            height={40}
                            className="size-10 shrink-0 rounded-[10px] bg-theme-bg-subtle"
                        />
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate font-semibold text-sm text-theme-text-strong">
                                {person.login}
                            </span>
                            <span className="text-xs text-theme-text-muted tabular-nums">
                                {person.commits.toLocaleString()} commits
                            </span>
                        </span>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function CommunityPage() {
    const { data: online } = useDiscordPresence();
    const { data: contributorCount } = useContributorCount();
    const { data: platform } = usePlatformStats();
    const { data: apps } = useAppDirectory();
    const totalApps = apps.length;

    /** Only what we can actually measure — a missing feed drops its stat. */
    const stats = [
        online !== null && {
            value: String(online),
            label: "Discord online",
        },
        {
            value: compact(contributorCount ?? CONTRIBUTOR_COUNT_FALLBACK),
            label: "code contributors",
        },
        platform !== null && {
            value: compact(platform.community),
            label: "published models",
        },
        totalApps > 0 && {
            value: String(totalApps),
            label: "published apps",
        },
    ].filter((stat): stat is { value: string; label: string } => Boolean(stat));

    return (
        <>
            {/* The whole cast, together — the page is about the three of us
                being more than one of us. */}
            <Hero scene="/heroes/community.webp">
                <PageHeader
                    eyebrow="Open source, open roadmap"
                    title="Contribute"
                    subtitle={
                        <>
                            <strong>
                                Builders shape the platform directly.
                            </strong>{" "}
                            Share what you need, meet the people already using
                            it, and help decide what comes next.
                        </>
                    }
                />
                <StatRow stats={stats} placeholders={4} />
                <div className="flex flex-wrap gap-3">
                    <ActionButton href={DISCORD_URL}>Join Discord</ActionButton>
                    <ActionButton href={REPO_URL} tone="plain">
                        Star &amp; contribute
                    </ActionButton>
                </div>
            </Hero>

            <BuildWithCommunity />

            <BuildDiary />

            <Contributors />

            <section className="flex flex-col gap-5">
                <SectionHeader
                    eyebrow="Supporters"
                    title="Who keeps the GPUs warm"
                    subtitle="Their credits and infrastructure help people start building with free Pollen earned through Quests."
                />
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3.5">
                    {SUPPORTERS.map((supporter) => (
                        <a
                            key={supporter.name}
                            href={supporter.url}
                            aria-label={supporter.name}
                            className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-3 rounded-2xl border border-theme-border border-dashed px-5 py-4 transition-colors hover:border-theme-bg-active hover:bg-surface-opaque motion-reduce:transition-none"
                        >
                            <span
                                aria-hidden="true"
                                className="row-span-2 h-9 w-9 bg-theme-text-strong"
                                style={{
                                    maskImage: `url(${supporter.logo})`,
                                    WebkitMaskImage: `url(${supporter.logo})`,
                                    maskRepeat: "no-repeat",
                                    WebkitMaskRepeat: "no-repeat",
                                    maskPosition: "center",
                                    WebkitMaskPosition: "center",
                                    maskSize: "contain",
                                    WebkitMaskSize: "contain",
                                }}
                            />
                            <span className="font-body text-base font-semibold text-theme-text-strong">
                                {supporter.name}
                            </span>
                            <span className="text-sm leading-snug text-theme-text-muted">
                                {supporter.description}
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            <CalloutPanel
                tone="dark"
                title="Join the conversation"
                body="Builders are in there swapping prompts, debugging each other's apps, and telling us what to build next."
            >
                <ActionButton href={DISCORD_URL} tone="bright">
                    Join Discord
                </ActionButton>
                <ArrowLink href={REPO_URL} className="px-2 text-base">
                    Browse the repo
                </ArrowLink>
            </CalloutPanel>
        </>
    );
}
