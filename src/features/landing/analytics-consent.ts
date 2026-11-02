export type AnalyticsConsent = "accepted" | "rejected" | null;
export type AnalyticsConsentChoice = Exclude<AnalyticsConsent, null>;

export const ANALYTICS_CONSENT_STORAGE_KEY = "villaverde_analytics_consent_v2";
export const ANALYTICS_CONSENT_EVENT = "villaverde:analytics-consent";

let consentForVisit: AnalyticsConsent = null;
let useVisitChoice = false;

export function getAnalyticsConsent(storageChange?: Pick<StorageEvent, "key" | "newValue">): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  // A revocation is still known when the subsequent storage read fails. Never let
  // a previously cached acceptance hide that explicit signal from another tab.
  if (storageChange && (storageChange.key === ANALYTICS_CONSENT_STORAGE_KEY || storageChange.key === null) && storageChange.newValue !== "accepted") {
    consentForVisit = storageChange.newValue === "rejected" ? "rejected" : null;
  }
  if (useVisitChoice) return consentForVisit;

  try {
    const saved = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    consentForVisit = saved === "accepted" || saved === "rejected" ? saved : null;
  } catch {
    // Keep the known choice for this visit when storage becomes unavailable.
  }

  return consentForVisit;
}

export function saveAnalyticsConsent(choice: AnalyticsConsentChoice): void {
  if (typeof window === "undefined") return;
  consentForVisit = choice;

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, choice);
    useVisitChoice = false;
  } catch {
    // A failed write must not restore an older saved choice during this visit.
    useVisitChoice = true;
  }
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
}
