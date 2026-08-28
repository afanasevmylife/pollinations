import { PolliProvider } from "@pollinations/sdk/react";
import { AppUserMenu } from "@pollinations/ui/app-user-menu/sdk";
import { createFileRoute } from "@tanstack/react-router";
import { ENTER_URL, POLLI_APP_KEY } from "../config";
import { routeHead } from "../routeMeta";
import { AnimationPromptMachine } from "../ui/animate/AnimationPromptMachine";
import { Hero, PageHeader } from "../ui/site/kit";

export const Route = createFileRoute("/animate")({
    head: () => routeHead("/animate"),
    component: AnimatePage,
});

function AnimatePage() {
    return (
        <PolliProvider
            appKey={POLLI_APP_KEY}
            enterUrl={ENTER_URL}
            permissions={["profile", "usage"]}
        >
            <Hero scene="/heroes/play.webp">
                <PageHeader
                    eyebrow="Animation prompt machine"
                    title="Direct it before you generate it."
                    subtitle={
                        <>
                            Give us one idea. Get the character locks, source
                            assets, keyframes and motion prompts needed for a
                            <strong> coherent shot-by-shot animation</strong>.
                        </>
                    }
                    action={
                        <AppUserMenu
                            dashboardHref={`${ENTER_URL}/keys`}
                            labels={{
                                topUpAccount: "Manage access",
                                logout: "Disconnect",
                            }}
                        />
                    }
                />
            </Hero>
            <AnimationPromptMachine />
        </PolliProvider>
    );
}
