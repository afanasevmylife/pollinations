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

/**
 * Keep the section useful when GitHub's small unauthenticated API allowance is
 * exhausted. Live data replaces this snapshot whenever the API is available.
 */
const FALLBACK_CONTRIBUTORS: Contributor[] = [
    ["voodoohop", 5640],
    ["ElliotEtag", 1640],
    ["ale-rls", 262],
    ["Itachi-1824", 189],
    ["Circuit-Overtime", 154],
    ["gokaykucuk", 140],
    ["eulervoid", 95],
    ["lauraibnz", 63],
    ["fisventurous", 37],
    ["alexreiling", 34],
    ["CloudCompile", 26],
    ["chakra-gold", 20],
].map(([login, commits]) => ({
    login: String(login),
    avatarUrl: `https://github.com/${login}.png?size=80`,
    profileUrl: `https://github.com/${login}`,
    commits: Number(commits),
}));

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
    return useAsync<Contributor[]>(
        async () => {
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
        },
        FALLBACK_CONTRIBUTORS.slice(0, limit),
    );
}

/**
 * An exact all-time repository contributor count without downloading every
 * profile. Anonymous authors matter especially in the project's older commit
 * history. With one result per page, GitHub's final pagination page is the
 * total.
 */
export function useContributorCount() {
    return useAsync<number | null>(async () => {
        const response = await fetch(
            `${GITHUB}/repos/${REPO}/contributors?per_page=1&anon=1`,
            { headers: { Accept: "application/vnd.github+json" } },
        );
        if (!response.ok)
            throw new Error(`github contributors: ${response.status}`);

        const rows = (await response.json()) as GhContributor[];
        const lastPage = response.headers
            .get("link")
            ?.match(/[?&]page=(\d+)[^>]*>;\s*rel="last"/)?.[1];

        return lastPage ? Number(lastPage) : rows.length;
    }, null);
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

type DailySummary = {
    date: string;
    title: string;
    summary: string;
    pr_count: number;
};

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const FIRST_DIARY_DAY = "2026-02-05";

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
            const today = new Date().toISOString().slice(0, 10);
            const summaries = new Map<string, Promise<DailySummary | null>>();
            const loadSummary = (date: string) => {
                const existing = summaries.get(date);
                if (existing) return existing;
                const request = fetch(`${NEWS_RAW}/${date}/summary.json`).then(
                    async (response) => {
                        // Not every calendar day has an entry. Raw GitHub
                        // content is CDN-backed and does not consume the API quota.
                        if (!response.ok) return null;
                        return (await response.json()) as DailySummary;
                    },
                );
                summaries.set(date, request);
                return request;
            };
            let newest = today;
            for (let offset = 0; offset < 7; offset += 1) {
                const candidate = addDays(today, -offset);
                if (await loadSummary(candidate)) {
                    newest = candidate;
                    break;
                }
            }
            const latest =
                requestedEnd && ISO_DAY.test(requestedEnd)
                    ? requestedEnd
                    : newest;
            const range = dateRange(latest, days);
            const dailySummaries = await Promise.all(range.map(loadSummary));

            return {
                days: range.map((date, index) => {
                    const daily = dailySummaries[index];
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
                hasEarlier: range[0] > FIRST_DIARY_DAY,
                hasLater: latest < newest,
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
