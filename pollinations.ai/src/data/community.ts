/**
 * Community signals, all anonymous and all live.
 *
 * GitHub's unauthenticated limit is 60 requests/hour *per client IP*, so each
 * visitor gets their own budget and this page's four calls never pool into a
 * shared ceiling — no token, and no proxy needed. Everything degrades to
 * `failed` and hides rather than showing a stale hardcoded number.
 */
import { type UseAsyncOptions, useAsync } from "./useAsync";

const REPO = "pollinations/pollinations";
const GITHUB = "https://api.github.com";
export const REPO_URL = `https://github.com/${REPO}`;
export const DISCORD_URL =
    "https://discord.gg/pollinations-ai-885844321461485618";
const GUILD_ID = "885844321461485618";

async function github<T>(path: string): Promise<T> {
    const response = await fetch(`${GITHUB}${path}`, {
        headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`github ${path}: ${response.status}`);
    return response.json() as Promise<T>;
}

/* ── Stars ──────────────────────────────────────────────────────────────── */

export function useRepoStars(options?: UseAsyncOptions) {
    return useAsync<number | null>(
        async () => {
            const repo = await github<{ stargazers_count: number }>(
                `/repos/${REPO}`,
            );
            return repo.stargazers_count;
        },
        null,
        options,
    );
}

/* ── Discord ────────────────────────────────────────────────────────────── */

/**
 * The widget exposes `presence_count` — members online right now — and not
 * total membership, which needs a bot token. So the page says "online now"
 * rather than repeating the old "17K+ members", which we cannot measure from
 * here and would just be a number we typed once.
 */
export function useDiscordPresence(options?: UseAsyncOptions) {
    return useAsync<number | null>(
        async () => {
            const response = await fetch(
                `https://discord.com/api/guilds/${GUILD_ID}/widget.json`,
            );
            if (!response.ok) throw new Error(`discord: ${response.status}`);
            const widget = (await response.json()) as {
                presence_count?: number;
            };
            return widget.presence_count ?? null;
        },
        null,
        options,
    );
}

/* ── Contributors ───────────────────────────────────────────────────────── */

type Contributor = {
    login: string;
    avatarUrl: string;
    profileUrl: string;
    commits: number;
};

/** Apps and CI accounts commit constantly and would otherwise take the top. */
const isBot = (login: string) =>
    login.includes("[bot]") ||
    login.endsWith("-bot") ||
    login.toLowerCase().includes("copilot");

type GhContributor = {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
    type?: string;
};

export function useContributors(limit = 12) {
    return useAsync<Contributor[]>(async () => {
        // One request, already ranked by commit count — the old page walked
        // five pages of commits to rebuild the same ordering by hand.
        const rows = await github<GhContributor[]>(
            `/repos/${REPO}/contributors?per_page=${limit + 8}`,
        );
        return rows
            .filter((row) => row.type !== "Bot" && !isBot(row.login))
            .slice(0, limit)
            .map((row) => ({
                login: row.login,
                avatarUrl: row.avatar_url,
                profileUrl: row.html_url,
                commits: row.contributions,
            }));
    }, []);
}

/* ── Open votes ─────────────────────────────────────────────────────────── */

type VotingIssue = {
    number: number;
    title: string;
    url: string;
    votes: number;
};

/**
 * Maintainers mark these by prefixing the title, so that marker is the filter
 * rather than a hardcoded list of issue numbers — the three the old page
 * pinned (5543, 5321, 4826) are exactly what this returns, but a new one shows
 * up on its own.
 */
const VOTE_MARKER = "[Voting Issue]";

type GhSearch = {
    items: {
        number: number;
        title: string;
        html_url: string;
        reactions: { "+1": number };
    }[];
};

export function useVotingIssues(limit = 3) {
    return useAsync<VotingIssue[]>(async () => {
        const query = encodeURIComponent(
            `repo:${REPO} is:issue is:open "${VOTE_MARKER}" in:title`,
        );
        const found = await github<GhSearch>(
            `/search/issues?q=${query}&sort=reactions-%2B1&order=desc&per_page=${limit}`,
        );
        return found.items.map((item) => ({
            number: item.number,
            title: item.title.replace(VOTE_MARKER, "").trim(),
            url: item.html_url,
            votes: item.reactions["+1"],
        }));
    }, []);
}

/* ── Build diary ────────────────────────────────────────────────────────── */

const NEWS_RAW =
    "https://raw.githubusercontent.com/pollinations/pollinations/news/operations/social/news/daily";
const NEWS_REPO_PATH = "operations/social/news/daily";

export type DiaryDay = {
    date: string;
    prCount: number;
    title: string | null;
    summary: string | null;
    imageUrl: string | null;
    url: string | null;
};

type DiaryRange = {
    days: DiaryDay[];
    hasEarlier: boolean;
    hasLater: boolean;
};

type GhContent = { name: string; type: "dir" | "file" };

type DailySummary = {
    date: string;
    title: string;
    summary: string;
    pr_count: number;
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function addDays(iso: string, amount: number): string {
    const date = new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + amount);
    return date.toISOString().slice(0, 10);
}

function dateRange(end: string, days: number): string[] {
    return Array.from({ length: days }, (_, index) =>
        addDays(end, index - days + 1),
    );
}

export function useBuildDiary(days = 14, requestedEnd?: string) {
    return useAsync<DiaryRange>(
        async () => {
            const folders = await github<GhContent[]>(
                `/repos/${REPO}/contents/${NEWS_REPO_PATH}?ref=news`,
            );
            const dates = folders
                .filter(
                    (item) => item.type === "dir" && ISO_DAY.test(item.name),
                )
                .map((item) => item.name)
                .sort();
            const eligible = requestedEnd
                ? dates.filter((date) => date <= requestedEnd)
                : dates;
            const latest = eligible[eligible.length - 1];
            if (!latest) {
                return { days: [], hasEarlier: false, hasLater: false };
            }

            const range = dateRange(latest, days);
            const available = new Set(dates);
            const summaries = await Promise.all(
                range.map(async (date) => {
                    if (!available.has(date)) return null;
                    const response = await fetch(
                        `${NEWS_RAW}/${date}/summary.json`,
                    );
                    if (!response.ok) {
                        throw new Error(
                            `daily summary ${date}: ${response.status}`,
                        );
                    }
                    return response.json() as Promise<DailySummary>;
                }),
            );

            return {
                days: range.map((date, index) => {
                    const daily = summaries[index];
                    if (!daily) {
                        return {
                            date,
                            prCount: 0,
                            title: null,
                            summary: null,
                            imageUrl: null,
                            url: null,
                        };
                    }

                    return {
                        date,
                        prCount: daily.pr_count,
                        title: daily.title,
                        // The canonical summary opens with its concise daily recap.
                        summary: daily.summary.split(/\n\s*\n/)[0].trim(),
                        imageUrl: `${NEWS_RAW}/${date}/images/twitter.jpg`,
                        url: `${REPO_URL}/tree/news/${NEWS_REPO_PATH}/${date}`,
                    };
                }),
                hasEarlier: dates.some((date) => date < range[0]),
                hasLater: dates.some((date) => date > range[range.length - 1]),
            };
        },
        { days: [], hasEarlier: false, hasLater: false },
        { key: `${days}:${requestedEnd ?? "latest"}` },
    );
}

/* ── Supporters ─────────────────────────────────────────────────────────── */

/**
 * Static on purpose: these are sponsorship relationships, not something an
 * API can measure. Carried over from the old site's content file.
 */
export const SUPPORTERS = [
    {
        name: "AWS Activate",
        url: "https://aws.amazon.com/",
        logo: "/supporters/aws.svg",
        description: "GPU cloud credits",
    },
    {
        name: "Google Cloud for Startups",
        url: "https://cloud.google.com/",
        logo: "/supporters/google-cloud.svg",
        description: "GPU cloud credits",
    },
    {
        name: "NVIDIA Inception",
        url: "https://www.nvidia.com/en-us/deep-learning-ai/startups/",
        logo: "/supporters/nvidia.svg",
        description: "AI startup support",
    },
    {
        name: "Azure (MS for Startups)",
        url: "https://azure.microsoft.com/",
        logo: "/supporters/azure.svg",
        description: "OpenAI credits",
    },
    {
        name: "Cloudflare",
        url: "https://developers.cloudflare.com/workers-ai/",
        logo: "/supporters/cloudflare.svg",
        description: "Put the connectivity cloud to work for you",
    },
    {
        name: "Scaleway",
        url: "https://www.scaleway.com/",
        logo: "/supporters/scaleway.svg",
        description: "Europe's empowering cloud provider",
    },
    {
        name: "Modal",
        url: "https://modal.com/",
        logo: "/supporters/modal.svg",
        description: "High-performance AI infrastructure",
    },
    {
        name: "Nebius",
        url: "https://nebius.com/",
        logo: "/supporters/nebius.svg",
        description: "AI-optimised cloud with NVIDIA GPU clusters",
    },
    {
        name: "Perplexity AI",
        url: "https://www.perplexity.ai/",
        logo: "/supporters/perplexity.svg",
        description: "AI-powered search and answer engine",
    },
    {
        name: "io.net",
        url: "https://io.net/",
        logo: "/supporters/io-net.svg",
        description: "Decentralised GPU network for AI compute",
    },
    {
        name: "BytePlus",
        url: "https://www.byteplus.com/",
        logo: "/supporters/byteplus.svg",
        description: "ByteDance cloud services and AI solutions",
    },
    {
        name: "InferencePort AI",
        url: "https://inferenceport.ai/",
        logo: "/supporters/inferenceport.svg",
        description: "Cloud and local AI infrastructure",
    },
] as const;
