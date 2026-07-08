// Secured backend proxy for Eventus Pro.
// Replaces direct browser->Supabase access (which used the public anon key + open RLS).
// - Client ops are scoped to a single event "code" (the capability the client holds).
// - Sensitive columns (activated, invitation_enabled, total_cost, invitation_url) are admin-only.
// - Admin ops require DASH_PASSWORD (validated here, server-side).
// Uses the SERVICE key (bypasses RLS) so RLS can be locked down to deny anon entirely.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const ADMIN_PW = process.env.DASH_PASSWORD || "";

const TABLES = ["eventus_events", "eventus_guests", "eventus_payments", "eventus_checklist", "eventus_program"];
const CHILD = ["eventus_guests", "eventus_payments", "eventus_checklist", "eventus_program"];

// Columns a non-admin client may set when PATCHing eventus_events
const EVENT_PATCH_ALLOW = ["num_mesas", "menu_sel", "invitation_brief", "invitation_status", "invitation_comments", "dress_code", "event_time"];
// Invitation states a client may move into
const INV_STATUS_CLIENT = ["en_diseno", "aprobada", "con_cambios"];

function j(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

async function sb(method: string, path: string, body?: unknown) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: "Bearer " + SERVICE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  let json: any = null;
  try { json = txt ? JSON.parse(txt) : null; } catch { json = null; }
  return { ok: r.ok, status: r.status, json };
}

