import {
    type AudioFormat,
    type ChatRoutingCapability,
    type MessageContentPart,
    Pollinations,
    PollinationsError,
} from "@pollinations/sdk";
import {
    useAuthActions,
    useAuthState,
    useModelCatalog,
} from "@pollinations/sdk/react";
import {
    Alert,
    Button,
    ChatIcon,
    ChevronIcon,
    Chip,
    cn,
    Dropdown,
    DropdownItem,
    FileUpload,
    ImageIcon,
    PlusIcon,
    RocketIcon,
    ScrollArea,
    Surface,
    Text,
    Textarea,
} from "@pollinations/ui";
import { Markdown } from "@pollinations/ui/markdown";
import {
    type ClipboardEvent,
    type FormEvent,
    type KeyboardEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ActionButton } from "../site/kit";
import {
    AUTO_ROUTING,
    arrayBufferToBase64,
    audioFormat,
    buildUserContent,
    type ChatAttachmentKind,
    type ChatMessageState,
    compactRouting,
    conversationForRequest,
    extractStreamedMedia,
    fileKind,
    type RenderedMedia,
    type RoutingChoice,
    type RoutingSelection,
    routingChoices,
} from "./chat-models";

// @pollinations/ui does not export this website-local ordering.
const CHAT_ROUTING_FIELDS = [
    "text",
    "web_search",
    "image_generation",
    "image_editing",
    "video",
    "audio",
] as const satisfies readonly ChatRoutingCapability[];

const ROUTING_LABELS: Record<ChatRoutingCapability, string> = {
    text: "Text",
    web_search: "Web search",
    image_generation: "Image generation",
    image_editing: "Image editing",
    video: "Video",
    audio: "Audio",
};

const FLORET_MODEL_ID = "floret";
const MAX_ATTACHMENTS = 6;
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
const ATTACHMENT_ACCEPT =
    "image/*,video/*,audio/*,.pdf,.txt,.md,.csv,.json,.doc,.docx";
const ATTACHMENT_FILE_EXTENSION = /\.(pdf|txt|md|csv|json|doc|docx)$/i;

type ViteImportMeta = ImportMeta & {
    env?: { VITE_POLLINATIONS_API_BASE_URL?: string };
};

const API_BASE_URL = (
    (import.meta as ViteImportMeta).env?.VITE_POLLINATIONS_API_BASE_URL ||
    "https://gen.pollinations.ai"
).replace(/\/$/, "");

interface PreparedAttachment {
    id: string;
    name: string;
    mimeType: string;
    kind: ChatAttachmentKind;
    url: string;
    contentPart: MessageContentPart;
}

interface ConversationMessage extends ChatMessageState {
    attachments: PreparedAttachment[];
}

const WELCOME_MESSAGE: ConversationMessage = {
    id: "floret-welcome",
    role: "assistant",
    content:
        "Hi — what would you like to create? I can help with text, images, video, audio, and search.",
    status: "complete",
    attachments: [],
};

function acceptsAttachment(file: File): boolean {
    return (
        /^(image|video|audio)\//.test(file.type) ||
        ATTACHMENT_FILE_EXTENSION.test(file.name)
    );
}

function errorMessage(error: unknown): string {
    if (error instanceof PollinationsError) return error.message;
    if (error instanceof Error) return error.message;
    return "Something went wrong. Please try again.";
}

function isCancellation(error: unknown): boolean {
    return (
        (error instanceof PollinationsError && error.code === "CANCELLED") ||
        (error instanceof DOMException && error.name === "AbortError")
    );
}

async function prepareAttachment(
    client: Pollinations,
    file: File,
    signal: AbortSignal,
): Promise<PreparedAttachment> {
    const kind = fileKind(file);
    const format = kind === "audio" ? audioFormat(file) : null;
    if (kind === "audio" && !format) {
        throw new Error(`${file.name} uses an unsupported audio format.`);
    }

    const [upload, audioBuffer] = await Promise.all([
        client.upload(file, {
            name: file.name,
            contentType: file.type || undefined,
            signal,
        }),
        kind === "audio" ? file.arrayBuffer() : Promise.resolve(null),
    ]);
    const mimeType = upload.contentType || file.type;
    return {
        id: upload.id,
        name: file.name,
        mimeType,
        kind,
        url: upload.url,
        contentPart: attachmentPart(
            kind,
            upload.url,
            file,
            mimeType,
            format,
            audioBuffer,
        ),
    };
}

