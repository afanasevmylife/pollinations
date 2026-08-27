import {
    Button,
    ChevronIcon,
    Dropdown,
    Input,
    MultiSelect,
    TabButton,
} from "@pollinations/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
    type DirectoryApp,
    isBuzz,
    isPollen,
    platformsOf,
    useAppDirectory,
} from "../data/publicStats";
// Hand-picked, and the only editorial thing on the page — every badge in
// catalog.json is computed from traffic or recency, so none of them can say "we
// think this is good". JSON because scripts/generate-app-art.mjs reads the
// same list to decide which apps get cover art.
import SPOTLIGHT from "../data/spotlight.json";
import { routeHead } from "../routeMeta";
import { AppCard, AppHero, AppTile } from "../ui/apps/cards";
import { appCover } from "../ui/apps/cover";
import {
    ActionButton,
    CardGrid,
    Hero,
    PageHeader,
    PixelLabel,
    PixelRule,
    ScrollStrip,
    SectionHeader,
} from "../ui/site/kit";
import {
    APP_CATEGORIES,
    APP_PLATFORMS,
    type AppSort,
    CATEGORY_LABELS,
    listOf,
    PLATFORM_LABELS,
    toggle,
    validateAppSearch,
} from "./-app-search";

export const Route = createFileRoute("/apps")({
    head: () => routeHead("/apps"),
    validateSearch: validateAppSearch,
    component: AppsPage,
});

const SORT_LABELS: Record<AppSort, string> = {
    fresh: "Fresh",
    buzz: "Buzz",
    byop: "BYOP",
};

const newestFirst = (a: DirectoryApp, b: DirectoryApp) =>
    (b.approved_date || "").localeCompare(a.approved_date || "");

/** Every ranking falls back to freshness, then name for a stable final order. */
function compareApps(sort: AppSort) {
    return (a: DirectoryApp, b: DirectoryApp) => {
        if (sort === "buzz") {
            const traffic = Number(b.requests_24h) - Number(a.requests_24h);
            if (traffic) return traffic;
        }
        if (sort === "byop" && isPollen(a) !== isPollen(b)) {
            return isPollen(a) ? -1 : 1;
        }
        return newestFirst(a, b) || a.name.localeCompare(b.name);
    };
}

/** A small filled pill, for the one official card on the page. */
function OpenPill({ children }: { children: string }) {
    return (
        <span className="rounded-[10px] bg-theme-bg-active px-4.5 py-2 text-sm font-semibold text-theme-text-strong shadow-[2px_2px_0_rgba(17,5,24,0.18)]">
            {children}
        </span>
    );
}

function FilterAxis<T extends string>({
    ariaLabel,
    values,
    labels,
    selected,
    onToggle,
    size = "sm",
}: {
    ariaLabel: string;
    values: readonly T[];
    labels: Record<T, string>;
    selected: T[];
    onToggle: (value: T) => void;
    size?: "lg" | "md" | "sm";
}) {
    return (
        <fieldset
            className="m-0 flex min-w-0 w-full flex-wrap gap-2 border-0 p-0"
            aria-label={ariaLabel}
        >
            {values.map((value) => (
                <TabButton
                    key={value}
                    size={size}
                    active={selected.includes(value)}
                    onClick={() => onToggle(value)}
                    className="min-h-11"
                >
                    {labels[value]}
                </TabButton>
            ))}
        </fieldset>
    );
}

