import {
    BookIcon,
    BrandLockup,
    Button,
    DiscordIcon,
    Dropdown,
    DropdownItem,
    GitHubIcon,
    LogInIcon,
    MenuIcon,
    TabButton,
    XIcon,
} from "@pollinations/ui";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GUTTER, SHELL } from "./kit";
import { useHideOnScroll, useScrolled } from "./useHideOnScroll";

const NAV = [
    { to: "/play", label: "Play" },
    { to: "/apps", label: "Apps" },
    { to: "/community", label: "Community" },
] as const;

const EXTERNAL = [
    // Not docs.pollinations.ai — that is the investor data room.
    { href: "https://gen.pollinations.ai/docs", label: "Docs" },
    { href: "https://github.com/pollinations/pollinations", label: "GitHub" },
    {
        href: "https://discord.gg/pollinations-ai-885844321461485618",
        label: "Discord",
    },
] as const;

const DESKTOP_UTILITIES = [
    { ...EXTERNAL[1], Icon: GitHubIcon },
    { ...EXTERNAL[2], Icon: DiscordIcon },
] as const;

const isCurrent = (to: string, pathname: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

export function SiteHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const scrolled = useScrolled();
    const scrolledAway = useHideOnScroll();
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    });

    // Navigating is what the menu is for, so it closes itself on arrival.
    // biome-ignore lint/correctness/useExhaustiveDependencies: close on navigation
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // The header must not slide away while its own menu is open.
    const hidden = scrolledAway && !menuOpen;

    return (
        <header
            className={`sticky top-0 z-30 bg-transparent py-4 transition-transform duration-300 focus-within:translate-y-0 sm:py-5 motion-reduce:transition-none ${
                hidden ? "-translate-y-full" : "translate-y-0"
            }`}
        >
            <div
                aria-hidden="true"
                className={`site-header-dissolve pointer-events-none absolute inset-x-0 top-0 h-40 transition-opacity duration-300 motion-reduce:transition-none ${
                    scrolled && !hidden ? "opacity-100" : "opacity-0"
                }`}
            />
            <div className={`${SHELL} relative z-10`}>
                <div
                    className={`${GUTTER} flex items-center justify-between gap-4 sm:gap-6`}
                >
                    <div className="flex min-w-0 items-center gap-9">
                        <Link
                            to="/"
                            className="group relative flex items-center rounded-md text-theme-text-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-theme-border"
                            aria-label="pollinations.ai — home"
                        >
                            <span className="relative inline-flex sm:hidden">
                                {pathname === "/" && (
                                    <BrandLockup
                                        variant="mark"
                                        height={32}
                                        label=""
                                        className="absolute translate-x-[3px] translate-y-[3px] text-theme-bg-active"
                                    />
                                )}
                                <BrandLockup
                                    variant="mark"
                                    height={32}
                                    label=""
                                    className="relative z-10"
                                />
                            </span>
                            <span className="relative hidden sm:inline-flex">
                                {pathname === "/" && (
                                    <BrandLockup
                                        height={30}
                                        label=""
                                        className="absolute translate-x-[3px] translate-y-[3px] text-theme-bg-active"
                                    />
                                )}
                                <BrandLockup
                                    height={30}
                                    label=""
                                    className="relative z-10"
                                />
                            </span>
                        </Link>
                        <nav className="hidden gap-1.5 lg:flex">
                            {NAV.map((item) => (
                                <TabButton
                                    key={item.to}
                                    as={Link}
                                    to={item.to}
                                    variant="ghost"
                                    active={isCurrent(item.to, pathname)}
                                >
                                    {item.label}
                                </TabButton>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            as="a"
                            href={EXTERNAL[0].href}
                            size="sm"
                            aria-label="Docs"
                            title="Docs"
                            className="h-9 w-9 shrink-0 bg-surface-opaque p-0 text-theme-text-strong shadow-well transition-all duration-200 hover:-translate-y-0.5 hover:bg-theme-bg-hover hover:shadow-lg sm:w-auto sm:gap-1.5 sm:px-3 motion-reduce:hover:translate-y-0"
                        >
                            <BookIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Docs</span>
                        </Button>
                        {DESKTOP_UTILITIES.map((item) => {
                            const { href, label, Icon } = item;
                            return (
                                <Button
                                    key={href}
                                    as="a"
                                    href={href}
                                    size="sm"
                                    aria-label={label}
                                    title={label}
                                    className="hidden h-9 w-9 shrink-0 bg-surface-opaque p-0 text-theme-text-strong shadow-well transition-all duration-200 hover:-translate-y-0.5 hover:bg-theme-bg-hover hover:shadow-lg lg:inline-flex motion-reduce:hover:translate-y-0"
                                >
                                    <Icon className="h-4 w-4" />
                                </Button>
                            );
                        })}
                        <Button
                            as="a"
                            href="https://enter.pollinations.ai"
                            size="sm"
                            aria-label="Login"
                            title="Login"
                            className="h-9 shrink-0 gap-1.5 bg-surface-opaque px-3 text-theme-text-strong shadow-well transition-all duration-200 hover:-translate-y-0.5 hover:bg-theme-bg-hover hover:shadow-lg motion-reduce:hover:translate-y-0"
                        >
                            <LogInIcon className="h-4 w-4" />
                            Login
                        </Button>
                        <Dropdown
                            align="end"
                            open={menuOpen}
                            onOpenChange={setMenuOpen}
                            className="w-48 bg-surface-opaque p-2 shadow-well"
                            trigger={(open) => (
                                <Button
                                    aria-label={
                                        open ? "Close menu" : "Open menu"
                                    }
                                    aria-expanded={open}
                                    aria-controls="site-menu"
                                    className="h-11 w-11 min-w-11 p-0 [&>svg]:size-6 lg:hidden"
                                >
                                    {open ? <XIcon /> : <MenuIcon />}
                                </Button>
                            )}
                        >
                            {(close) => (
                                <nav
                                    id="site-menu"
                                    className="flex max-h-[calc(100dvh-6rem)] flex-col gap-1 overflow-y-auto"
                                >
                                    {NAV.map((item) => (
                                        <DropdownItem
                                            key={item.to}
                                            as={Link}
                                            to={item.to}
                                            onClick={close}
                                            className={
                                                isCurrent(item.to, pathname)
                                                    ? "bg-theme-bg-active"
                                                    : undefined
                                            }
                                        >
                                            {item.label}
                                        </DropdownItem>
                                    ))}
                                    <span className="mx-2 my-1 h-px bg-theme-border" />
                                    <DropdownItem
                                        as="a"
                                        href={EXTERNAL[1].href}
                                        onClick={close}
                                    >
                                        <GitHubIcon className="h-4 w-4 shrink-0" />
                                        {EXTERNAL[1].label}
                                    </DropdownItem>
                                    <DropdownItem
                                        as="a"
                                        href={EXTERNAL[2].href}
                                        onClick={close}
                                    >
                                        <DiscordIcon className="h-4 w-4 shrink-0" />
                                        {EXTERNAL[2].label}
                                    </DropdownItem>
                                </nav>
                            )}
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
}