function attachmentPart(
    kind: ChatAttachmentKind,
    url: string,
    file: File,
    mimeType: string,
    format: AudioFormat | null,
    audioBuffer: ArrayBuffer | null,
): MessageContentPart {
    if (kind === "image") {
        return { type: "image_url", image_url: { url, mime_type: mimeType } };
    }
    if (kind === "video") {
        return { type: "video_url", video_url: { url, mime_type: mimeType } };
    }
    if (kind === "audio" && format && audioBuffer) {
        return {
            type: "input_audio",
            input_audio: { data: arrayBufferToBase64(audioBuffer), format },
        };
    }
    return {
        type: "file",
        file: { file_url: url, file_name: file.name, mime_type: mimeType },
    };
}

function textContent(message: ConversationMessage): string {
    if (typeof message.content === "string") return message.content;
    return message.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n");
}

function AttachmentView({ attachment }: { attachment: PreparedAttachment }) {
    if (attachment.kind === "image") {
        return (
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                <img
                    src={attachment.url}
                    alt={attachment.name}
                    loading="lazy"
                    className="play-chat-media max-h-52 rounded-lg"
                />
            </a>
        );
    }
    if (attachment.kind === "video") {
        return (
            <>
                {/* biome-ignore lint/a11y/useMediaCaption: User-provided media has no caption track. */}
                <video
                    src={attachment.url}
                    controls
                    preload="metadata"
                    className="play-chat-media max-h-52 rounded-lg"
                />
            </>
        );
    }
    if (attachment.kind === "audio") {
        return (
            <>
                {/* biome-ignore lint/a11y/useMediaCaption: User-provided media has no caption track. */}
                <audio
                    src={attachment.url}
                    controls
                    preload="metadata"
                    className="max-w-full"
                />
            </>
        );
    }
    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm font-semibold underline"
        >
            {attachment.name}
        </a>
    );
}

function MediaView({ media }: { media: RenderedMedia }) {
    if (media.kind === "image") {
        return (
            <img
                src={media.url}
                alt={media.label || "Generated image"}
                loading="lazy"
                className="play-chat-media rounded-xl bg-theme-bg-pale"
            />
        );
    }
    if (media.kind === "video") {
        return (
            <>
                {/* biome-ignore lint/a11y/useMediaCaption: Generated media does not include a caption track. */}
                <video
                    src={media.url}
                    controls
                    preload="metadata"
                    className="play-chat-media rounded-xl bg-theme-bg-pale"
                />
            </>
        );
    }
    return (
        <>
            {/* biome-ignore lint/a11y/useMediaCaption: Generated media does not include a caption track. */}
            <audio
                src={media.url}
                controls
                preload="metadata"
                className="w-full max-w-xl"
            />
        </>
    );
}

function MessageCard({
    message,
    canRetry,
    onRetry,
}: {
    message: ConversationMessage;
    canRetry: boolean;
    onRetry: () => void;
}) {
    const rawText = textContent(message);
    const rendered =
        message.role === "assistant"
            ? extractStreamedMedia(rawText)
            : { markdown: rawText, media: [] };
    const isUser = message.role === "user";

    return (
        <article
            className={cn(
                "play-chat-message flex min-w-0 flex-col gap-3 rounded-xl px-4 py-3",
                isUser
                    ? "ml-auto bg-theme-bg-active text-theme-text-strong"
                    : "mr-auto bg-surface-opaque text-theme-text-base shadow-well",
            )}
            aria-busy={message.status === "streaming"}
        >
            <Text
                as="div"
                size="xs"
                tone="muted"
                weight="bold"
                className="uppercase tracking-wide"
            >
                {isUser ? "You" : "Floret"}
            </Text>
            {isUser
                ? rendered.markdown && (
                      <p className="whitespace-pre-wrap break-words">
                          {rendered.markdown}
                      </p>
                  )
                : rendered.markdown && <Markdown>{rendered.markdown}</Markdown>}
            {message.attachments.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {message.attachments.map((attachment) => (
                        <AttachmentView
                            key={attachment.id}
                            attachment={attachment}
                        />
                    ))}
                </div>
            )}
            {rendered.media.length > 0 && (
                <div className="flex flex-col gap-3">
                    {rendered.media.map((media) => (
                        <div
                            key={`${media.kind}:${media.url}`}
                            className="flex flex-col gap-2"
                        >
                            <MediaView media={media} />
                            <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-all text-xs font-semibold underline"
                            >
                                Open {media.kind}
                            </a>
                        </div>
                    ))}
                </div>
            )}
            {message.status === "streaming" && !rawText && (
                <Text size="sm" tone="muted">
                    Floret is thinking…
                </Text>
            )}
            {message.status === "cancelled" && (
                <Text size="xs" tone="muted">
                    Stopped
                </Text>
            )}
            {message.status === "error" && (
                <Alert intent="danger" title="Response interrupted">
                    {message.error || "Floret could not finish this response."}
                </Alert>
            )}
            {canRetry && (
                <Button
                    type="button"
                    size="sm"
                    onClick={onRetry}
                    className="self-start"
                >
                    Retry
                </Button>
            )}
        </article>
    );
}

