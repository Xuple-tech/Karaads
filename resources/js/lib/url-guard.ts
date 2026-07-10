const ABSOLUTE_PROTOCOL_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

function isSafeRelativePath(value: string): boolean {
    if (!value) return false;
    if (value.startsWith('//')) return false;
    return value.startsWith('/') || value.startsWith('./') || value.startsWith('../');
}

function parseUrl(value: string): URL | null {
    try {
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        return new URL(value, base);
    } catch {
        return null;
    }
}

export function getSafeExternalUrl(value?: string | null): string | null {
    const normalized = (value || '').trim();
    if (!normalized) return null;

    if (!ABSOLUTE_PROTOCOL_RE.test(normalized)) {
        return isSafeRelativePath(normalized) ? normalized : null;
    }

    const parsed = parseUrl(normalized);
    if (!parsed) return null;

    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
}

export function getSafeMediaUrl(value?: string | null): string | null {
    const normalized = (value || '').trim();
    if (!normalized) return null;

    if (!ABSOLUTE_PROTOCOL_RE.test(normalized)) {
        return isSafeRelativePath(normalized) ? normalized : null;
    }

    const parsed = parseUrl(normalized);
    if (!parsed) return null;

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'blob:') {
        return parsed.toString();
    }

    return null;
}
