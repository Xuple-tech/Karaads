export type ApiVersion = "v1_2" | "v1_1" | "v3";

export type KaraErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "HTTP_ERROR"
  | "ACCOUNT_SETUP_REQUIRED";

export type ApiEnvelopeSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiEnvelopeError = {
  success: false;
  error: {
    code: KaraErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiRequestConfig = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  version?: ApiVersion;
  signal?: AbortSignal;
  /** Aborts the request if it hasn't settled within this many ms. Defaults to 15000. */
  timeoutMs?: number;
};

export type ApiRequestResult<T> = {
  data: T;
  meta?: Record<string, unknown>;
};
