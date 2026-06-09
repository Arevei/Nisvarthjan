const REFERRAL_STORAGE_KEY = "nisvarthjan_referral_code";

export function normalizeReferralCode(value: string | null | undefined) {
  const code = String(value ?? "").trim().toUpperCase();
  return code || "";
}

export function getStoredReferralCode() {
  if (typeof window === "undefined") return "";
  return normalizeReferralCode(window.sessionStorage.getItem(REFERRAL_STORAGE_KEY));
}

export function saveReferralCode(code: string) {
  if (typeof window === "undefined") return "";

  const normalized = normalizeReferralCode(code);
  if (normalized) {
    window.sessionStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
  }
  return normalized;
}

export function captureReferralCodeFromUrl() {
  if (typeof window === "undefined") return "";

  const code = normalizeReferralCode(new URLSearchParams(window.location.search).get("ref"));
  return code ? saveReferralCode(code) : getStoredReferralCode();
}
