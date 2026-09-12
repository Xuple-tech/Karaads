import type { KaraErrorCode } from '@/lib/types/api';

export class KaraApiError extends Error {
  code: KaraErrorCode;
  details?: Record<string, unknown>;
  status: number;

  constructor(code: KaraErrorCode, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'KaraApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const statusToErrorCode = (status: number): KaraErrorCode => {
  if (status === 401) return 'UNAUTHENTICATED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 422) return 'VALIDATION_ERROR';
  if (status === 429) return 'RATE_LIMITED';
  return 'HTTP_ERROR';
};

export const isKaraApiError = (error: unknown): error is KaraApiError => {
  return error instanceof KaraApiError;
};