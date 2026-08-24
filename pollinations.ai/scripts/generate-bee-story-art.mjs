import { execFileSync } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const workspace = join(dirname(fileURLToPath(import.meta.url)), "../..");
const currentRoot = join(
    workspace,
    "pollinations.ai/public/characters/bee-story/generated",
);
const outputRoot = join(
    workspace,
    "pollinations.ai/public/characters/bee-story/nanobanana-2",
);
const rawRoot = join(workspace, "temp/nanobanana-2/raw");
const characterReference = join(
    workspace,
    "social/prompts/brand/characters-ref.jpg",
);
const polliReference = join(workspace, "temp/nanobanana-2/polli-reference.jpg");
const removeChroma = join(
    process.env.HOME,
    ".codex/skills/.system/imagegen/scripts/remove_chroma_key.py",
);

const assets = [
    [
        "byop/byop-app.png",
        "a garden-like app portal labeled YOUR APP with a GENERATE control",
    ],
    [
        "byop/byop-maker-earns.png",
        "the friendly CRT monitor robot holding a coin above the exact banner MAKER EARNS",
    ],
    [
        "byop/byop-paid-coin.png",
        "a single purple coin with one simple four-petal flower mark",
    ],
    [
        "byop/byop-user-spends.png",
        "Nomnom holding a wallet and a purple coin above the exact banner USER SPENDS",
    ],
    [
        "catalogue/catalogue-active.png",
        "a wide model catalogue garden with the central ONE API portal brightly active",
    ],
    [
        "catalogue/catalogue-idle.png",
        "a wide model catalogue garden with the central ONE API portal calm and ready",
    ],
    [
        "hosting/hosting-idle.png",
        "a wide Pollinations hosting garden where apps, models, agents and media are visibly housed together, calm and ready",
    ],
    [
        "hosting/hosting-active.png",
        "the same wide Pollinations hosting garden actively running apps, models, agents and media together",
    ],
    [
        "login/login-idle.png",
        "a wide Pollinations authorization portal connecting a user wallet to an app, waiting for approval",
    ],
    [
        "login/login-connected.png",
        "the same wide Pollinations authorization portal with the user wallet safely connected to the app",
    ],
    [
        "community-universe.png",
        "a full-screen meadow gathering of unique friendly beings from across the universe, including exactly one Polli, one CRT monitor robot and one Nomnom",
    ],
    [
        "developer-tools/cli-active.png",
        "a large botanical terminal labeled CLI showing the exact command $ polli gen audio and the exact response AUDIO READY!, with Polli typing",
    ],
    [
        "developer-tools/cli-idle.png",
        "a large botanical terminal labeled CLI showing the exact command $ polli gen audio, with Polli typing",
    ],
    [
        "developer-tools/cli-polli.png",
        "a large botanical terminal labeled CLI showing the exact command $ polli gen audio and the exact response AUDIO READY!, with Polli typing",
    ],
    [
        "developer-tools/mcp-active.png",
        "a botanical machine labeled MCP with the exact footer TOOLS FOR YOUR AGENT, Polli and the CRT monitor robot interacting with active text, image, audio and video tool ports",
    ],
    [
        "developer-tools/mcp-idle.png",
        "a botanical machine labeled MCP with the exact footer TOOLS FOR YOUR AGENT, Polli and the CRT monitor robot ready beside quiet text, image, audio and video tool ports",
    ],
    [
        "developer-tools/mcp-polli.png",
        "a botanical machine labeled MCP with the exact footer TOOLS FOR YOUR AGENT, Polli and the CRT monitor robot operating clear text, image, audio and video tool ports",
    ],
    [
        "developer-tools/sdk-active.png",
        "a large open botanical coding book labeled SDK showing the exact package @pollinations/sdk, with Polli, Nomnom and active app-code panels",
    ],
    [
        "developer-tools/sdk-idle.png",
        "a large open botanical coding book labeled SDK showing the exact package @pollinations/sdk, with Polli, Nomnom and calm app-code panels",
    ],
    [
        "multimodal/multimodal-active.png",
        "a joyful media garden machine with large readable labels VIDEO, OCR, REALTIME and EMBEDDINGS, generating image, text and music together while Polli observes",
    ],
    [
        "multimodal/multimodal-idle.png",
        "a calm media garden machine with large readable labels VIDEO, OCR, REALTIME and EMBEDDINGS, ready to generate while Polli observes",
    ],
    [
        "publish-agent/agent-working.png",
        "a lively mechanical badge with the exact large text AGENT WORKING and a green success mark",
    ],
    [
        "publish-agent/publish-agent.png",
        "Polli and the CRT monitor robot operating a cozy agent workshop above the exact large label PUBLISH AGENT",
    ],
    [
        "publish-model/model-called.png",
        "an energetic botanical model portal with the exact large text MODEL CALLED",
    ],
    [
        "publish-model/publish-model.png",
        "Polli beside a botanical community model portal above the exact large label PUBLISH MODEL",
    ],
    [
        "publish-model/wallet-receive-paid.png",
        "an open wallet with two clearly separate pockets: gold QUEST POLLEN and purple PAID POLLEN, with the purple pocket glowing",
    ],
    [
        "quest/quest-pollen-coin.png",
        "a single gold coin with one simple four-petal flower mark",
    ],
    [
        "quest/quest-polli-complete.png",
        "Polli celebrating beneath the exact large sign QUEST COMPLETE!",
    ],
    [
        "quest/quest-wallet-idle.png",
        "an open wallet with two clearly separate pockets labeled exactly QUEST POLLEN in gold and PAID POLLEN in purple",
    ],
    [
        "quest/quest-wallet-receive.png",
        "an open wallet with two clearly separate pockets labeled exactly QUEST POLLEN in gold and PAID POLLEN in purple, with the gold pocket glowing",
    ],
    ["storyboards/00-live-api.png", "a complete full-frame LIVE DEMO scene"],
    [
        "storyboards/01-every-medium.png",
        "a complete full-frame FEATURES scene about multimodal generation",
    ],
    [
        "storyboards/02-host.png",
        "a complete full-frame FEATURES scene about hosting what you build",
    ],
    [
        "storyboards/03-build-your-way.png",
        "a complete full-frame FEATURES scene about SDK, CLI and MCP",
    ],
    [
        "storyboards/04-start-free.png",
        "a complete full-frame START FREE scene about Quests and Quest Pollen",
    ],
    [
        "storyboards/05-connect-users.png",
        "a complete full-frame START FREE scene about Pollinations login and BYOP authorization",
    ],
    [
        "storyboards/06-earn-app.png",
        "a complete full-frame EARN AS A DEVELOPER scene about BYOP app earnings",
    ],
    [
        "storyboards/07-publish-earn.png",
        "a complete full-frame EARN AS A DEVELOPER scene about publishing models and agents",
    ],
    [
        "storyboards/08-community.png",
        "a complete full-frame COMMUNITY scene about the open-source ecosystem",
    ],
];

