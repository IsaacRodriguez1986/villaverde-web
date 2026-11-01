const PREFERENCE_SCRIPT = `try {
  const choice = localStorage.getItem('villaverde_analytics_consent');
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