function RoutingSelector({
    field,
    value,
    choices,
    disabled,
    onChange,
}: {
    field: ChatRoutingCapability;
    value: string | null;
    choices: RoutingChoice[];
    disabled: boolean;
    onChange: (model: string | null) => void;
}) {
    const selected = choices.find((choice) => choice.id === value);
    return (
        <div className="flex min-w-0 flex-col gap-1.5">
            <Text size="xs" tone="muted" weight="bold">
                {ROUTING_LABELS[field]}
            </Text>
            <Dropdown
                className="w-max max-w-[calc(100vw-2rem)] p-2"
                trigger={(open) => (
                    <Button
                        type="button"
                        disabled={disabled}
                        className="w-full justify-between gap-2"
                        aria-label={`${ROUTING_LABELS[field]} routing: ${selected?.title ?? "Auto"}`}
                    >
                        <span className="truncate">
                            {selected?.title ?? "Auto — Floret chooses"}
                        </span>
                        <ChevronIcon
                            className={cn(
                                "h-4 w-4 shrink-0",
                                open && "rotate-180",
                            )}
                        />
                    </Button>
                )}
            >
                {(close) => (
                    <ScrollArea className="max-h-72">
                        <DropdownItem
                            onClick={() => {
                                onChange(null);
                                close();
                            }}
                        >
                            <span className="flex flex-col">
                                <strong>Auto</strong>
                                <small>Floret chooses</small>
                            </span>
                        </DropdownItem>
                        {choices.map((choice) => (
                            <DropdownItem
                                key={choice.id}
                                onClick={() => {
                                    onChange(choice.id);
                                    close();
                                }}
                            >
                                <span className="flex min-w-0 flex-col">
                                    <strong className="truncate">
                                        {choice.title}
                                    </strong>
                                    <small className="truncate">
                                        {choice.id}
                                    </small>
                                </span>
                            </DropdownItem>
                        ))}
                        {choices.length === 0 && (
                            <Text
                                as="div"
                                size="sm"
                                tone="muted"
                                className="px-3 py-2"
                            >
                                No compatible models available.
                            </Text>
                        )}
                    </ScrollArea>
                )}
            </Dropdown>
        </div>
    );
}

function RoutingPanel({
    selection,
    choices,
    disabled,
    onChange,
}: {
    selection: RoutingSelection;
    choices: Record<ChatRoutingCapability, RoutingChoice[]>;
    disabled: boolean;
    onChange: (field: ChatRoutingCapability, model: string | null) => void;
}) {
    return (
        <div
            id="play-chat-routing"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
            {CHAT_ROUTING_FIELDS.map((field) => (
                <RoutingSelector
                    key={field}
                    field={field}
                    value={selection[field]}
                    choices={choices[field]}
                    disabled={disabled}
                    onChange={(model) => onChange(field, model)}
                />
            ))}
        </div>
    );
}

function activeRoutingLabel(
    field: ChatRoutingCapability,
    id: string,
    choices: RoutingChoice[],
): string {
    return `${ROUTING_LABELS[field]}: ${choices.find((choice) => choice.id === id)?.title ?? id}`;
}

