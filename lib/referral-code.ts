const REFERRAL_STORAGE_KEY = "nisvarthjan_referral_code";

export function normalizeReferralCode(value: string | null | undefined) {
  const code = String(value ?? "").trim().toUpperCase();
  return code || "";
}

export function getStoredReferralCode() {
  if (typeof window === "undefined") return "";
  return normalizeReferralCode(window.localStorage.getItem(REFERRAL_STORAGE_KEY));
}

export function saveReferralCode(code: string) {
  if (typeof window === "undefined") return "";

  const normalized = normalizeReferralCode(code);
  if (normalized) {
    window.localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  }
  return normalized;
}

export function captureReferralCodeFromUrl() {
  if (typeof window === "undefined") return "";

  const code = normalizeReferralCode(new URLSearchParams(window.location.search).get("ref"));
  return code ? saveReferralCode(code) : getStoredReferralCode();
}