function parseEq(query: string, key: string): string | null {
  const m = query.match(new RegExp("(?:^|&)" + key + "=eq\\.([^&]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

async function rowEventCode(table: string, id: string): Promise<string | null> {
  const r = await sb("GET", table + "?id=eq." + encodeURIComponent(id) + "&select=event_code", undefined);
  return r.ok && Array.isArray(r.json) && r.json[0] ? r.json[0].event_code : null;
}

function sanitizeRegister(body: any) {
  return {
    code: body.code,
    name: String(body.name || "").slice(0, 120),
    type: ["xv", "boda", "graduacion"].includes(body.type) ? body.type : "xv",
    date: body.date,
    hours: 7,
    total_cost: 0,
    contract_date: body.contract_date || null,
    num_mesas: 20,
    menu_sel: {},
    phone: String(body.phone || "").replace(/\D/g, "").slice(0, 15),
    activated: false,
    invitation_enabled: false,
    invitation_status: "sin_brief",
  };
}

// ---- RSVP (guest-facing): GET ?code=&guestId= ; capability = knowing code+guestId ----
export async function GET(req: Request) {
  if (!SERVICE_KEY) return j({ error: "server not configured" }, 500);
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const guestId = url.searchParams.get("guestId");
  if (!code || !guestId) return j({ error: "missing params" }, 400);
  const ev = await sb("GET", "eventus_events?code=eq." + encodeURIComponent(code) + "&select=code,name,type,date,event_time,dress_code,invitation_url,invitation_status");
  if (!ev.ok || !Array.isArray(ev.json) || !ev.json[0]) return j({ error: "not found" }, 404);
  const g = await sb("GET", "eventus_guests?id=eq." + encodeURIComponent(guestId) + "&event_code=eq." + encodeURIComponent(code) + "&select=id,name,companions,status,mesa");
  return j({ event: ev.json[0], guest: (Array.isArray(g.json) && g.json[0]) || null });
}

// ---- RSVP write: PATCH {code, guestId, status} ----
export async function PATCH(req: Request) {
  if (!SERVICE_KEY) return j({ error: "server not configured" }, 500);
  let b: any = {};
  try { b = await req.json(); } catch { b = {}; }
  const { code, guestId, status } = b || {};
  if (!code || !guestId || !["confirmed", "cancelled"].includes(status)) return j({ error: "bad request" }, 400);
  const g = await sb("GET", "eventus_guests?id=eq." + encodeURIComponent(guestId) + "&event_code=eq." + encodeURIComponent(code) + "&select=id");
  if (!g.ok || !Array.isArray(g.json) || !g.json[0]) return j({ error: "not found" }, 404);
  const r = await sb("PATCH", "eventus_guests?id=eq." + encodeURIComponent(guestId), { status });
  return j(r.ok ? { ok: true } : { error: "update failed" }, r.ok ? 200 : 400);
}

// ---- Main proxy: POST {op:'auth'} | {op:'db', method, table, query, body, code, adminPw} ----
export async function POST(req: Request) {
  if (!SERVICE_KEY) return j({ error: "server not configured" }, 500);
  let b: any = {};
  try { b = await req.json(); } catch { return j({ error: "bad json" }, 400); }

  const isAdmin = !!(b.adminPw && ADMIN_PW && b.adminPw === ADMIN_PW);

  if (b.op === "auth") return j({ admin: isAdmin });
  if (b.op !== "db") return j({ error: "bad op" }, 400);

  const method = String(b.method || "GET").toUpperCase();
  const table = String(b.table || "");
  const query = String(b.query || "");
  const body = b.body ?? null;
  const cap = b.code || null; // capability: the logged-in event code

  if (!TABLES.includes(table)) return j({ error: "table not allowed" }, 400);

  // ADMIN: full access via service key
  if (isAdmin) {
    const path = table + (query ? "?" + query : "");
    const r = await sb(method, path, body);
    return j(r.ok ? (r.json ?? []) : { error: "supabase", detail: r.json }, r.ok ? 200 : r.status);
  }

  // NON-ADMIN: strict allow-list, everything scoped to `cap`
  try {
    return await clientOp(method, table, query, body, cap);
  } catch (e: any) {
    return j({ error: e?.message || "forbidden" }, e?.code || 403);
  }
}

function deny(msg: string) {
  const e: any = new Error(msg);
  e.code = 403;
  return e;
}

async function clientOp(method: string, table: string, query: string, body: any, cap: string | null): Promise<Response> {
  if (table === "eventus_events") {
    if (method === "GET") {
      const qc = parseEq(query, "code");
      if (qc) {
        if (!cap || qc !== cap) throw deny("code mismatch");
        const r = await sb("GET", "eventus_events?code=eq." + encodeURIComponent(qc) + "&select=*");
        return j(r.json ?? []);
      }
      // register dedup by phone -> only return code,name
      if (/^or=\(phone\.eq\./.test(query)) {
        const phones = (query.match(/phone\.eq\.([^,)]+)/g) || []).map((s) => decodeURIComponent(s.replace("phone.eq.", "")));
        if (!phones.length) throw deny("bad dedup");
        const orExpr = "or=(" + phones.map((p) => "phone.eq." + encodeURIComponent(p)).join(",") + ")";
        const r = await sb("GET", "eventus_events?" + orExpr + "&select=code,name&limit=1");
        return j(r.json ?? []);
      }
      throw deny("events read not allowed");
    }
    if (method === "POST") {
      if (!body || !body.code) throw deny("register needs code");
      const clean = sanitizeRegister(body);
      const r = await sb("POST", "eventus_events", clean);
      return j(r.ok ? (r.json ?? []) : { error: "supabase" }, r.ok ? 200 : 400);
    }
    if (method === "PATCH") {
      const qc = parseEq(query, "code");
      if (!qc || !cap || qc !== cap) throw deny("code mismatch");
      const clean: any = {};
      Object.keys(body || {}).forEach((k) => { if (EVENT_PATCH_ALLOW.includes(k)) clean[k] = body[k]; });
      if ("invitation_status" in clean && !INV_STATUS_CLIENT.includes(clean.invitation_status)) delete clean.invitation_status;
      if (!Object.keys(clean).length) throw deny("no allowed fields");
      const r = await sb("PATCH", "eventus_events?code=eq." + encodeURIComponent(qc), clean);
      return j(r.ok ? (r.json ?? []) : { error: "supabase" }, r.ok ? 200 : 400);
    }
    throw deny("events op not allowed");
  }

  if (CHILD.includes(table)) {
    if (method === "GET") {
      const ec = parseEq(query, "event_code");
      if (!ec || !cap || ec !== cap) throw deny("event_code mismatch");
      const r = await sb("GET", table + "?" + query);
      return j(r.json ?? []);
    }
    if (method === "POST") {
      if (table === "eventus_payments") throw deny("cannot create payments");
      if (!body) throw deny("no body");
      const arr = Array.isArray(body) ? body : [body];
      for (const row of arr) { if (!cap || row.event_code !== cap) throw deny("event_code mismatch"); }
      const r = await sb("POST", table, body);
      return j(r.ok ? (r.json ?? []) : { error: "supabase" }, r.ok ? 200 : 400);
    }
    if (method === "PATCH") {
      const id = parseEq(query, "id");
      if (!id) throw deny("patch needs id");
      const ec = await rowEventCode(table, id);
      if (!ec || !cap || ec !== cap) throw deny("row not in your event");
      let clean: any = body || {};
      if (table === "eventus_payments") {
        clean = {};
        if (body && "paid" in body) clean.paid = body.paid;
        if (body && "paid_at" in body) clean.paid_at = body.paid_at;
      }
      const r = await sb("PATCH", table + "?id=eq." + encodeURIComponent(id), clean);
      return j(r.ok ? (r.json ?? []) : { error: "supabase" }, r.ok ? 200 : 400);
    }
    if (method === "DELETE") {
      if (table === "eventus_payments") throw deny("cannot delete payments");
      const id = parseEq(query, "id");
      const ec0 = parseEq(query, "event_code");
      if (id) {
        const ec = await rowEventCode(table, id);
        if (!ec || !cap || ec !== cap) throw deny("row not in your event");
        await sb("DELETE", table + "?id=eq." + encodeURIComponent(id));
        return j({ ok: true });
      }
      if (ec0) {
        if (!cap || ec0 !== cap) throw deny("event_code mismatch");
        await sb("DELETE", table + "?event_code=eq." + encodeURIComponent(ec0));
        return j({ ok: true });
      }
      throw deny("delete needs id or event_code");
    }
  }
  throw deny("not allowed");
}
