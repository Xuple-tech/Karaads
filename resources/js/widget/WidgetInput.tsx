import { useRef, useState } from 'react';

export function WidgetInput({
    allowFileUploads,
    disabled,
    onSend,
}: {
    allowFileUploads: boolean;
    disabled: boolean;
    onSend: (message: string, files: File[]) => Promise<void>;
}) {
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    const submit = async () => {
        const trimmed = message.trim();
        if (!trimmed || disabled) return;
        await onSend(trimmed, files);
        setMessage('');
        setFiles([]);
        if (fileRef.current) fileRef.current.value = '';
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    return (
        <form
            className="kwati-input"
            onSubmit={async (event) => {
                event.preventDefault();
                await submit();
            }}
        >
            <div className="kwati-input-row">
                <textarea
                    ref={textareaRef}
                    className="kwati-textarea"
                    value={message}
                    rows={1}
                    placeholder="Ask a question…"
                    onChange={(event) => {
                        setMessage(event.target.value);
                        autoResize();
                    }}
                    onKeyDown={async (event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            await submit();
                        }
                    }}
                />
                <div className="kwati-input-actions">
                    {allowFileUploads ? (
                        <label className="kwati-file" title="Attach files">
                            <input
                                ref={fileRef}
                                type="file"
                                multiple
                                hidden
                                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
                            />
                            {files.length > 0 ? (
                                <span className="kwati-file-badge">{files.length}</span>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                </svg>
                            )}
                        </label>
                    ) : null}
                    <button type="submit" className="kwati-send" disabled={disabled || !message.trim()} aria-label="Send">
                        {disabled ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            <div className="kwati-branding">Powered by <a href="https://kwatiai.com" target="_blank" rel="noopener">Kwati AI</a></div>
        </form>
    );
}
