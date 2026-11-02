"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type AnchorHTMLAttributes, type ReactNode } from "react";
import { ANALYTICS_CONSENT_EVENT, getAnalyticsConsent } from "./analytics-consent";
import { attributedWhatsAppUrl, captureChatGPTVisit, validateChatGPTVisit, type ChatGPTVisitCandidate } from "./chatgpt-attribution";

interface AttributionContextValue {
  enabled: boolean;
  revalidate: () => boolean;
}
const AttributionContext = createContext<AttributionContextValue | null>(null);

/** One memory-only candidate for this page load, shared by every landing CTA. */
export function WhatsAppAttributionProvider({ children }: { children: ReactNode }) {
  const candidate = useRef<ChatGPTVisitCandidate | null>(null);
  const mounted = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const revalidate = useCallback((event?: Event) => {
    if (typeof window === "undefined" || !mounted.current) return false;
    candidate.current = validateChatGPTVisit(candidate.current, window.location.search, Date.now());
    const accepted = candidate.current !== null && getAnalyticsConsent(event instanceof StorageEvent ? event : undefined) === "accepted";
    setEnabled(accepted);
    return accepted;
  }, []);

  useEffect(() => {
    mounted.current = true;
    candidate.current = captureChatGPTVisit(window.location.search, Date.now());
    revalidate();
    const timer = candidate.current
      ? window.setTimeout(revalidate, Math.max(0, candidate.current.expiresAt - Date.now()))
      : undefined;
    const events = ["storage", ANALYTICS_CONSENT_EVENT, "pageshow", "popstate"] as const;
    for (const event of events) window.addEventListener(event, revalidate);

    // pushState/replaceState do not emit popstate. Observe them too so a temporary
    // invalid URL cannot restore a candidate when the user returns to valid UTM.
    const history = window.history;
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    const pushState: History["pushState"] = (data: unknown, unused: string, url?: string | URL | null) => {
      originalPush.call(history, data, unused, url);
      revalidate();
    };
    const replaceState: History["replaceState"] = (data: unknown, unused: string, url?: string | URL | null) => {
      originalReplace.call(history, data, unused, url);
      revalidate();
    };
    history.pushState = pushState;
    history.replaceState = replaceState;
    return () => {
      mounted.current = false;
      candidate.current = null;
      if (timer !== undefined) window.clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, revalidate);
      if (history.pushState === pushState) history.pushState = originalPush;
      if (history.replaceState === replaceState) history.replaceState = originalReplace;
    };
  }, [revalidate]);

  const value = useMemo(() => ({ enabled, revalidate }), [enabled, revalidate]);
  return <AttributionContext.Provider value={value}>{children}</AttributionContext.Provider>;
}

type WhatsAppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function AttributedWhatsAppLink({ href, onClick, onAuxClick, onContextMenu, ...props }: WhatsAppLinkProps) {
  const attribution = useContext(AttributionContext);
  function prepareLink(link: HTMLAnchorElement) {
    link.href = attributedWhatsAppUrl(href, attribution?.revalidate() ?? false);
  }
  return (
    <a
      {...props}
      href={attributedWhatsAppUrl(href, attribution?.enabled ?? false)}
      onClick={(event) => { prepareLink(event.currentTarget); onClick?.(event); }}
      onAuxClick={(event) => { prepareLink(event.currentTarget); onAuxClick?.(event); }}
      onContextMenu={(event) => { prepareLink(event.currentTarget); onContextMenu?.(event); }}
    />
  );
}
