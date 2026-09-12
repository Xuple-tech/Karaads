import { API_BASE_URLS } from '@/lib/api/config';
import { KaraApiError, statusToErrorCode } from '@/lib/errors/api-error';
import type { ApiRequestConfig, ApiRequestResult, ApiVersion, KaraErrorCode } from '@/lib/types/api';

type JsonObject = Record<string, unknown>;

const toQueryString = (query: ApiRequestConfig['query']): string => {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
};

const isObject = (value: unknown): value is JsonObject => {
  return typeof value === 'object' && value !== null;
};

const extractErrorCode = (payload: JsonObject | null, status: number): KaraErrorCode => {
  if (payload?.error && isObject(payload.error) && typeof payload.error.code === 'string') {
    return payload.error.code as KaraErrorCode;
  }

  return statusToErrorCode(status);
};

const extractErrorMessage = (payload: JsonObject | null, status: number): string => {
  if (typeof payload?.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  if (payload?.error && isObject(payload.error) && typeof payload.error.message === 'string') {
    return payload.error.message;
  }

  if (typeof payload?.message === 'string') {
    return payload.message;
  }

  if (payload?.errors && isObject(payload.errors)) {
    const first = Object.values(payload.errors)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') {
      return first[0];
    }
  }

  if (payload?.data && isObject(payload.data)) {
    if (typeof payload.data.message === 'string' && payload.data.message.trim()) {
      return payload.data.message.trim();
    }
    if (payload.data.errors && isObject(payload.data.errors)) {
      const first = Object.values(payload.data.errors)[0];
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
      if (typeof first === 'string') return first;
    }
  }

  return `Request failed with status ${status}`;
};

const parseJsonSafe = async (response: Response, signal: AbortSignal): Promise<JsonObject | null> => {
  // Read from a clone rather than the response directly — on this RN/Hermes/OkHttp
  // stack, reading the original response's body sometimes yields an empty string
  // for larger payloads (observed on successful /auth/login responses carrying a
  // full user profile), while reading a teed clone reliably returns the full body.
  // React Native's fetch implementation is inconsistent across Android
  // versions: either the original stream or its clone can incorrectly appear
  // empty. Read both and keep the fuller body so successful auth responses are
  // not silently converted to an empty object.
  const clone = response.clone();
  const readBody = Promise.all([
    response.text().catch(() => ''),
    clone.text().catch(() => ''),
  ]);
  let abortBodyRead: (() => void) | undefined;
  const aborted = new Promise<never>((_resolve, reject) => {
    abortBodyRead = () => reject(new Error('Request aborted while reading the response.'));
    if (signal.aborted) abortBodyRead();
    else signal.addEventListener('abort', abortBodyRead, { once: true });
  });

  let originalText: string;
  let clonedText: string;
  try {
    [originalText, clonedText] = await Promise.race([readBody, aborted]);
  } finally {
    if (abortBodyRead) signal.removeEventListener('abort', abortBodyRead);
  }
  const text = clonedText.length > originalText.length ? clonedText : originalText;
  // The production API currently prefixes JSON with a UTF-8 BOM. JavaScript's
  // JSON.parse does not accept it, so remove it before parsing the payload.
  const jsonText = text.replace(/^\uFEFF/, '').trim();
  if (!jsonText) {
    return null;
  }

  try {
    return JSON.parse(jsonText) as JsonObject;
  } catch {
    return null;
  }
};

const normalizeSuccess = <T>(payload: JsonObject | null): ApiRequestResult<T> => {
  if (!payload) {
    return { data: {} as T };
  }

  if (payload.success === true) {
    return {
      data: (payload.data as T) ?? ({} as T),
      meta: isObject(payload.meta) ? payload.meta : undefined,
    };
  }

  if ('data' in payload) {
    return {
      data: payload.data as T,
      meta: isObject(payload.meta)
        ? payload.meta
        : isObject(payload.pagination)
          ? payload.pagination
          : undefined,
    };
  }

  return { data: payload as T };
};

const DEFAULT_TIMEOUT_MS = 15000;

export const apiRequest = async <T>(
  path: string,
  config: ApiRequestConfig = {},
): Promise<ApiRequestResult<T>> => {
  const version: ApiVersion = config.version ?? 'v1_2';
  const method = config.method ?? 'GET';
  const url = `${API_BASE_URLS[version]}${path}${toQueryString(config.query)}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(config.headers ?? {}),
  };

  const isFormDataBody = typeof FormData !== 'undefined' && config.body instanceof FormData;

  if (config.body !== undefined && !isFormDataBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  // fetch() has no built-in timeout — on a flaky connection it can hang
  // indefinitely with no way to recover. Abort it ourselves so requests
  // always eventually settle, while still honoring a caller-provided signal.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let timedOut = false;
  controller.signal.addEventListener('abort', () => {
    timedOut = !config.signal?.aborted;
  });
  if (config.signal) {
    if (config.signal.aborted) controller.abort();
    else config.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response: Response;
  let payload: JsonObject | null;
  try {
    response = await fetch(url, {
      method,
      headers,
      body:
        config.body === undefined
          ? undefined
          : isFormDataBody
            ? (config.body as FormData)
            : JSON.stringify(config.body),
      signal: controller.signal,
    });

    // Keep the deadline active until the response body is consumed. React
    // Native can resolve fetch() after headers and then stall while reading the
    // JSON body, which previously left uploads stuck at "almost finished".
    payload = await parseJsonSafe(response, controller.signal);
  } catch (error) {
    const details =
      error && typeof error === 'object' && 'message' in error
        ? { cause: String((error as { message?: unknown }).message ?? 'unknown'), url, method }
        : { url, method };
    throw new KaraApiError(
      'HTTP_ERROR',
      timedOut
        ? 'Request timed out. Please check your connection and try again.'
        : 'Unable to connect. Please check your internet and try again.',
      0,
      details,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok || payload?.success === false) {
    const details =
      payload?.error && isObject(payload.error) && isObject(payload.error.details)
        ? (payload.error.details as Record<string, unknown>)
        : isObject(payload?.errors)
          ? (payload.errors as Record<string, unknown>)
          : payload?.data && isObject(payload.data) && isObject(payload.data.errors)
            ? (payload.data.errors as Record<string, unknown>)
            : undefined;

    throw new KaraApiError(
      extractErrorCode(payload, response.status),
      extractErrorMessage(payload, response.status),
      response.status,
      details,
    );
  }

  return normalizeSuccess<T>(payload);
};
