import { ANALYTICS_CONSENT_STORAGE_KEY } from "./analytics-consent";

const PREFERENCE_SCRIPT = `try {
  const choice = localStorage.getItem(${JSON.stringify(ANALYTICS_CONSENT_STORAGE_KEY)});
  if (choice === 'accepted' || choice === 'rejected') {
    document.documentElement.dataset.analyticsChoice = choice;
  }
} catch {}`;

export function PrivacyPreferenceBootstrap() {
  return (
    <>
      <script id="privacy-preference" dangerouslySetInnerHTML={{ __html: PREFERENCE_SCRIPT }} />
      <noscript><style>{".privacy-choice { display: none; }"}</style></noscript>
    </>
  );
}
