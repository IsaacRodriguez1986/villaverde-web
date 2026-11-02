export const CHATGPT_REFERENCE = "[VV-REF:chatgpt_ads:villaverde_eventos:v1]";
export const ATTRIBUTION_TTL_MS = 1_800_000;

export interface ChatGPTVisitCandidate {
  capturedAt: number;
  expiresAt: number;
}

const REQUIRED = {
  utm_source: "chatgpt",
  utm_medium: "paid",
  utm_campaign: "villaverde_eventos",
} as const;
const COMPETING = new Set(["fbclid", "gclid", "dclid", "msclkid", "ttclid", "ctwa_clid"]);
const validClock = (now: number) => Number.isSafeInteger(now) && now >= 0 && Number.isFinite(new Date(now).getTime());

export function hasChatGPTPaidQuery(search: string): boolean {
  const query = new URLSearchParams(search);
  for (const name of query.keys()) {
    if (COMPETING.has(name.toLowerCase())) return false;
    if (name.toLowerCase().startsWith("utm_") && !Object.hasOwn(REQUIRED, name)) return false;
  }
  return Object.entries(REQUIRED).every(([name, value]) => {
    const values = query.getAll(name);
    return values.length === 1 && values[0] === value;
  });
}

export function captureChatGPTVisit(search: string, now: number): ChatGPTVisitCandidate | null {
  const expiresAt = now + ATTRIBUTION_TTL_MS;
  if (!validClock(now) || !validClock(expiresAt) || !hasChatGPTPaidQuery(search)) return null;
  return { capturedAt: now, expiresAt };
}

export function validateChatGPTVisit(candidate: ChatGPTVisitCandidate | null, search: string, now: number): ChatGPTVisitCandidate | null {
  if (!candidate || !validClock(now) || !validClock(candidate.capturedAt) || !validClock(candidate.expiresAt) ||
      candidate.expiresAt !== candidate.capturedAt + ATTRIBUTION_TTL_MS ||
      now < candidate.capturedAt || now >= candidate.expiresAt || !hasChatGPTPaidQuery(search)) return null;
  return candidate;
}

/** Always receive the original link, never a previously decorated DOM href. */
export function attributedWhatsAppUrl(originalUrl: string, enabled: boolean): string {
  if (!enabled) return originalUrl;
  try {
    const url = new URL(originalUrl);
    if (url.protocol !== "https:" || url.host !== "wa.me" || url.pathname !== "/529995485862" || url.username || url.password) return originalUrl;
    const text = url.searchParams.get("text") || "Hola, quiero información de Villaverde";
    url.searchParams.set("text", text + "\n" + CHATGPT_REFERENCE);
    return url.toString();
  } catch {
    return originalUrl;
  }
}
