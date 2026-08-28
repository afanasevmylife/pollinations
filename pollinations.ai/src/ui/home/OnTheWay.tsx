import { CardGrid, SectionHeader } from "../site/kit";

const UPCOMING = [
    {
        title: "More Quests",
        body: "More ways to earn free Pollen by building and contributing.",
    },
    {
        title: "App Discovery",
        body: "A clearer way for people to find useful community apps.",
    },
    {
        title: "Ads SDK",
        body: "Optional ad slots. Earnings go to your wallet.",
    },
];

export function OnTheWay() {
    return (
        <section className="flex flex-col gap-6">
            <SectionHeader
                eyebrow="On the way"
                title={`${UPCOMING.length} things we’re building.`}
            />
            {/* Dashed and unlifted on purpose: nothing here is clickable yet. */}
            <CardGrid min="narrow" gap="gap-4">
                {UPCOMING.map((item) => (
                    <div
                        key={item.title}
                        className="flex flex-col gap-2 rounded-2xl border border-theme-border border-dashed bg-theme-bg-pale p-5"
                    >
                        <h3 className="font-body text-lg font-semibold text-theme-text-strong">
                            {item.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-theme-text-base">
                            {item.body}
                        </p>
                    </div>
                ))}
            </CardGrid>
        </section>
    );
}
