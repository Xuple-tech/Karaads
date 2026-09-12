import { isKaraApiError } from '@/lib/errors/api-error';

const firstDetailMessage = (details: Record<string, unknown> | undefined) => {
  if (!details) return null;
  const first = Object.values(details)[0];
  if (Array.isArray(first) && typeof first[0] === 'string') {
    return first[0];
  }
  if (typeof first === 'string') {
    return first;
  }
  return null;
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (!error) {
    return fallback;
  }

  if (isKaraApiError(error)) {
    const detailed = firstDetailMessage(error.details);
    if (detailed) {
      return detailed;
    }
    if (error.code === 'HTTP_ERROR') {
      return 'Unable to connect. Please check your internet and try again.';
    }
    return error.message;
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (lower === 'network request failed' || lower === 'fetch failed' || lower.includes('fetch failed')) {
      return 'Unable to connect. Please check your internet and try again.';
    }
    return error.message;
  }

  return fallback;
};