function AppsPage() {
    const search = Route.useSearch();
    const { q } = search;
    const category = listOf(APP_CATEGORIES, search.category);
    const platform = listOf(APP_PLATFORMS, search.platform);
    const sort = search.sort ?? "fresh";
    const navigate = useNavigate({ from: Route.fullPath });
    const { data: apps, loading, failed } = useAppDirectory();

    const spotlight = useMemo(
        () =>
            SPOTLIGHT.map((name) =>
                apps.find(
                    (app) => app.name.toLowerCase() === name.toLowerCase(),
                ),
            ).filter((app): app is DirectoryApp => app !== undefined),
        [apps],
    );

    /** Within an axis it's OR; across axes it's AND. An empty axis is no constraint. */
    const filtered = useMemo(() => {
        const needle = q?.toLowerCase();
        return apps
            .filter((app) => {
                if (category.length) {
                    const own = app.category?.toLowerCase();
                    if (!category.some((c) => c === own)) return false;
                }
                if (platform.length) {
                    const own = platformsOf(app);
                    if (!platform.some((p) => own.includes(p))) return false;
                }
                if (
                    needle &&
                    !`${app.name} ${app.description} ${app.github_username}`
                        .toLowerCase()
                        .includes(needle)
                ) {
                    return false;
                }
                return true;
            })
            .slice()
            .sort(compareApps(sort));
    }, [apps, category, platform, q, sort]);

    const hasFilters = Boolean(category.length || platform.length || q);
    // resetScroll: false — the filters sit halfway down, and jumping to the
    // top on every pill click made combining them unusable.
    const clear = () =>
        navigate({
            resetScroll: false,
            search: search.sort ? { sort: search.sort } : {},
        });
    const toggleCategory = (value: string) =>
        navigate({
            resetScroll: false,
            search: (prev) => ({
                ...prev,
                category: toggle(prev.category, value),
            }),
        });

    const [lead, ...strip] = spotlight;
    // A short first page keeps the one-column phone view browseable; Show more
    // still makes the whole directory reachable without a separate paginator.
    const PAGE = 18;
    const [shown, setShown] = useState(PAGE);
    const visible = filtered.slice(0, shown);

    return (
        <>
            {/* The nomnom, buried under a stack of apps. "Submit your app"
                moves below the subtitle rather than sitting top-right, so the
                right side belongs to the character — the same shape as Hello. */}
            <Hero scene="/heroes/apps.webp">
                <PageHeader
                    eyebrow={
                        loading
                            ? "Apps built on Pollinations"
                            : `${apps.length} apps built on Pollinations`
                    }
                    title="Ecosystem"
                    subtitle={
                        <>
                            What the community ships on the same API you get —{" "}
                            <strong>
                                from weekend experiments to apps with real users
                            </strong>
                            . Browse, try, ship your own.
                        </>
                    }
                />
                <div className="flex flex-wrap gap-3">
                    <ActionButton href="https://github.com/pollinations/pollinations/issues/new?template=APP-SUBMISSION.yml">
                        Submit your app
                    </ActionButton>
                </div>
            </Hero>

            {/* Hand-picked is a section like Browse is a section — it was
                the only block on the page without a title. */}
            <section className="flex flex-col gap-5">
                <SectionHeader
                    eyebrow="Spotlight"
                    title="Picked by hand."
                    subtitle="Not the busiest — the ones we'd actually send a friend to."
                />

                {/* The hero pair: what we made, then the best of what you made. */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] gap-5">
                    <AppHero
                        href="/play"
                        title="Playground"
                        badge="Official"
                        badgeTone="accent"
                        description="Official text, image, audio and video models in the browser. Connect and generate with your own Pollen — nothing to install."
                        meta="pollinations.ai/play"
                        image={appCover("Pollinations Playground")}
                        action={<OpenPill>Open →</OpenPill>}
                    />
                    {lead && (
                        <AppHero
                            href={lead.web_url || lead.github_repository_url}
                            title={lead.name}
                            badge={isBuzz(lead) ? "Buzz" : "Picked"}
                            description={lead.description}
                            meta={
                                lead.github_username
                                    ? `by ${lead.github_username}`
                                    : "community built"
                            }
                            image={appCover(lead.name, lead.screenshot_url)}
                            action={
                                <span className="text-sm font-semibold text-theme-text-soft">
                                    Open ↗
                                </span>
                            }
                        />
                    )}
                </div>

                {strip.length > 0 && (
                    <ScrollStrip ariaLabel="More hand-picked apps">
                        {strip.map((app) => (
                            <AppTile
                                key={app.name}
                                app={app}
                                imageClassName="h-30"
                                className="w-59 flex-none"
                            />
                        ))}
                    </ScrollStrip>
                )}
            </section>

            <PixelRule />

            <section className="flex flex-col gap-5">
                <SectionHeader
                    eyebrow="Browse"
                    title="Everything else."
                    subtitle="Browse by category or platform, then sort by what’s fresh, buzzing or built with BYOP."
                />

                <div className="flex flex-col gap-3">
                    <Input
                        type="search"
                        value={q ?? ""}
                        placeholder="Search by app, description or creator…"
                        aria-label="Search apps"
                        onChange={(event) =>
                            navigate({
                                resetScroll: false,
                                search: (prev) => ({
                                    ...prev,
                                    q: event.target.value.trim() || undefined,
                                }),
                            })
                        }
                        className="mb-2 min-h-11 w-full max-w-xl"
                    />
                    <FilterAxis
                        ariaLabel="Categories"
                        values={APP_CATEGORIES}
                        labels={CATEGORY_LABELS}
                        selected={category}
                        onToggle={toggleCategory}
                        size="lg"
                    />
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <MultiSelect
                            label="Platform"
                            placeholder="All platforms"
                            options={APP_PLATFORMS.map((value) => ({
                                value,
                                label: PLATFORM_LABELS[value],
                            }))}
                            selected={platform}
                            onChange={(next) =>
                                navigate({
                                    resetScroll: false,
                                    search: (prev) => ({
                                        ...prev,
                                        platform:
                                            next.length > 0
                                                ? next.join(",")
                                                : undefined,
                                    }),
                                })
                            }
                        />

                        {hasFilters && (
                            <Button size="sm" type="button" onClick={clear}>
                                Clear filters
                            </Button>
                        )}

                        <div className="ml-auto flex min-h-11 items-center gap-3">
                            {!loading && (
                                <PixelLabel variant="eyebrow">
                                    {filtered.length} of {apps.length}
                                </PixelLabel>
                            )}
                            <Dropdown
                                align="end"
                                className="polli:min-w-40 polli:p-1"
                                trigger={(open) => (
                                    <Button
                                        type="button"
                                        aria-label={`Sort apps: ${SORT_LABELS[sort]}`}
                                        className="polli:gap-2"
                                    >
                                        Sort: {SORT_LABELS[sort]}
                                        <ChevronIcon expanded={open} />
                                    </Button>
                                )}
                            >
                                {(close) => (
                                    <div className="polli:flex polli:flex-col polli:gap-1">
                                        {(
                                            Object.keys(
                                                SORT_LABELS,
                                            ) as AppSort[]
                                        ).map((value) => (
                                            <TabButton
                                                key={value}
                                                active={sort === value}
                                                size="sm"
                                                variant="ghost"
                                                className="polli:w-full polli:justify-start"
                                                onClick={() => {
                                                    navigate({
                                                        resetScroll: false,
                                                        search: (prev) => ({
                                                            ...prev,
                                                            sort:
                                                                value ===
                                                                "fresh"
                                                                    ? undefined
                                                                    : value,
                                                        }),
                                                    });
                                                    close();
                                                }}
                                            >
                                                {SORT_LABELS[value]}
                                            </TabButton>
                                        ))}
                                    </div>
                                )}
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {failed ? (
                    <p className="text-theme-text-base">
                        The app directory couldn’t be loaded right now.
                    </p>
                ) : loading ? (
                    <p className="text-theme-text-muted">Loading apps…</p>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-theme-border border-dashed p-12 text-center text-theme-text-muted">
                        No apps match that combination yet.{" "}
                        <Button size="sm" type="button" onClick={clear}>
                            Clear filters
                        </Button>
                    </div>
                ) : (
                    <>
                        <CardGrid min="gallery" gap="gap-4">
                            {visible.map((app) => (
                                <AppCard key={app.name} app={app} />
                            ))}
                        </CardGrid>
                        {filtered.length > visible.length && (
                            <div className="flex flex-col items-center gap-2">
                                <ActionButton
                                    as="button"
                                    tone="plain"
                                    onClick={() => setShown((n) => n + PAGE)}
                                >
                                    Show more
                                </ActionButton>
                                <p className="text-sm text-theme-text-muted">
                                    {visible.length} of {filtered.length}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </section>
        </>
    );
}
