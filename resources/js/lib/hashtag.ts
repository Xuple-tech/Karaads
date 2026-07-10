function decodeTag(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeHashtag(input: string): string {
  const decoded = decodeTag((input || "").trim());
  const withoutPrefix = decoded.replace(/^#+/, "").trim();
  const normalized = withoutPrefix
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, "");

  return normalized;
}

export function hashtagPath(input: string): string | null {
  const normalized = normalizeHashtag(input);
  if (!normalized) {
    return null;
  }

  return `/hashtag/${encodeURIComponent(normalized)}`;
}

