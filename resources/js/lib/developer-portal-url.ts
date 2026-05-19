export interface DeveloperPortalConfig {
    base_url?: string;
    login_url?: string;
    register_url?: string;
    logout_url?: string;
    uses_subdomain?: boolean;
}

export function normalizeDeveloperPortalBaseUrl(baseUrl?: string): string {
    return (baseUrl ?? '/developer-api').replace(/\/+$/, '');
}

export function developerPortalUrl(baseUrl: string | undefined, path = ''): string {
    const normalizedBaseUrl = normalizeDeveloperPortalBaseUrl(baseUrl);
    const normalizedPath = String(path || '').replace(/^\/+/, '');
    const combined = normalizedPath === '' ? normalizedBaseUrl : `${normalizedBaseUrl}/${normalizedPath}`;

    if (typeof window !== 'undefined') {
        try {
            const url = new URL(combined, window.location.origin);

            if (url.origin === window.location.origin) {
                return `${url.pathname}${url.search}${url.hash}`;
            }
        } catch {
            return combined;
        }
    }

    return combined;
}
