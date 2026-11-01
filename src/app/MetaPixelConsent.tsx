"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  getAnalyticsConsent,
  saveAnalyticsConsent,
  type AnalyticsConsent,
  type AnalyticsConsentChoice,
} from "@/features/landing/analytics-consent";

export default function MetaPixelConsent() {
  const [consent, setConsent] = useState<AnalyticsConsent>(null);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, []);

  const choose = (value: AnalyticsConsentChoice) => {
    saveAnalyticsConsent(value);
    setConsent(value);
  };

  return (
    <>
      {consent === "accepted" && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '460528009991262');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
      {consent === null && (
        <aside className="privacy-choice" aria-label="Preferencias de privacidad">
          <p>
            Usamos Meta Pixel para medir qué anuncios generan consultas. Puedes
            aceptar esa medición o continuar sin ella.
          </p>
          <div className="privacy-choice-actions">
            <button
              type="button"
              aria-label="Continuar sin medición publicitaria"
              onClick={() => choose("rejected")}
            >
              Continuar sin medición
            </button>
            <button
              type="button"
              className="is-primary"
              aria-label="Aceptar medición publicitaria"
              onClick={() => choose("accepted")}
            >
              Aceptar medición
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
