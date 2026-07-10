const STORAGE_KEY = "rewarded_client_id";

export function getRewardedClientId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = window.sessionStorage.getItem(STORAGE_KEY);
  if (existing && existing.length > 0) {
    return existing;
  }

  const generated =
    typeof window.crypto !== "undefined" && "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `rewarded-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.sessionStorage.setItem(STORAGE_KEY, generated);
  return generated;
}
