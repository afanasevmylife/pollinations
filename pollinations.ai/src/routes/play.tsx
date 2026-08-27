import {
    PolliProvider,
    useAuthActions,
    useAuthState,
} from "@pollinations/sdk/react";
import { LockIcon } from "@pollinations/ui";
import { AppUserMenu } from "@pollinations/ui/app-user-menu/sdk";
import { createFileRoute } from "@tanstack/react-router";
import { ENTER_URL, POLLI_APP_KEY } from "../config";
import { routeHead } from "../routeMeta";
import { Playground } from "../ui/play/Playground";
import { ActionButton, Hero, PageHeader } from "../ui/site/kit";

export const Route = createFileRoute("/play")({
    head: () => routeHead("/play"),
    component: PlayPage,
});

/**
 * Play controls, including the signed-in profile, use the shared UI treatment.
 */
function SignInAction() {
    const { isLoggedIn, isHydrated } = useAuthState();
    const { login } = useAuthActions();
    if (!isHydrated) {
        return (
            <ActionButton
                as="button"
                disabled
                aria-label="Loading account"
                data-theme="accent"
            >
                Checking…
            </ActionButton>
        );
    }
    return isLoggedIn ? (
        <AppUserMenu
            dashboardHref={`${ENTER_URL}/keys`}
            labels={{ topUpAccount: "Manage key" }}
            triggerVariant="action"
        />
    ) : (
        <ActionButton as="button" data-theme="accent" onClick={() => login()}>
            <LockIcon className="mr-2 h-4 w-4" />
            Connect
        </ActionButton>
    );
}

/**
 * The playground, lifted from apps/playground with its UX intact but its own
 * page chrome removed — the heading, subtitle and sheet come from the same
 * pattern as /apps and /community so it reads as one site, not an embed.
 *
 * PolliProvider mounts here rather than at the root: route code-splitting
 * keeps @pollinations/sdk inside this chunk, so every other page stays as
 * light as it was before.
 *
 * The playground's ColorModeToggle is deliberately left out. It sets `.dark`
 * on <html>, which every other page inherits, and the marketing pages aren't
 * designed for dark yet.
 */
function PlayPage() {
    return (
        <PolliProvider
            appKey={POLLI_APP_KEY}
            enterUrl={ENTER_URL}
            permissions={["profile", "usage"]}
        >
            {/* The monitor robot, showing off something it just made. */}
            <Hero scene="/heroes/play.webp">
                <PageHeader
                    eyebrow="Official models, in the browser"
                    title="Try it out."
                    subtitle={
                        <>
                            Chat with Floret, our agent that generates any type
                            of media for you, or choose a media mode for direct
                            model controls. Connect and it runs on your own
                            Pollen, through{" "}
                            <strong>
                                the same endpoints your app will call
                            </strong>
                            .
                        </>
                    }
                />
            </Hero>
            <Playground toolbarAction={<SignInAction />} />
        </PolliProvider>
    );
}
