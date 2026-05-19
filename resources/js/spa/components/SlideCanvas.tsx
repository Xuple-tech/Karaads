import type { CSSProperties } from 'react';

export type SlideElementStyle = Record<string, string | number | boolean | string[] | number[]>;

export type SlideElementContent = {
    text?: string;
    src?: string;
    alt?: string;
    url?: string;
    embedUrl?: string;
    provider?: string;
    chartType?: 'bar' | 'line' | 'pie';
    labels?: string[];
    series?: number[];
};

export type SlideElementShape = {
    id: string;
    type: string;
    name?: string | null;
    position?: number;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    z_index?: number;
    content?: SlideElementContent;
    style?: SlideElementStyle;
    animation?: Record<string, string | number | boolean>;
};

export type SlideShape = {
    id: string;
    title?: string | null;
    position: number;
    layout?: string;
    speaker_notes?: string | null;
    canvas_settings?: { background?: string; grid?: boolean };
    elements: SlideElementShape[];
};

function normalizeChartData(element: SlideElementShape) {
    const labels = Array.isArray(element.content?.labels) && element.content?.labels.length
        ? element.content.labels
        : ['Q1', 'Q2', 'Q3', 'Q4'];
    const series = Array.isArray(element.content?.series) && element.content?.series.length
        ? element.content.series.map((value) => Number(value) || 0)
        : [32, 48, 61, 74];

    return { labels, series };
}