const requestedOnly = process.argv
    .filter((arg) => arg.startsWith("--only="))
    .map((arg) => arg.slice("--only=".length));
const selectedAssets = requestedOnly.length
    ? assets.filter(([path]) => requestedOnly.includes(path))
    : assets;
const force = process.argv.includes("--force");
const iconOnlyAssets = new Set([
    "byop/byop-paid-coin.png",
    "quest/quest-pollen-coin.png",
]);
const fullFrameAssets = new Set([
    "community-universe.png",
    ...assets
        .map(([path]) => path)
        .filter((path) => path.startsWith("storyboards/")),
]);
const pairedReferences = new Map([
    [
        "developer-tools/sdk-idle.png",
        join(outputRoot, "developer-tools/sdk-active.png"),
    ],
    [
        "hosting/hosting-active.png",
        join(outputRoot, "hosting/hosting-idle.png"),
    ],
    ["login/login-connected.png", join(outputRoot, "login/login-idle.png")],
]);
const sourceOverrides = new Map([
    ["hosting/hosting-idle.png", join(outputRoot, "hosting/hosting-idle.png")],
    [
        "hosting/hosting-active.png",
        join(outputRoot, "hosting/hosting-idle.png"),
    ],
    ["login/login-idle.png", join(currentRoot, "byop/byop-app.png")],
    ["login/login-connected.png", join(outputRoot, "login/login-idle.png")],
    [
        "developer-tools/mcp-polli.png",
        join(currentRoot, "developer-tools/mcp-idle.png"),
    ],
    [
        "developer-tools/cli-polli.png",
        join(currentRoot, "developer-tools/cli-idle.png"),
    ],
    [
        "storyboards/00-live-api.png",
        join(outputRoot, "storyboards/00-live-api.png"),
    ],
    [
        "storyboards/01-every-medium.png",
        join(outputRoot, "storyboards/01-every-medium.png"),
    ],
    ["storyboards/02-host.png", join(outputRoot, "storyboards/02-host.png")],
    [
        "storyboards/03-build-your-way.png",
        join(outputRoot, "storyboards/03-build-your-way.png"),
    ],
    [
        "storyboards/04-start-free.png",
        join(outputRoot, "storyboards/04-start-free.png"),
    ],
    [
        "storyboards/05-connect-users.png",
        join(outputRoot, "storyboards/05-connect-users.png"),
    ],
    [
        "storyboards/06-earn-app.png",
        join(outputRoot, "storyboards/06-earn-app.png"),
    ],
    [
        "storyboards/07-publish-earn.png",
        join(outputRoot, "storyboards/07-publish-earn.png"),
    ],
    [
        "storyboards/08-community.png",
        join(outputRoot, "storyboards/08-community.png"),
    ],
]);
const focusedCharacterReferences = new Map([
    ["byop/byop-app.png", polliReference],
    ["quest/quest-polli-complete.png", polliReference],
]);
const extraRules = new Map([
    [
        "storyboards/00-live-api.png",
        "Create one complete cinematic meadow scene with a large botanical terminal as the central subject. A small physical chapter plaque reads exactly LIVE DEMO. The main terminal title reads exactly CALL THE API. The screen shows exactly curl gen.pollinations.ai/audio/... and THEME READY. A second large physical sign reads exactly MAKE A SOUNDTRACK. Show one official Polli typing. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/01-every-medium.png",
        "Create one complete cinematic media garden. A small physical chapter plaque reads exactly FEATURES. The main physical sign reads exactly ONE API. EVERY MEDIUM. Arrange large integrated stations labeled exactly TEXT, IMAGE, AUDIO, VIDEO, REALTIME, OCR, and EMBEDDINGS around one central generation portal. Show one official Polli carrying a newly generated image tile. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/02-host.png",
        "Create one complete cinematic hosting garden. A small physical chapter plaque reads exactly FEATURES. The main physical sign reads exactly HOST WHAT YOU BUILD. Four large integrated structures are labeled exactly APPS, MODELS, AGENTS, and MEDIA. Show one official Polli bringing a tiny app seed toward the APPS structure, one official CRT monitor robot operating AGENTS, and one official Nomnom carrying a media tile. Use exactly one of each character. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/03-build-your-way.png",
        "Create one complete cinematic developer-tool garden. A small physical chapter plaque reads exactly FEATURES. The main physical sign reads exactly BUILD YOUR WAY. Arrange three large equally important botanical machines labeled exactly SDK, CLI, and MCP. The SDK is an open code book, the CLI is a terminal, and MCP is a tool console with document, image, music-note, and film icons. Show one official Polli moving between the three machines and one official CRT monitor robot at MCP. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/04-start-free.png",
        "Create one complete cinematic Quest meadow. A small physical chapter plaque reads exactly START FREE. The main physical sign reads exactly COMPLETE A QUEST. Show one official Polli delivering a gold coin into the gold QUEST POLLEN pocket of a clearly open two-pocket wallet. The other pocket reads exactly PAID POLLEN in purple. A large reward sign reads exactly GET QUEST POLLEN. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/05-connect-users.png",
        "Create one complete cinematic authorization garden. A small physical chapter plaque reads exactly START FREE. The main physical sign reads exactly CONNECT YOUR USERS. Show an open two-pocket Pollen wallet on the left, a botanical portal labeled exactly POLLINATIONS LOGIN in the center, and a machine labeled exactly YOUR APP on the right. Three large controls read exactly BUDGET, EXPIRY, and REVOKE. A gold-and-purple Pollen path safely connects the wallet to the app. Show one official Polli bringing the connection cable and one official Nomnom beside the wallet. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/06-earn-app.png",
        "Create one complete cinematic BYOP value-flow garden. A small physical chapter plaque reads exactly EARN AS A DEVELOPER. The main physical sign reads exactly THEIR POLLEN. YOUR APP. On the left, official Nomnom holds a two-pocket Pollen wallet beneath the sign USER SPENDS. In the center, official Polli operates a botanical portal labeled exactly BYOP APP. On the right, the official CRT monitor robot receives gold and purple Pollen beneath the sign MAKER EARNS. Use exactly one of each character. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/07-publish-earn.png",
        "Create one complete cinematic publishing garden. A small physical chapter plaque reads exactly EARN AS A DEVELOPER. The main physical sign reads exactly PUBLISH AND EARN. Two equally important botanical portals read exactly MODELS and AGENTS. A clear reward sign between them reads exactly EARN PER CALL. Show one official Polli publishing a model seed and one official CRT monitor robot operating the agent portal while gold and purple Pollen travel toward one creator wallet. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "storyboards/08-community.png",
        "Create one complete joyful meadow gathering of unique non-human beings from across the universe. A small physical chapter plaque reads exactly COMMUNITY. The main physical sign reads exactly OPEN SOURCE. BUILT TOGETHER. Five smaller garden signs read exactly APPS, USERS, BUILDERS, MODELS, and AGENTS. Include exactly one official Polli, one official CRT monitor robot, and one official Nomnom among many imaginative unique beings; never repeat a species or character. These are the only words. Keep all essential content inside the central 70% safe area. No bottom caption panel, floating overlay copy, frame, border, humans, or duplicate characters.",
    ],
    [
        "developer-tools/cli-polli.png",
        "The central physical title must read exactly CLI. The terminal must show exactly $ polli gen audio and AUDIO READY! in large readable type. These are the only written words allowed. Polli must match the official reference exactly: yellow and dark-brown striped round body, blue wings, black antennae, pink rectangular cheeks and black oval eyes. Show exactly one Polli typing on the keyboard. No other bee, robot, Nomnom, human, character, nameplate, footer, or text. The complete machine must be isolated cleanly from the flat chroma background with no dark rectangular backdrop, haze, vignette, glow, or shadow outside its silhouette.",
    ],
    [
        "developer-tools/mcp-polli.png",
        "The central physical title must read exactly MCP and the large footer must read exactly TOOLS FOR YOUR AGENT. These are the only written words allowed anywhere. Remove every previous footer, character name, and provider label completely. Show four large icon-only tool ports using recognizable document, picture, music-note, and film-frame imagery. Polli and the CRT monitor robot should operate the machine together. Keep exactly one Polli and one CRT robot. Do not add Nomnom or humans. The bottom edge ends immediately after the TOOLS FOR YOUR AGENT sign; there is no extra nameplate beneath it.",
    ],
    [
        "hosting/hosting-idle.png",
        "Clean and unify this hosting garden. Preserve the central portal, four bottom sign positions, and exact words HOST WHAT YOU BUILD, APPS, MODELS, AGENTS, and MEDIA. These five labels are the only text allowed. Repair every black hole, broken roof, cutout, and malformed object with complete honeycomb, leaves, glass, wood, or machinery. Remove every character, creature, face, model orb, bee, robot, smiley screen, mascot, and character-like icon. This asset contains no living beings or faces at all; characters will be composited separately. Keep all four labels fully visible inside the frame.",
    ],
    [
        "hosting/hosting-active.png",
        "Preserve the exact composition, characters, labels, scale and four structures from Image 1. Make the garden visibly live: the APPS window glows, the MODELS portal pulses, the AGENTS screen shows a green success mark, and MEDIA releases one image tile and one music note. Keep exactly APPS, MODELS, AGENTS, MEDIA, and HOST WHAT YOU BUILD; add no other text. No humans.",
    ],
    [
        "login/login-idle.png",
        "Rebuild the scene as one cohesive physical authorization machine, not a generic app portal. The large central sign must read exactly POLLINATIONS LOGIN. On the left show an open two-pocket Pollen wallet. On the right show a botanical app portal labeled exactly YOUR APP. Between them place two large physical controls labeled exactly BUDGET and EXPIRY, plus a quiet CONNECT control. These five labels are the only words allowed. The flow must read left to right without arrows or floating overlay text. Remove every character, creature, face, bee, robot, mascot, and human; Polli and Nomnom will be composited separately.",
    ],
    [
        "login/login-connected.png",
        "Preserve the exact authorization-machine composition, labels, and scale from Image 1. Show the connection completed: the CONNECT control becomes a bright green connected light and a gold-and-purple Pollen trail reaches YOUR APP. Keep exactly POLLINATIONS LOGIN, YOUR APP, BUDGET, EXPIRY, and CONNECT; add no other text. Remove every character, creature, face, bee, robot, mascot, and human; characters will be composited separately.",
    ],
    [
        "byop/byop-app.png",
        "Add one clearly visible Polli perched on top of the app portal, gently watering the tiny code-flower. Polli must be the yellow-and-dark-brown striped bee from the focused reference, with black antennae, blue wings and pink cheeks. Remove the tiny CRT robot from the top of the portal. Do not add any robot or Nomnom. Keep YOUR APP and GENERATE unobstructed.",
    ],
    [
        "byop/byop-paid-coin.png",
        "This is an icon-only asset. Render exactly one purple coin and nothing else. Absolutely no text, letters, labels, characters, flowers outside the four-petal coin mark, plants, banners, or scenery.",
    ],
    [
        "developer-tools/sdk-idle.png",
        "The result must be the large open SDK coding-book machine from Images 1 and 2, not a character model sheet, poster, grid, numbered lineup, or reference board. Keep the exact text SDK and @pollinations/sdk. Show Polli, Nomnom and the CRT robot naturally gathered around the book.",
    ],
    [
        "publish-model/publish-model.png",
        "Polli must be the clearly visible character beside the model portal, matching the bee on Image 1 and the official model sheet. Do not replace Polli with the CRT robot or Nomnom. Keep the exact label PUBLISH MODEL.",
    ],
    [
        "quest/quest-pollen-coin.png",
        "This is an icon-only asset. Render exactly one saturated warm golden-yellow and orange coin and nothing else. The coin face, rim and four-petal mark must all read unmistakably as gold, using amber, honey-yellow and orange highlights with dark-purple outlines. Absolutely no white, cream, pale pink, lime green, mint, purple fill, text, letters, labels, characters, plants, banners, secondary coins, or scenery.",
    ],
    [
        "quest/quest-polli-complete.png",
        "The central celebrating character must be Polli—the saturated golden-yellow and dark-brown striped bee with blue wings, black antennae, pink rectangular cheeks and black oval eyes—from the focused reference. Polli's body must be yellow and brown, never lime, mint, green, cream or white. Do not render the CRT robot or Nomnom. Keep the exact sign QUEST COMPLETE!.",
    ],
]);
const storyboardCorrections = new Map([
    [
        "storyboards/01-every-medium.png",
        "This is a precise correction pass. Replace the misspelled AUDIO plaque with exactly AUDIO. Remove the CRT robot and Nomnom completely. Keep exactly one official Polli carrying the media tiles. Preserve the other exact labels and the strong symmetrical layout.",
    ],
    [
        "storyboards/04-start-free.png",
        "This is a precise correction pass. Remove the CRT robot, every generic bee, every extra Polli, and every Nomnom. Keep exactly one large official Polli delivering one gold coin into the QUEST POLLEN pocket. Preserve the two-pocket wallet and exact signs COMPLETE A QUEST, GET QUEST POLLEN, QUEST POLLEN, PAID POLLEN, and START FREE.",
    ],
    [
        "storyboards/05-connect-users.png",
        "This is a precise correction pass. Remove every generic bee and every CRT robot. Keep exactly one large official Polli bringing the connection cable and exactly one official Nomnom beside the wallet. Correct the wallet pockets to exactly QUEST POLLEN and PAID POLLEN. Correct the three controls to exactly BUDGET, EXPIRY, and REVOKE. Preserve exactly POLLINATIONS LOGIN, YOUR APP, CONNECT YOUR USERS, and START FREE.",
    ],
    [
        "storyboards/08-community.png",
        "This is a precise correction pass. Replace the bee near the upper-left with exactly one official Polli, replace the large tan blob near the center with exactly one official Nomnom, and keep exactly one official CRT robot. Remove duplicate USERS and AGENTS signs. Keep one sign each for APPS, USERS, BUILDERS, MODELS, and AGENTS, one chapter plaque COMMUNITY, and the main sign OPEN SOURCE. BUILT TOGETHER. Preserve the joyful diverse non-human gathering.",
    ],
]);
const focusedRepairs = new Map([
    [
        "storyboards/01-every-medium.png",
        "Edit Image 1 only. Change the misspelled left AUDIO plaque to read exactly AUDIO. Preserve every other pixel-art object, word, color, and position. Do not add any character or any other text.",
    ],
    [
        "storyboards/05-connect-users.png",
        "Edit Image 1 only. Change the misspelled middle control XPIRY to read exactly TIME. Preserve every other pixel-art object, word, color, and position. Do not add any character or any other text.",
    ],
    [
        "storyboards/08-community.png",
        "Edit Image 1 only. Add one large beautiful wooden sign in the open center of the meadow reading exactly OPEN SOURCE. BUILT TOGETHER. Preserve every existing being, object, small sign, color, and position. Do not add any bee, brown round creature, CRT robot, human, or any other words.",
    ],
]);

