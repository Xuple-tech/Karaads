import { handleUnauthorizedResponse } from '@/spa/lib/auth-runtime';
import { getAuthToken } from '@/spa/lib/auth-token';

export type ApiErrorShape = {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
};

export class ApiError extends Error {
    status: number;
    errors?: Record<string, string[]>;

    constructor(shape: ApiErrorShape) {
        super(shape.message);
        this.name = 'ApiError';
        this.status = shape.status;
        this.errors = shape.errors;
    }
}

type RequestOptions = RequestInit & {
    json?: unknown;
};

function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers ?? {});
    headers.set('Accept', 'application/json');
    const token = getAuthToken();

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Always include CSRF token for session-based Sanctum auth
    const xsrf = getXsrfToken();
    if (xsrf) {
        headers.set('X-XSRF-TOKEN', xsrf);
    }

    if (options.json !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
        body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (response.status === 401) {
        await handleUnauthorizedResponse();
    }

    if (!response.ok) {
        throw new ApiError({
            status: response.status,
            message: payload?.message ?? payload?.error ?? 'Request failed',
            errors: payload?.errors,
        });
    }

    return payload as T;
}