function renderChart(element: SlideElementShape) {
    const chartType = String(element.content?.chartType || 'bar');
    const { labels, series } = normalizeChartData(element);
    const maxValue = Math.max(...series, 1);
    const primary = String(element.style?.chartColor || '#60A5FA');
    const secondary = String(element.style?.chartAccentColor || '#A78BFA');
    const axis = String(element.style?.chartAxisColor || 'rgba(255,255,255,0.22)');
    const text = String(element.style?.color || '#F8FAFC');

    if (chartType === 'pie') {
        const total = Math.max(series.reduce((sum, value) => sum + value, 0), 1);
        let offset = 0;
        const center = 90;
        const radius = 66;
        const colors = [primary, secondary, '#22D3EE', '#34D399', '#F59E0B'];

        return (
            <div className="flex h-full w-full items-center justify-center rounded-[24px] border border-white/10 bg-black/10 p-3">
                <svg viewBox="0 0 220 180" className="h-full w-full">
                    {series.map((value, index) => {
                        const dash = (value / total) * 414;
                        const segment = (
                            <circle
                                key={`${element.id}-pie-${index}`}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke={colors[index % colors.length]}
                                strokeWidth="28"
                                strokeDasharray={`${dash} ${414 - dash}`}
                                strokeDashoffset={-offset}
                                transform={`rotate(-90 ${center} ${center})`}
                                strokeLinecap="round"
                            />
                        );
                        offset += dash;
                        return segment;
                    })}
                    <text x="90" y="92" textAnchor="middle" fill={text} fontSize="18" fontWeight="700">
                        {String(element.content?.text || 'Mix')}
                    </text>
                </svg>
            </div>
        );
    }

    if (chartType === 'line') {
        const points = series
            .map((value, index) => {
                const x = 26 + (index * (180 / Math.max(1, series.length - 1)));
                const y = 130 - ((value / maxValue) * 90);
                return `${x},${y}`;
            })
            .join(' ');

        return (
            <div className="flex h-full w-full flex-col rounded-[24px] border border-white/10 bg-black/10 p-3">
                <svg viewBox="0 0 220 150" className="h-full w-full">
                    <line x1="20" y1="130" x2="200" y2="130" stroke={axis} strokeWidth="1.5" />
                    <line x1="20" y1="20" x2="20" y2="130" stroke={axis} strokeWidth="1.5" />
                    <polyline
                        fill="none"
                        stroke={primary}
                        strokeWidth="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={points}
                    />
                    {series.map((value, index) => {
                        const x = 26 + (index * (180 / Math.max(1, series.length - 1)));
                        const y = 130 - ((value / maxValue) * 90);
                        return (
                            <g key={`${element.id}-line-${index}`}>
                                <circle cx={x} cy={y} r="4.5" fill={secondary} />
                                <text x={x} y="145" textAnchor="middle" fill={text} fontSize="9">
                                    {labels[index] || `P${index + 1}`}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col rounded-[24px] border border-white/10 bg-black/10 p-3">
            <svg viewBox="0 0 220 150" className="h-full w-full">
                <line x1="20" y1="130" x2="200" y2="130" stroke={axis} strokeWidth="1.5" />
                <line x1="20" y1="20" x2="20" y2="130" stroke={axis} strokeWidth="1.5" />
                {series.map((value, index) => {
                    const barWidth = 26;
                    const gap = 16;
                    const x = 34 + index * (barWidth + gap);
                    const barHeight = (value / maxValue) * 92;
                    const y = 130 - barHeight;
                    return (
                        <g key={`${element.id}-bar-${index}`}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx="8"
                                fill={index % 2 === 0 ? primary : secondary}
                            />
                            <text x={x + barWidth / 2} y="145" textAnchor="middle" fill={text} fontSize="9">
                                {labels[index] || `P${index + 1}`}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function fitTextMetrics(element: SlideElementShape) {
    const baseFontSize = Number(element.style?.fontSize || 18);
    const text = String(element.content?.text || '');
    const width = Math.max(120, element.width || 0);
    const height = Math.max(54, element.height || 0);
    const charactersPerLine = Math.max(10, Math.floor(width / Math.max(7, baseFontSize * 0.58)));
    const lineCount = Math.max(
        1,
        text
            .split(/\r\n|\n|\r/)
            .reduce((count, line) => count + Math.max(1, Math.ceil(Math.max(1, line.length) / charactersPerLine)), 0),
    );
    const estimatedHeight = (lineCount * (baseFontSize * 1.42)) + 32;

    if (estimatedHeight <= height) {
        return {
            fontSize: baseFontSize,
            lineHeight: 1.42,
        };
    }

    const shrinkRatio = Math.max(0.68, Math.min(1, height / estimatedHeight));

    return {
        fontSize: Math.max(11, Math.floor(baseFontSize * shrinkRatio)),
        lineHeight: 1.3,
    };
}

export function renderSlideElementInner(element: SlideElementShape, mode: 'editor' | 'preview' = 'preview') {
    const shape = String(element.style?.shape || 'rectangle');
    const background = String(element.style?.background || 'rgba(255,255,255,0.18)');
    const borderColor = String(element.style?.borderColor || 'rgba(255,255,255,0.22)');
    const color = String(element.style?.color || '#FFFFFF');
    const radius = String(element.style?.radius || '28px');
    const textAlign = String(element.style?.textAlign || 'center');
    const contentAlign = String(element.style?.contentAlign || 'center');
    const fitted = fitTextMetrics(element);
    const fontSize = fitted.fontSize;
    const fontWeight = Number(element.style?.fontWeight || 500);
    const commonTextStyle: CSSProperties = {
        color,
        fontSize,
        fontWeight,
        lineHeight: fitted.lineHeight,
        height: '100%',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        overflow: 'hidden',
    };

    if (element.type === 'image') {
        const src = element.content?.src;
        return src ? (
            <div className="h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/10">
                <img src={src} alt={element.content?.alt || element.name || 'Slide image'} className="h-full w-full object-cover" />
            </div>
        ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[24px] border border-dashed border-white/20 bg-black/10 text-sm text-slate-300">
                Add image
            </div>
        );
    }

    if (element.type === 'video') {
        const embedUrl = element.content?.embedUrl || element.content?.url || '';
        const isIframe = /youtube|youtu\.be|vimeo/i.test(embedUrl);

        return (
            <div className="h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
                {embedUrl ? (
                    isIframe ? (
                        <iframe
                            src={embedUrl}
                            title={element.name || 'Embedded video'}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video src={embedUrl} controls className="h-full w-full object-cover" />
                    )
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-300">Add video URL</div>
                )}
            </div>
        );
    }

    if (element.type === 'chart') {
        return renderChart(element);
    }

    if (element.type === 'shape') {
        if (shape === 'circle') {
            return <div className="h-full w-full rounded-full border" style={{ background, borderColor, color }} />;
        }

        if (shape === 'triangle') {
            return (
                <div
                    className="h-full w-full"
                    style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        background,
                        border: `1px solid ${borderColor}`,
                    }}
                />
            );
        }

        const justifyClass = contentAlign === 'top'
            ? 'justify-start'
            : contentAlign === 'bottom'
              ? 'justify-end'
              : 'justify-center';
        const itemsClass = textAlign === 'left'
            ? 'items-start text-left'
            : textAlign === 'right'
              ? 'items-end text-right'
              : 'items-center text-center';

        return (
            <div
                className={`flex h-full w-full overflow-hidden border whitespace-pre-wrap break-words ${justifyClass} ${itemsClass}`}
                style={{
                    background,
                    borderColor,
                    color,
                    borderRadius: radius,
                    padding: contentAlign === 'top' ? '20px 22px' : '16px 20px',
                    lineHeight: fitted.lineHeight,
                }}
            >
                {element.content?.text || 'Shape'}
            </div>
        );
    }

    return (
        <div
            className={mode === 'editor'
                ? 'h-full whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.15)] backdrop-blur-sm'
                : 'h-full whitespace-pre-wrap break-words rounded-2xl p-4'}
            style={commonTextStyle}
        >
            {element.content?.text || element.name || element.type}
        </div>
    );
}

export function SlideCanvas({
    slide,
    baseWidth = 1280,
    baseHeight = 720,
    className = '',
}: {
    slide: SlideShape;
    baseWidth?: number;
    baseHeight?: number;
    className?: string;
}) {
    return (
        <div className={`relative aspect-video w-full overflow-hidden rounded-[26px] border border-white/10 bg-white ${className}`}>
            <div className="absolute inset-0" style={{ background: slide.canvas_settings?.background || '#0F172A' }} />
            {slide.elements
                .slice()
                .sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0))
                .map((element) => {
                    if (element.style?.hidden === true) return null;

                    return (
                        <div
                            key={element.id}
                            className="absolute overflow-hidden"
                            style={{
                                left: `${(element.x / baseWidth) * 100}%`,
                                top: `${(element.y / baseHeight) * 100}%`,
                                width: `${(element.width / baseWidth) * 100}%`,
                                height: `${(element.height / baseHeight) * 100}%`,
                                transform: `rotate(${Number(element.rotation ?? 0)}deg)`,
                            }}
                        >
                            <div className="h-full w-full" style={{ opacity: Number(element.style?.opacity ?? 100) / 100 }}>
                                {renderSlideElementInner(element)}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