const apiKey = process.env.POLLINATIONS_API_KEY;
if (!apiKey) throw new Error("POLLINATIONS_API_KEY is required");

const characterBytes = await readFile(characterReference);

function outputSize(path) {
    if (
        path.startsWith("storyboards/") ||
        path.startsWith("catalogue/") ||
        path.startsWith("hosting/") ||
        path.startsWith("login/") ||
        path.startsWith("multimodal/") ||
        path === "community-universe.png" ||
        path.includes("wallet")
    ) {
        return "1536x1024";
    }
    if (path === "quest/quest-polli-complete.png") return "1024x1536";
    return "1024x1024";
}

function promptFor(path, scene, hasPairReference, hasCharacterReference) {
    const focusedRepair = focusedRepairs.get(path);
    if (focusedRepair) return focusedRepair;

    const transparent = !fullFrameAssets.has(path);
    const isStoryboard = path.startsWith("storyboards/");
    const isNewStoryScene =
        path.startsWith("hosting/") ||
        path.startsWith("login/") ||
        path === "developer-tools/mcp-polli.png";
    return [
        `Re-render Image 1 as ${scene}.`,
        isStoryboard
            ? "Image 1 is the complete storyboard edit target. Preserve its landscape composition, scale, pixel-art style, and environment. Correct every misspelled or unrequested word and replace every off-model or duplicate character. Render only the exact words and exact character cast required below."
            : isNewStoryScene
              ? "Image 1 is visual and compositional inspiration only. Rebuild the scene for the new concept. Remove every word, number, sign and label from Image 1; render only the exact words explicitly required below."
              : "Image 1 is the edit target and composition reference. Preserve its main silhouette, framing, action, hierarchy, and every visible word exactly. Render no additional words, letters, numbers, logos, labels, captions, borders, or UI.",
        hasPairReference
            ? "Image 2 is the matching active-state artwork. Use it to keep the machinery, book, characters, scale, and visual identity consistent while preserving the quieter state from Image 1."
            : "",
        hasCharacterReference
            ? `Image ${hasPairReference ? "3" : "2"} is the official Pollinations character model sheet. Whenever Polli, the CRT monitor robot, or Nomnom appears, match the corresponding character identity, proportions, face, and colors from that model sheet.`
            : "",
        "Use the official Pollinations social art direction: cozy chunky 8-bit pixel art, clean large readable pixels, emotionally warm, serene warm-hug energy, subtle CRT glow and scanlines where relevant, soft lighting and gentle pastel gradients inside the artwork. Use lime green #ecf874 prominently where compatible, supported by warm cream, mint, lavender and peach, with dark purple #110518 outlines and high-contrast text. Preserve gold for Quest Pollen and purple for Paid Pollen.",
        "Weave text naturally into physical pixel signboards, book covers, terminal screens, banners, pockets, or machinery—never floating text imposed over the art. Keep all text large, centered, correctly spelled, and readable.",
        "Include small flowers, leaves, vines, seeds, honeycomb, code-plants, or other nature-and-growth details where they support the existing composition. Keep the image nostalgic, beautiful, technically playful, and consistent with Stardew Valley or A Short Hike only as general cozy pixel-art references.",
        "Avoid cyberpunk, harsh neon, hot pink, electric blue, realistic rendering, 3D materials, corporate vectors, sterile grids, tiny text, extra text, watermarks, duplicate characters, and unrelated props.",
        extraRules.get(path) || "",
        storyboardCorrections.get(path) || "",
        isStoryboard
            ? "FINAL CAST RULE: this is the clean environment layer. Do not render Polli, any bee, Nomnom, the CRT robot, a human, or any character-like mascot anywhere in this base image, even when an earlier scene instruction describes their eventual action. Preserve clear open space around the important machines so exact official character sprites can be composited later. On the COMMUNITY screen only, keep its diverse invented non-human beings but remove every bee, brown round Nomnom-like being, and CRT monitor robot."
            : "",
        transparent
            ? "Place the complete isolated artwork on a perfectly flat solid #00ffff chroma-key background for removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Keep crisp edges and generous padding. Do not use #00ffff inside the artwork."
            : "Fill the entire wide frame with the meadow environment; no transparency, border, frame, watermark, or empty margin.",
    ].join(" ");
}

