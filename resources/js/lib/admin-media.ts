export function resolveAdminMediaUrl(value: string | null | undefined): string | undefined {
    if (!value) return undefined;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    if (
        trimmed.startsWith('http://')
        || trimmed.startsWith('https://')
        || trimmed.startsWith('/admin/media/')
    ) {
        return trimmed;
    }

    const normalized = trimmed.replace(/\\/g, '/');
    const withoutLeadingSlash = normalized.replace(/^\/+/, '');
    const lower = withoutLeadingSlash.toLowerCase();

    if (!lower.includes('admin')) {
        return normalized;
    }

    let path = withoutLeadingSlash;
    if (path.startsWith('storage/')) {
        path = path.slice('storage/'.length);
    }

    return `/admin/media/${path}`;
}
