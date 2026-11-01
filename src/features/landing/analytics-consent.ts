export type AnalyticsConsent = "accepted" | "rejected" | null;
export type AnalyticsConsentChoice = Exclude<AnalyticsConsent, null>;

const STORAGE_KEY = "villaverde_analytics_consent";

let consentForVisit: AnalyticsConsent = null;
let useVisitChoice = false;

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;
  if (useVisitChoice) return consentForVisit;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
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
    window.localStorage.setItem(STORAGE_KEY, choice);
    useVisitChoice = false;
  } catch {
    // A failed write must not restore an older saved choice during this visit.
    useVisitChoice = true;
  }
}