async function generateAsset(path, scene) {
    const inputPath = sourceOverrides.get(path) || join(currentRoot, path);
    const rawPath = join(rawRoot, path);
    const outputPath = join(outputRoot, path);
    if (!force) {
        try {
            await access(outputPath);
            console.log(`skipped ${path}`);
            return;
        } catch {
            // Generate missing assets.
        }
    }
    await mkdir(dirname(rawPath), { recursive: true });
    await mkdir(dirname(outputPath), { recursive: true });

    const form = new FormData();
    const sourceBytes = await readFile(inputPath);
    form.append(
        "image",
        new Blob([sourceBytes], { type: "image/png" }),
        basename(inputPath),
    );
    const pairReference = pairedReferences.get(path);
    if (pairReference) {
        form.append(
            "image",
            new Blob([await readFile(pairReference)], { type: "image/png" }),
            basename(pairReference),
        );
    }
    const hasCharacterReference = !iconOnlyAssets.has(path);
    if (hasCharacterReference) {
        const focusedReference = focusedCharacterReferences.get(path);
        form.append(
            "image",
            new Blob(
                [
                    focusedReference
                        ? await readFile(focusedReference)
                        : characterBytes,
                ],
                { type: "image/jpeg" },
            ),
            focusedReference
                ? basename(focusedReference)
                : "characters-ref.jpg",
        );
    }
    form.append(
        "prompt",
        promptFor(path, scene, Boolean(pairReference), hasCharacterReference),
    );
    form.append("model", "nanobanana-2");
    form.append("size", outputSize(path));
    form.append("quality", "high");

    let response;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        response = await fetch("https://gen.pollinations.ai/v1/images/edits", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}` },
            body: form,
        });
        if (response.status !== 503 || attempt === 3) break;
        await new Promise((resolve) => setTimeout(resolve, attempt * 2_000));
    }
    if (!response.ok) {
        throw new Error(
            `${path}: generation failed (${response.status}) ${(
                await response.text()
            ).slice(0, 500)}`,
        );
    }

    const payload = await response.json();
    const encoded = payload.data?.[0]?.b64_json;
    if (!encoded) throw new Error(`${path}: response contained no image`);
    await writeFile(rawPath, Buffer.from(encoded, "base64"));

    if (fullFrameAssets.has(path)) {
        await writeFile(outputPath, Buffer.from(encoded, "base64"));
    } else {
        execFileSync(
            "python3",
            [
                removeChroma,
                "--input",
                rawPath,
                "--out",
                outputPath,
                "--auto-key",
                "border",
                "--soft-matte",
                "--transparent-threshold",
                "12",
                "--opaque-threshold",
                "220",
                "--despill",
                "--force",
            ],
            { stdio: "pipe" },
        );
    }

    console.log(`generated ${path}`);
}

for (const [path, scene] of selectedAssets) {
    await generateAsset(path, scene);
}

console.log(`complete ${selectedAssets.length} asset(s)`);
