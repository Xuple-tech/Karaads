import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function WidgetMarkdown({ content }: { content: string }) {
    return (
        <div className="kwati-markdown">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noreferrer">
                            {children}
                        </a>
                    ),
                    code: ({ className, children, ...props }) => {
                        const isBlock = className?.includes('language-');

                        if (isBlock) {
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