export function Chat() {
    const { apiKey, isLoggedIn, isHydrated } = useAuthState();
    const { login } = useAuthActions();
    const catalog = useModelCatalog({
        baseUrl: API_BASE_URL,
        enabled: isHydrated,
    });
    const [messages, setMessages] = useState<ConversationMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [routing, setRouting] = useState<RoutingSelection>(AUTO_ROUTING);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState("Ready");
    const abortRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef<string | null>(null);
    const transcriptRef = useRef<HTMLDivElement | null>(null);
    const followOutputRef = useRef(true);
    const composerRef = useRef<HTMLTextAreaElement | null>(null);

    const client = useMemo(
        () =>
            apiKey ? new Pollinations({ apiKey, baseUrl: API_BASE_URL }) : null,
        [apiKey],
    );
    const modelChoices = useMemo(
        () =>
            Object.fromEntries(
                CHAT_ROUTING_FIELDS.map((field) => [
                    field,
                    routingChoices(
                        catalog.models,
                        catalog.allowedModelIds,
                        field,
                    ),
                ]),
            ) as Record<ChatRoutingCapability, RoutingChoice[]>,
        [catalog.models, catalog.allowedModelIds],
    );

    useEffect(() => () => abortRef.current?.abort(), []);
    useEffect(() => {
        setRouting((current) => {
            const next = { ...current };
            for (const field of CHAT_ROUTING_FIELDS) {
                if (
                    next[field] &&
                    !modelChoices[field].some(
                        (choice) => choice.id === next[field],
                    )
                )
                    next[field] = null;
            }
            return next;
        });
    }, [modelChoices]);
    useEffect(() => {
        if (messages.length === 0) return;
        const transcript = transcriptRef.current;
        if (transcript && followOutputRef.current)
            transcript.scrollTop = transcript.scrollHeight;
    }, [messages]);
    useEffect(() => {
        if (!isLoggedIn) abortRef.current?.abort();
    }, [isLoggedIn]);

    async function streamAssistant(
        history: ConversationMessage[],
        assistantId: string,
        controller: AbortController,
    ) {
        if (!client) return;
        let accumulated = "";
        try {
            for await (const chunk of client.chatStream(
                conversationForRequest(history),
                {
                    model: FLORET_MODEL_ID,
                    routing: compactRouting(routing),
                    signal: controller.signal,
                },
            )) {
                const delta = chunk.choices[0]?.delta?.content;
                if (!delta || requestIdRef.current !== assistantId) continue;
                accumulated += delta;
                setMessages((current) =>
                    current.map((message) =>
                        message.id === assistantId
                            ? { ...message, content: accumulated }
                            : message,
                    ),
                );
            }
            const floretError = accumulated
                .trim()
                .match(/^\[error:\s*(.+)]$/s)?.[1];
            setMessages((current) =>
                current.map((message) =>
                    message.id === assistantId
                        ? {
                              ...message,
                              status: floretError ? "error" : "complete",
                              error: floretError,
                          }
                        : message,
                ),
            );
            setStatus(floretError ? "Response failed" : "Response complete");
        } catch (caught) {
            const cancelled = isCancellation(caught);
            setMessages((current) =>
                current.flatMap((message) => {
                    if (message.id !== assistantId) return [message];
                    if (cancelled && !textContent(message)) return [];
                    return [
                        {
                            ...message,
                            status: cancelled ? "cancelled" : "error",
                            error: cancelled ? undefined : errorMessage(caught),
                        },
                    ];
                }),
            );
            if (!cancelled) setStatus("Response failed");
            else setStatus("Stopped");
        }
    }

    async function runHistory(
        history: ConversationMessage[],
        assistantId: string,
    ) {
        const controller = new AbortController();
        abortRef.current = controller;
        requestIdRef.current = assistantId;
        setSending(true);
        setStatus("Floret is responding");
        await streamAssistant(history, assistantId, controller);
        if (requestIdRef.current === assistantId) {
            abortRef.current = null;
            requestIdRef.current = null;
            setSending(false);
            composerRef.current?.focus();
        }
    }

    async function send() {
        if (sending || !isHydrated) return;
        if (!isLoggedIn || !client) {
            login();
            return;
        }
        if (!draft.trim() && files.length === 0) return;
        const controller = new AbortController();
        abortRef.current = controller;
        setSending(true);
        setError(null);
        setStatus(files.length ? "Uploading attachments" : "Preparing message");
        try {
            const attachments = await Promise.all(
                files.map((file) =>
                    prepareAttachment(client, file, controller.signal),
                ),
            );
            const userMessage: ConversationMessage = {
                id: crypto.randomUUID(),
                role: "user",
                content: buildUserContent(
                    draft,
                    attachments.map((attachment) => attachment.contentPart),
                ),
                status: "complete",
                attachments,
            };
            const assistant: ConversationMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "",
                status: "streaming",
                attachments: [],
            };
            const history = [...messages, userMessage];
            setMessages([...history, assistant]);
            setDraft("");
            setFiles([]);
            followOutputRef.current = true;
            await runHistory(history, assistant.id);
        } catch (caught) {
            if (!isCancellation(caught)) setError(errorMessage(caught));
            setSending(false);
            abortRef.current = null;
            requestIdRef.current = null;
            setStatus(isCancellation(caught) ? "Stopped" : "Upload failed");
        }
    }

    async function retry(assistantId: string) {
        if (sending) return;
        const assistantIndex = messages.findIndex(
            (message) => message.id === assistantId,
        );
        if (assistantIndex < 1) return;
        const history = messages.slice(0, assistantIndex);
        const replacement: ConversationMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "",
            status: "streaming",
            attachments: [],
        };
        setMessages([...history, replacement]);
        followOutputRef.current = true;
        await runHistory(history, replacement.id);
    }

    const canAttach = isHydrated && isLoggedIn && !sending;

    function handleFiles(nextFiles: File[]) {
        const accepted: File[] = [];
        const problems: string[] = [];

        if (nextFiles.length > MAX_ATTACHMENTS) {
            problems.push(`You can attach up to ${MAX_ATTACHMENTS} files.`);
        }
        for (const file of nextFiles.slice(0, MAX_ATTACHMENTS)) {
            if (file.size > MAX_ATTACHMENT_BYTES) {
                problems.push(`${file.name} is larger than 20 MB.`);
            } else if (!acceptsAttachment(file)) {
                problems.push(`${file.name} is not a supported file type.`);
            } else if (fileKind(file) === "audio" && !audioFormat(file)) {
                problems.push(`${file.name} uses an unsupported audio format.`);
            } else {
                accepted.push(file);
            }
        }

        setFiles(accepted);
        setError(problems.length > 0 ? problems.join(" ") : null);
    }

    function addFiles(nextFiles: File[]) {
        if (!canAttach || nextFiles.length === 0) return;
        handleFiles([...files, ...nextFiles]);
    }

    function onComposerPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
        const pastedFiles = Array.from(event.clipboardData.files);
        if (!canAttach || pastedFiles.length === 0) return;
        event.preventDefault();
        addFiles(pastedFiles);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        void send();
    }
    function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            void send();
        }
    }

    const activeOverrides = CHAT_ROUTING_FIELDS.filter(
        (field) => routing[field],
    );
    const canRetryLast = (id: string) =>
        messages[messages.length - 1]?.id === id && !sending;

    return (
        <section
            className="flex w-full flex-col gap-4"
            aria-label="Floret chat"
        >
            <Surface
                variant="panel"
                className="play-chat-shell flex flex-col overflow-hidden p-0"
            >
                <div
                    className={cn(
                        "flex min-h-0 flex-col",
                        messages.length > 0 && "play-chat-window-active",
                    )}
                >
                    <ScrollArea
                        ref={transcriptRef}
                        className="play-chat-transcript min-h-0 flex-1 px-3 py-4 sm:px-5"
                        aria-label="Conversation"
                        aria-live="polite"
                        aria-busy={sending}
                        onScroll={(event) => {
                            const target = event.currentTarget;
                            followOutputRef.current =
                                target.scrollHeight -
                                    target.scrollTop -
                                    target.clientHeight <
                                96;
                        }}
                    >
                        <div className="flex flex-col gap-4">
                            <MessageCard
                                message={WELCOME_MESSAGE}
                                canRetry={false}
                                onRetry={() => undefined}
                            />
                            {messages.map((message) => (
                                <MessageCard
                                    key={message.id}
                                    message={message}
                                    canRetry={
                                        canRetryLast(message.id) &&
                                        (message.status === "error" ||
                                            message.status === "cancelled")
                                    }
                                    onRetry={() => void retry(message.id)}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                    <form
                        onSubmit={submit}
                        className="play-chat-composer relative flex flex-col gap-3 border-t border-theme-border bg-surface-opaque p-3 sm:p-4"
                    >
                        {catalog.error && (
                            <Alert
                                intent="warning"
                                title="Model settings unavailable"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span>Auto routing still works.</span>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => void catalog.refresh()}
                                    >
                                        Retry catalog
                                    </Button>
                                </div>
                            </Alert>
                        )}
                        {error && (
                            <Alert intent="danger" title="Could not send">
                                {error}
                            </Alert>
                        )}

                        {activeOverrides.length > 0 && (
                            <fieldset
                                className="flex flex-wrap gap-2"
                                aria-label="Active routing overrides"
                            >
                                {activeOverrides.map((field) => {
                                    const id = routing[field];
                                    if (!id) return null;
                                    return (
                                        <Chip key={field}>
                                            {activeRoutingLabel(
                                                field,
                                                id,
                                                modelChoices[field],
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setRouting((current) => ({
                                                        ...current,
                                                        [field]: null,
                                                    }))
                                                }
                                                aria-label={`Reset ${ROUTING_LABELS[field]} routing to Auto`}
                                                className="ml-1 font-bold"
                                            >
                                                ×
                                            </button>
                                        </Chip>
                                    );
                                })}
                            </fieldset>
                        )}

                        <Textarea
                            aria-label="Message"
                            ref={composerRef}
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={onComposerKeyDown}
                            onPaste={onComposerPaste}
                            disabled={!isHydrated || sending}
                            placeholder="Message Floret…"
                            rows={3}
                        />
                        <FileUpload
                            value={files}
                            onChange={handleFiles}
                            onReject={(rejected) => {
                                const problems = new Set(
                                    rejected.map(({ file, reason }) => {
                                        if (reason === "count")
                                            return `You can attach up to ${MAX_ATTACHMENTS} files.`;
                                        if (reason === "size")
                                            return `${file.name} is larger than 20 MB.`;
                                        return `${file.name} is not a supported file type.`;
                                    }),
                                );
                                setError([...problems].join(" "));
                            }}
                            maxFiles={MAX_ATTACHMENTS}
                            maxSizeBytes={MAX_ATTACHMENT_BYTES}
                            accept={ATTACHMENT_ACCEPT}
                            variant="compact"
                            disabled={!canAttach}
                            icon={<PlusIcon className="h-5 w-5" />}
                            label={
                                <>
                                    Drop media or files here, or{" "}
                                    <span className="underline">browse</span>
                                </>
                            }
                            previewIcon={<ImageIcon className="h-5 w-5" />}
                        />
                        <div className="flex flex-wrap items-end gap-2">
                            <button
                                type="button"
                                aria-expanded={advancedOpen}
                                aria-controls="play-chat-routing"
                                onClick={() => setAdvancedOpen((open) => !open)}
                                className="ml-2 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-1 text-sm font-semibold text-theme-text-base hover:text-theme-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-border"
                            >
                                Model routing
                                <ChevronIcon
                                    className={cn(
                                        "h-4 w-4",
                                        advancedOpen && "rotate-180",
                                    )}
                                />
                            </button>
                            {messages.length > 0 && (
                                <ActionButton
                                    as="button"
                                    size="sm"
                                    tone="plain"
                                    onClick={() => {
                                        abortRef.current?.abort();
                                        setMessages([]);
                                        setDraft("");
                                        setFiles([]);
                                        setError(null);
                                        setStatus("Ready");
                                        composerRef.current?.focus();
                                    }}
                                >
                                    New chat
                                </ActionButton>
                            )}
                            {(!isHydrated || sending) && (
                                <Text size="xs" tone="muted" aria-live="polite">
                                    {!isHydrated
                                        ? "Checking your session…"
                                        : status}
                                </Text>
                            )}
                            <div className="ml-auto">
                                {sending ? (
                                    <ActionButton
                                        as="button"
                                        tone="plain"
                                        type="button"
                                        onClick={() =>
                                            abortRef.current?.abort()
                                        }
                                    >
                                        Stop
                                    </ActionButton>
                                ) : !isHydrated ? (
                                    <ActionButton
                                        as="button"
                                        disabled
                                        aria-label="Loading account"
                                    >
                                        Checking…
                                    </ActionButton>
                                ) : !isLoggedIn ? (
                                    <ActionButton
                                        as="button"
                                        type="button"
                                        onClick={() => login()}
                                    >
                                        <ChatIcon className="mr-2 h-4 w-4" />
                                        Connect to chat
                                    </ActionButton>
                                ) : (
                                    <ActionButton
                                        as="button"
                                        type="submit"
                                        disabled={
                                            !draft.trim() && files.length === 0
                                        }
                                    >
                                        <RocketIcon className="mr-2 h-4 w-4" />
                                        Send
                                    </ActionButton>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
                {advancedOpen && (
                    <div className="bg-surface-opaque p-3 pt-0 sm:p-4 sm:pt-0">
                        <RoutingPanel
                            selection={routing}
                            choices={modelChoices}
                            disabled={
                                !isLoggedIn || catalog.isLoading || sending
                            }
                            onChange={(field, model) =>
                                setRouting((current) => ({
                                    ...current,
                                    [field]: model,
                                }))
                            }
                        />
                    </div>
                )}
            </Surface>
        </section>
    );
}
