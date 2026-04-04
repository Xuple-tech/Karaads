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

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers(options.headers ?? {});
    headers.set('Accept', 'application/json');

    if (options.json !== undefined) {
        headers.set('Content-Type', 'application/json');
        headers.set('X-CSRF-TOKEN', csrfToken());
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
        body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        throw new ApiError({
            status: response.status,
            message: payload?.message ?? payload?.error ?? 'Request failed',
            errors: payload?.errors,
        });
    }

    return payload as T;
}
