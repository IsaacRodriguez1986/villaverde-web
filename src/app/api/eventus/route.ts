import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function supabaseFetch(path: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing Supabase configuration");
  }

  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  return fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.method === "PATCH"
        ? { Prefer: "return=representation" }
        : {}),
      ...(options.headers || {}),
    },
  });
}

// Validation helpers
const CODE_RE = /^[a-zA-Z0-9_-]+$/;
const VALID_STATUSES = ["confirmed", "cancelled"];

function isValidCode(v: string | null): v is string {
  return typeof v === "string" && v.length > 0 && CODE_RE.test(v);
}

function isNumeric(v: string | null): v is string {
  return typeof v === "string" && /^\d+$/.test(v);
}

function corsJson(data: unknown, opts: { status?: number } = {}) {
  return NextResponse.json(data, { status: opts.status || 200, headers: CORS_HEADERS });
}

// --------------- GET ---------------
// ?code=CODE&guestId=ID — returns { event, guest }
// ?code=CODE&count=1   — returns { confirmed, total }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    const guestId = searchParams.get("guestId");
    const wantCount = searchParams.get("count");

    if (!isValidCode(code)) {
      return corsJson(
        { error: "Invalid or missing code parameter" },
        { status: 400 }
      );
    }

    // Mode: count confirmed for an event
    if (wantCount) {
      const [confirmedRes, totalRes] = await Promise.all([
        supabaseFetch(
          `eventus_guests?event_code=eq.${encodeURIComponent(code)}&status=eq.confirmed&select=companions`,
          { headers: { Prefer: "count=exact" } }
        ),
        supabaseFetch(
          `eventus_guests?event_code=eq.${encodeURIComponent(code)}&select=id`,
          { headers: { Prefer: "count=exact" } }
        ),
      ]);
      if (!confirmedRes.ok || !totalRes.ok) {
        return corsJson({ error: "Failed to fetch counts" }, { status: 500 });
      }
      const confirmedRows: Array<{ companions?: number | null }> = await confirmedRes.json();
      const total = Number(totalRes.headers.get("content-range")?.split("/")[1] || 0);
      const confirmedCount = confirmedRows.length;
      const peopleCount = confirmedRows.reduce(
        (acc, r) => acc + 1 + (Number(r.companions) || 0),
        0
      );
      return corsJson({
        confirmed: confirmedCount,
        people: peopleCount,
        total,
      });
    }

    if (!isNumeric(guestId)) {
      return corsJson(
        { error: "Invalid or missing guestId parameter" },
        { status: 400 }
      );
    }

    const [eventRes, guestRes] = await Promise.all([
      supabaseFetch(
        `eventus_events?code=eq.${encodeURIComponent(code)}&select=*&limit=1`
      ),
      supabaseFetch(
        `eventus_guests?id=eq.${encodeURIComponent(guestId)}&event_code=eq.${encodeURIComponent(code)}&select=*&limit=1`
      ),
    ]);

    if (!eventRes.ok || !guestRes.ok) {
      return corsJson(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    const events = await eventRes.json();
    const guests = await guestRes.json();

    return corsJson({
      event: events?.[0] || null,
      guest: guests?.[0] || null,
    });
  } catch (err) {
    console.error("[api/eventus] GET error:", err);
    return corsJson(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------- POST ---------------
// Public RSVP for open invitations (no pre-assigned guestId).
// Body: { code, name, phone, companions, attendance, source? }
// → Inserts into eventus_guests with status=confirmed
// → Best-effort WhatsApp notification to delegate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code || "").trim();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").replace(/[^0-9]/g, "");
    const companions = Math.max(0, Math.min(10, Number(body?.companions) || 0));
    const attendance = String(body?.attendance || "confirmed").trim();
    const source = String(body?.source || "diadelmaestro").slice(0, 40);

    if (!isValidCode(code)) {
      return corsJson({ error: "Invalid code" }, { status: 400 });
    }
    if (name.length < 2 || name.length > 120) {
      return corsJson({ error: "Invalid name" }, { status: 400 });
    }
    if (phone.length < 8 || phone.length > 15) {
      return corsJson({ error: "Invalid phone" }, { status: 400 });
    }

    const status = attendance.toLowerCase().startsWith("no") ? "cancelled" : "confirmed";

    void source;
    const insertRes = await supabaseFetch(`eventus_guests`, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        event_code: code,
        name,
        wa: phone,
        companions,
        status,
      }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      console.error("[api/eventus] POST upstream error:", insertRes.status, text);
      return corsJson(
        { error: "Failed to register confirmation" },
        { status: 500 }
      );
    }

    const inserted = await insertRes.json();
    const guest = inserted?.[0] || null;

    // Best-effort: notify delegate via WhatsApp (does not block response if it fails)
    notifyDelegate({ code, name, phone, companions, status }).catch((e) =>
      console.error("[api/eventus] notify error:", e)
    );

    return corsJson({ ok: true, guest });
  } catch (err) {
    console.error("[api/eventus] POST error:", err);
    return corsJson({ error: "Internal server error" }, { status: 500 });
  }
}

// Sends WhatsApp text to delegate using Meta Cloud API. Silent if env missing.
async function notifyDelegate(payload: {
  code: string;
  name: string;
  phone: string;
  companions: number;
  status: string;
}) {
  const WA_TOKEN = process.env.WA_ACCESS_TOKEN;
  const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID;
  const DELEGADO = process.env.DELEGADO_S114_PHONE || "525540954285";
  if (!WA_TOKEN || !WA_PHONE_ID) {
    console.warn("[api/eventus] WA env vars missing — skipping delegate notification");
    return;
  }
  const total = 1 + payload.companions;
  const title = payload.status === "confirmed" ? "✅ Nueva confirmación" : "❌ Cancelación";
  const body =
    `${title} — Día del Maestro S114\n\n` +
    `👤 ${payload.name}\n` +
    `📱 ${payload.phone}\n` +
    `👥 ${total} persona${total === 1 ? "" : "s"}\n` +
    `🎟 Evento: ${payload.code}\n\n` +
    `Ver lista completa en Eventus.`;
  await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: DELEGADO,
      type: "text",
      text: { body },
    }),
  });
}

// --------------- PATCH ---------------
// Body: { guestId, code, status }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestId, code, status } = body ?? {};

    if (!isValidCode(code)) {
      return corsJson(
        { error: "Invalid or missing code" },
        { status: 400 }
      );
    }

    if (!isNumeric(String(guestId))) {
      return corsJson(
        { error: "Invalid or missing guestId" },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return corsJson(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const res = await supabaseFetch(
      `eventus_guests?id=eq.${encodeURIComponent(String(guestId))}&event_code=eq.${encodeURIComponent(code)}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("[api/eventus] PATCH upstream error:", res.status, text);
      return corsJson(
        { error: "Failed to update guest status" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return corsJson({ guest: data?.[0] || null });
  } catch (err) {
    console.error("[api/eventus] PATCH error:", err);
    return corsJson(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
