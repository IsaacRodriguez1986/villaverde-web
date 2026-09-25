import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const ACCESS_SECRET = process.env.EVENTUS_ACCESS_SECRET || SERVICE_KEY;
const ADMIN_PW = process.env.DASH_PASSWORD || "";
const ADMIN_COOKIE = "eventus_admin";
const ADMIN_TTL = 8 * 3600;
const ACCESS_TTL = 30 * 86400;
const CODE = /^[A-Za-z0-9_-]{3,64}$/;
const ID = /^(?:[1-9][0-9]{0,18}|[a-f0-9-]{36})$/i;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

type Row = Record<string, any>;
type Access = { scope: "event" | "guest" | "admin"; code?: string; guestId?: string; exp: number; nonce: string };
const COLUMNS: Record<string, string[]> = {
  eventus_events: "code,name,type,date,hours,total_cost,contract_date,num_mesas,menu_sel,phone,activated,invitation_enabled,invitation_status,invitation_brief,invitation_url,invitation_comments,dress_code,event_time,photo_url,gallery,source,created_at".split(","),
  eventus_guests: "id,event_code,name,companions,mesa,status,wa,arrived,arrived_at,created_at,version".split(","),
  eventus_payments: "id,event_code,name,amount,due_date,note,paid,paid_at,created_at".split(","),
  eventus_checklist: "id,event_code,text,done,sort_order".split(","),
  eventus_program: "id,event_code,name,time,dur,note,sort_order,responsible,status,version,day_offset".split(","),
};
const CLIENT_WRITE: Record<string, string[]> = {
  eventus_events: "num_mesas,menu_sel,invitation_brief,invitation_status,invitation_comments,dress_code,event_time,photo_url,gallery".split(","),
  eventus_guests: "name,companions,mesa,status,wa,arrived,arrived_at".split(","),
  eventus_checklist: "text,done,sort_order".split(","),
  eventus_program: "name,time,dur,note,sort_order".split(","),
};

function j(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    "Content-Type": "application/json", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", ...headers,
  } });
}
function fail(message = "forbidden", status = 403): never { throw Object.assign(new Error(message), { status }); }
function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
function issue(scope: Access["scope"], code?: string, guestId?: string) {
  const access: Access = { scope, code, guestId, exp: Math.floor(Date.now() / 1000) + (scope === "admin" ? ADMIN_TTL : ACCESS_TTL), nonce: randomBytes(16).toString("base64url") };
  const payload = Buffer.from(JSON.stringify(access)).toString("base64url");
  const signature = createHmac("sha256", ACCESS_SECRET).update("eventus-v1." + payload).digest("base64url");
  return "ev1." + payload + "." + signature;
}
function verify(token: unknown, scope: Access["scope"]): Access | null {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "ev1" || !/^[A-Za-z0-9_-]+$/.test(parts[1])) return null;
  const expected = createHmac("sha256", ACCESS_SECRET).update("eventus-v1." + parts[1]).digest("base64url");
  if (!safeEqual(parts[2], expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as Access;
    if (p.scope !== scope || !Number.isInteger(p.exp) || p.exp <= Date.now() / 1000 || typeof p.nonce !== "string") return null;
    if (scope !== "admin" && (typeof p.code !== "string" || !CODE.test(p.code))) return null;
    if (scope === "guest" && (typeof p.guestId !== "string" || !ID.test(p.guestId))) return null;
    return p;
  } catch { return null; }
}
function isAdmin(req: Request) {
  const token = (req.headers.get("cookie") || "").split(";").map(s => s.trim()).find(s => s.startsWith(ADMIN_COOKIE + "="))?.slice(ADMIN_COOKIE.length + 1);
  return !!verify(token, "admin");
}
function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const fetchSite = req.headers.get("sec-fetch-site");
  if ((origin && origin !== new URL(req.url).origin) || (fetchSite && !["same-origin", "none"].includes(fetchSite))) fail("invalid origin");
}
function cookie(req: Request, value: string, maxAge: number) {
  return `${ADMIN_COOKIE}=${value}; Path=/api/eventus; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`;
}
// Shared database limiter survives serverless restarts and concurrent instances.
// Only Vercel's overwritten header is trusted, never the caller's X-Forwarded-For.
async function limit(req: Request, operation: string, max: number, windowMs: number) {
  const ip = process.env.VERCEL === "1" ? req.headers.get("x-vercel-forwarded-for") || "unknown" : "local";
  const key = "eventus:" + operation + ":" + createHmac("sha256", ACCESS_SECRET).update(ip).digest("hex");
  const result = await sb("POST", "rpc/check_rate_limit", new URLSearchParams(), { p_key: key, p_max: max, p_window_seconds: Math.ceil(windowMs / 1000) });
  if (result !== true) fail("too many requests", 429);
}
async function jsonBody(req: Request) {
  if (!req.headers.get("content-type")?.startsWith("application/json")) fail("JSON required", 415);
  if (Number(req.headers.get("content-length") || 0) > 65536) fail("request too large", 413);
  const raw = await req.text();
  if (Buffer.byteLength(raw) > 65536) fail("request too large", 413);
  let b: Row;
  try { b = JSON.parse(raw); } catch { fail("bad JSON", 400); }
  if (!b || typeof b !== "object" || Array.isArray(b)) fail("bad request", 400);
  return b;
}
async function sb(method: string, table: string, params: URLSearchParams, body?: unknown) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?" + params.toString(), {
    method, cache: "no-store", headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, "Content-Type": "application/json", Prefer: "return=representation" },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const raw = await r.text();
  if (!r.ok) {
    let error: Row = {}; try { error = JSON.parse(raw); } catch {}
    if (["40001", "40P01"].includes(error.code)) fail("version_conflict", 409);
    if (error.code === "23514") fail(error.message === "table_full" ? "table_full" : "invalid_data", 409);
    if (error.code === "P0002") fail("not_found", 404);
    if (error.code === "22023") fail(error.message || "invalid_data", 400);
    fail("database operation failed", 502);
  }
  return raw ? JSON.parse(raw) : [];
}
async function coordinationRpc(body: Row) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/mutate_event_coordination_task", {
    method: "POST", cache: "no-store",
    headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  let parsed: any = null;
  try { parsed = raw ? JSON.parse(raw) : null; } catch { /* handled below */ }
  if (!r.ok) {
    if (parsed?.code === "40001" || parsed?.message === "version_conflict") fail("version_conflict", 409);
    if (parsed?.code === "P0002" || parsed?.message === "task_not_found") fail("task_not_found", 404);
    if (parsed?.code === "22023") fail("invalid_transition", 400);
    fail("database operation failed", 502);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) fail("invalid task response", 502);
  return parsed as Row;
}
async function changeRequestRpc(body: Row) {
  const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/mutate_event_change_request", {
    method: "POST", cache: "no-store",
    headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await r.text();
  let parsed: any = null;
  try { parsed = raw ? JSON.parse(raw) : null; } catch { /* handled below */ }
  if (!r.ok) {
    if (parsed?.code === "40001" || parsed?.message === "version_conflict") fail("version_conflict", 409);
    if (parsed?.code === "P0002" || parsed?.message === "request_not_found") fail("request_not_found", 404);
    if (parsed?.code === "22023") fail(parsed?.message || "invalid_request", 400);
    fail("database operation failed", 502);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) fail("invalid request response", 502);
  return parsed as Row;
}
async function privateImages(value: any, code: string, cache = new Map<string, Promise<string>>()): Promise<any> {
  if (Array.isArray(value)) return Promise.all(value.map(item => privateImages(item, code, cache)));
  if (value && typeof value === "object") return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k, v]) => [k, await privateImages(v, code, cache)])));
  if (typeof value !== "string") return value;
  const storagePrefix = "storage://";
  const httpPrefix = SUPABASE_URL + "/storage/v1/object/";
  if (!value.startsWith(storagePrefix) && !value.startsWith(httpPrefix)) return value;
  const path = value.startsWith(storagePrefix)
    ? value.slice(storagePrefix.length)
    : value.slice(httpPrefix.length).split("?")[0].replace(/^(public|sign)\//, "");
  if (!code || !path.startsWith("eventus-photos/" + code + "/") || !/^[A-Za-z0-9_./-]+$/.test(path) || path.includes("..")) return "";
  if (!cache.has(path)) cache.set(path, (async () => {
    const r = await fetch(SUPABASE_URL + "/storage/v1/object/sign/" + path, { method: "POST", headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 3600 }) });
    if (!r.ok) fail("photo access unavailable", 502);
    const result = await r.json();
    const signed = result.signedURL || result.signedUrl;
    if (typeof signed !== "string" || !signed.startsWith("/object/sign/")) fail("photo access unavailable", 502);
    return SUPABASE_URL + "/storage/v1" + signed;
  })());
  return cache.get(path);
}
async function eventExists(code: string) {
  if (!CODE.test(code)) fail();
  const rows = await sb("GET", "eventus_events", new URLSearchParams({ code: "eq." + code, select: "code", limit: "2" }));
  // Older deployments did not enforce unique codes. Never authorize ambiguous rows.
  if (!Array.isArray(rows) || rows.length !== 1) fail("event unavailable", 404);
}
function queryFor(table: string, raw: unknown) {
  if (raw != null && (typeof raw !== "string" || raw.length > 2048)) fail("invalid query", 400);
  const input = new URLSearchParams(raw || "");
  const q = new URLSearchParams();
  const seen = new Set<string>();
  for (const [key, value] of input) {
    if (seen.has(key)) fail("duplicate filter", 400);
    seen.add(key);
    if (["code", "event_code", "id"].includes(key)) {
      if ((key === "code") !== (table === "eventus_events") && key !== "id") fail("invalid filter", 400);
      const v = value.startsWith("eq.") ? value.slice(3) : "";
      if (!(key === "id" ? ID : CODE).test(v)) fail("invalid filter", 400);
      q.set(key, "eq." + v);
    } else if (key === "select") {
      const fields = value.split(",");
      if (!fields.length || fields.some(c => !COLUMNS[table].includes(c))) fail("invalid selection", 400);
      q.set(key, fields.join(","));
    } else if (key === "order") {
      if (!/^[a-z_]+(?:\.(?:asc|desc))?$/.test(value) || !COLUMNS[table].includes(value.split(".")[0])) fail("invalid order", 400);
      q.set(key, value);
    } else if (key === "limit") {
      if (!/^\d{1,4}$/.test(value) || Number(value) < 1 || Number(value) > 1000) fail("invalid limit", 400);
      q.set(key, value);
    } else fail("query not allowed", 400);
  }
  if (!q.has("select")) q.set("select", COLUMNS[table].join(","));
  return q;
}
function cleanBody(table: string, body: unknown, admin: boolean, creating = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) fail("invalid body", 400);
  const source = body as Row;
  const allowed = admin ? COLUMNS[table].filter(k => !["id", "created_at", "event_code", "code"].includes(k)) : CLIENT_WRITE[table] || [];
  const result: Row = {};
  for (const key of Object.keys(source)) {
    if (creating && ["code", "event_code"].includes(key)) continue;
    if (!allowed.includes(key)) fail("field not allowed: " + key);
    const value = source[key];
    if (typeof value === "string" && value.length > 8000) fail("field too long", 400);
    result[key] = value;
  }
  if (!admin && table === "eventus_events" && result.invitation_status && !["en_diseno", "aprobada", "con_cambios"].includes(result.invitation_status)) fail("invalid status");
  if ("status" in result && !["pending", "confirmed", "cancelled"].includes(result.status)) fail("invalid guest status", 400);
  for (const k of ["companions", "num_mesas", "dur", "sort_order", "amount", "total_cost", "hours"]) {
    if (k in result && (typeof result[k] !== "number" || !Number.isFinite(result[k]) || result[k] < 0 || result[k] > 10000000)) fail("invalid number", 400);
  }
  for (const [key, min, max] of [["num_mesas", 1, 60], ["companions", 0, 100], ["dur", 1, 1440], ["sort_order", 0, 5000], ["hours", 1, 24]] as const) {
    if (key in result && (!Number.isInteger(result[key]) || result[key] < min || result[key] > max)) fail("invalid " + key, 400);
  }
  if ("mesa" in result && result.mesa !== null && (!Number.isInteger(result.mesa) || result.mesa < 1 || result.mesa > 1000)) fail("invalid table number", 400);
  for (const k of ["paid", "done", "arrived", "activated", "invitation_enabled"]) if (k in result && typeof result[k] !== "boolean") fail("invalid flag", 400);
  for (const k of ["name", "text", "note", "wa", "invitation_comments", "dress_code", "event_time"]) if (k in result && typeof result[k] !== "string") fail("invalid text", 400);
  if ("gallery" in result && (!Array.isArray(result.gallery) || result.gallery.length > 12 || result.gallery.some((url: unknown) => typeof url !== "string" || url.length > 3000))) fail("invalid gallery", 400);
  for (const k of ["photo_url", "invitation_url"]) if (k in result && (typeof result[k] !== "string" || result[k].length > 3000)) fail("invalid image locator", 400);
  for (const key of ["event_time", "time"]) if (key in result && !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(result[key])) fail("invalid time", 400);
  if ("menu_sel" in result) {
    const menu = result.menu_sel;
    if (!menu || typeof menu !== "object" || Array.isArray(menu)) fail("invalid menu", 400);
    for (const [key, value] of Object.entries(menu)) if (!["entradas", "cremas", "pollo", "cerdo", "guarniciones", "arroz"].includes(key) || typeof value !== "string" || value.length > 120) fail("invalid menu", 400);
  }
  if ("invitation_brief" in result && result.invitation_brief !== null) {
    const brief = result.invitation_brief;
    if (!brief || typeof brief !== "object" || Array.isArray(brief)) fail("invalid brief", 400);
    for (const [key, value] of Object.entries(brief)) {
      if (["photos", "reference_photos", "solo_photos", "carousel_photos"].includes(key)) {
        if (!Array.isArray(value) || value.length > 7 || value.some(url =>
          typeof url !== "string" ||
          url.length > 3000 ||
          (!/^https:\/\/[^\\s"'<>]+$/.test(url) && !/^storage:\/\/eventus-photos\/[A-Za-z0-9_-]{3,64}\/[a-f0-9]{32}\.(?:png|jpg|webp)$/i.test(url))
        )) fail("invalid brief photos", 400);
      } else if (!["song", "colors", "message", "dress_code", "event_time", "venue", "notes"].includes(key) || typeof value !== "string" || value.length > 2000) fail("invalid brief field", 400);
    }
  }
  if (!Object.keys(result).length) fail("empty update", 400);
  return result;
}
function coordinationTask(row: Row) {
  return {
    id: row.id, eventCode: row.event_code, title: row.title, assigneeRole: row.assignee_role,
    dueAt: row.due_at ?? null, status: row.status, version: row.version,
    submittedAt: row.submitted_at ?? null, completedAt: row.completed_at ?? null,
    cancelledAt: row.cancelled_at ?? null, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}
function changeRequest(row: Row) {
  return {
    id: row.id, eventCode: row.event_code, category: row.category, description: row.description,
    status: row.status, response: row.response ?? null, version: row.version,
    createdAt: row.created_at, resolvedAt: row.resolved_at ?? null, updatedAt: row.updated_at,
  };
}
function historyItem(row: Row) {
  return {
    entityType: row.task_id ? "task" : "request", action: row.action,
    fromStatus: row.from_status ?? null, toStatus: row.to_status, actorRole: row.actor_role,
    comment: row.comment ?? null, version: row.task_version ?? row.request_version,
    createdAt: row.created_at,
  };
}
function coordinationPage(body: Row) {
  const parsedLimit = Number.parseInt(String(body.limit ?? ""), 10);
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 50;
  if (body.cursor == null || body.cursor === "") return { limit, cursor: null as [string, string] | null };
  if (typeof body.cursor !== "string" || body.cursor.length > 300) fail("invalid cursor", 400);
  try {
    const cursor = JSON.parse(Buffer.from(body.cursor, "base64url").toString("utf8"));
    if (!Array.isArray(cursor) || cursor.length !== 2 || typeof cursor[0] !== "string"
        || Number.isNaN(Date.parse(cursor[0])) || typeof cursor[1] !== "string"
        || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(cursor[1])) fail("invalid cursor", 400);
    return { limit, cursor: cursor as [string, string] };
  } catch (e) {
    if ((e as { status?: number }).status) throw e;
    fail("invalid cursor", 400);
  }
}
function historyPage(body: Row) {
  const parsed = coordinationPage({ ...body, cursor: null });
  if (body.cursor == null || body.cursor === "") return { limit: parsed.limit, cursor: null as [string, string] | null };
  if (typeof body.cursor !== "string" || body.cursor.length > 300) fail("invalid cursor", 400);
  try {
    const cursor = JSON.parse(Buffer.from(body.cursor, "base64url").toString("utf8"));
    if (!Array.isArray(cursor) || cursor.length !== 2 || typeof cursor[0] !== "string"
        || Number.isNaN(Date.parse(cursor[0])) || typeof cursor[1] !== "string"
        || !/^[1-9][0-9]{0,18}$/.test(cursor[1])) fail("invalid cursor", 400);
    return { limit: parsed.limit, cursor: cursor as [string, string] };
  } catch (e) {
    if ((e as { status?: number }).status) throw e;
    fail("invalid cursor", 400);
  }
}
async function protectedHandler(action: () => Promise<Response>) {
  if (!SERVICE_KEY || !ACCESS_SECRET || !SUPABASE_URL) return j({ error: "server not configured" }, 503);
  try { return await action(); } catch (e) {
    const err = e as { status?: number; message?: string };
    return j({ error: err.status ? err.message : "operation failed" }, err.status || 500);
  }
}

export async function GET(req: Request) {
  return protectedHandler(async () => {
    const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
    const access = verify(token, "guest");
    if (!access) fail("valid invitation link required", 401);
    const url = new URL(req.url);
    if (url.searchParams.get("code") !== access.code || url.searchParams.get("guestId") !== access.guestId) fail();
    await eventExists(access.code!);
    const events = await sb("GET", "eventus_events", new URLSearchParams({ code: "eq." + access.code, select: "code,name,type,date,event_time,dress_code,invitation_url,invitation_status,photo_url,gallery" }));
    const guests = await sb("GET", "eventus_guests", new URLSearchParams({ id: "eq." + access.guestId, event_code: "eq." + access.code, select: "id,name,companions,status,mesa" }));
    if (!guests[0]) fail("invitation unavailable", 404);
    return j({ event: await privateImages(events[0], access.code!), guest: guests[0] });
  });
}
export async function PATCH(req: Request) {
  return protectedHandler(async () => {
    sameOrigin(req);
    const b = await jsonBody(req);
    const access = verify(req.headers.get("authorization")?.replace(/^Bearer /, ""), "guest");
    if (!access || b.code !== access.code || String(b.guestId) !== access.guestId) fail("valid invitation link required", 401);
    if (!["confirmed", "cancelled"].includes(b.status)) fail("invalid status", 400);
    await eventExists(access.code!);
    const rows = await sb("PATCH", "eventus_guests", new URLSearchParams({ id: "eq." + access.guestId, event_code: "eq." + access.code, select: "id" }), { status: b.status });
    if (!rows.length) fail("invitation unavailable", 404);
    return j({ ok: true });
  });
}

export async function POST(req: Request) {
  return protectedHandler(async () => {
    sameOrigin(req);
    if (req.headers.get("content-type")?.startsWith("multipart/form-data")) return upload(req);
    const b = await jsonBody(req);
    const admin = isAdmin(req);
    if (b.op === "auth") {
      await limit(req, "login", 10, 15 * 60000);
      if (!ADMIN_PW || typeof b.adminPw !== "string" || !safeEqual(b.adminPw, ADMIN_PW)) return j({ admin: false }, 401);
      return j({ admin: true }, 200, { "Set-Cookie": cookie(req, issue("admin"), ADMIN_TTL) });
    }
    if (b.op === "logout") return j({ ok: true }, 200, { "Set-Cookie": cookie(req, "", 0) });
    const access = verify(b.accessToken, "event");
    if (b.op === "access") {
      if (!access) fail("valid access link required", 401);
      await eventExists(access.code!);
      return j({ code: access.code });
    }
    if (b.op === "issue-access") {
      if (!admin || typeof b.code !== "string") fail();
      await eventExists(b.code);
      return j({ code: b.code, accessToken: issue("event", b.code) });
    }
    if (b.op === "guest-token") {
      const code = String(b.code || ""), guestId = String(b.guestId || "");
      if ((!admin && access?.code !== code) || !ID.test(guestId)) fail();
      await eventExists(code);
      const rows = await sb("GET", "eventus_guests", new URLSearchParams({ id: "eq." + guestId, event_code: "eq." + code, select: "id" }));
      if (!rows[0]) fail("guest unavailable", 404);
      return j({ token: issue("guest", code, guestId) });
    }
    if (b.op === "register") {
      await limit(req, "register", 5, 3600000);
      const body = b.body || {};
      const name = String(body.name || "").trim().slice(0, 120), phone = String(body.phone || "").replace(/\D/g, "");
      if (!name || !/^\d{10,15}$/.test(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(body.date || "") || !["xv", "boda", "graduacion"].includes(body.type)) fail("invalid registration", 400);
      const parsedDate = new Date(body.date + "T12:00:00Z");
      const now = new Date();
      const maxDate = new Date(now.getTime() + 2 * 366 * 86400000);
      if (Number.isNaN(parsedDate.getTime()) || parsedDate < new Date(now.getTime() - 30 * 86400000) || parsedDate > maxDate) fail("invalid registration", 400);
      const existing = await sb("GET", "eventus_events", new URLSearchParams({ phone: "eq." + phone, select: "code", limit: "1" }));
      if (existing.length) fail("already registered", 409);
      const code = "VV-" + randomBytes(16).toString("hex").toUpperCase();
      const row = { code, name, phone, date: body.date, type: body.type, hours: 7, total_cost: 0, contract_date: null, num_mesas: 20, menu_sel: {}, activated: false, invitation_enabled: false, invitation_status: "sin_brief", source: "self_register" };
      await sb("POST", "eventus_events", new URLSearchParams({ select: "code" }), row);
      return j({ code, accessToken: issue("event", code) }, 201);
    }
    if (b.op === "coordination-list") {
      if (!access) fail("valid access link required", 401);
      await eventExists(access.code!);
      const page = coordinationPage(b);
      const params = new URLSearchParams({
        event_code: "eq." + access.code, assignee_role: "eq.client",
        select: "id,event_code,title,assignee_role,due_at,status,version,submitted_at,completed_at,cancelled_at,created_at,updated_at",
        order: "created_at.asc,id.asc", limit: String(page.limit + 1),
      });
      if (page.cursor) params.set("or", `(created_at.gt.${page.cursor[0]},and(created_at.eq.${page.cursor[0]},id.gt.${page.cursor[1]}))`);
      const rows = await sb("GET", "event_coordination_tasks", params);
      const items = Array.isArray(rows) ? rows.slice(0, page.limit) : [];
      const last = items[items.length - 1];
      const nextCursor = Array.isArray(rows) && rows.length > page.limit
        ? Buffer.from(JSON.stringify([last.created_at, last.id])).toString("base64url") : null;
      return j({ items: items.map(coordinationTask), nextCursor });
    }
    if (b.op === "coordination-submit") {
      if (!access) fail("valid access link required", 401);
      if (typeof b.id !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(b.id)
          || !Number.isInteger(b.expectedVersion) || b.expectedVersion < 1
          || (b.comment != null && (typeof b.comment !== "string" || !b.comment.trim() || b.comment.trim().length > 1000))) {
        fail("invalid task submission", 400);
      }
      await eventExists(access.code!);
      try {
        const task = await coordinationRpc({
          p_event_code: access.code, p_operation: "submit", p_task_id: b.id,
          p_expected_version: b.expectedVersion, p_comment: b.comment?.trim() || null,
          p_actor_role: "client", p_actor_user_id: null,
        });
        return j({ task: coordinationTask(task) });
      } catch (e) {
        const err = e as { status?: number; message?: string };
        if (err.message === "version_conflict") return j({ error: "La tarea cambió; vuelve a cargarla", code: "VERSION_CONFLICT" }, 409);
        throw e;
      }
    }
    if (b.op === "change-request-list") {
      if (!access) fail("valid access link required", 401);
      await eventExists(access.code!);
      const page = coordinationPage(b);
      const params = new URLSearchParams({
        event_code: "eq." + access.code,
        select: "id,event_code,category,description,status,response,version,created_at,resolved_at,updated_at",
        order: "created_at.asc,id.asc", limit: String(page.limit + 1),
      });
      if (page.cursor) params.set("or", `(created_at.gt.${page.cursor[0]},and(created_at.eq.${page.cursor[0]},id.gt.${page.cursor[1]}))`);
      const rows = await sb("GET", "event_change_requests", params);
      const items = Array.isArray(rows) ? rows.slice(0, page.limit) : [];
      const last = items[items.length - 1];
      const nextCursor = Array.isArray(rows) && rows.length > page.limit
        ? Buffer.from(JSON.stringify([last.created_at, last.id])).toString("base64url") : null;
      return j({ items: items.map(changeRequest), nextCursor });
    }
    if (b.op === "change-request-create") {
      if (!access) fail("valid access link required", 401);
      const description = typeof b.description === "string" ? b.description.trim() : "";
      if (!["menu", "guests", "program", "other"].includes(b.category)
          || description.length < 10 || description.length > 2000
          || typeof b.idempotencyKey !== "string" || !UUID.test(b.idempotencyKey)) {
        fail("invalid change request", 400);
      }
      await eventExists(access.code!);
      const request = await changeRequestRpc({
        p_event_code: access.code, p_operation: "create", p_category: b.category,
        p_description: description, p_idempotency_key: b.idempotencyKey,
        p_actor_role: "client", p_actor_user_id: null,
      });
      return j({ request: changeRequest(request) }, 201);
    }
    if (b.op === "change-request-cancel") {
      if (!access) fail("valid access link required", 401);
      if (typeof b.id !== "string" || !UUID.test(b.id)
          || !Number.isInteger(b.expectedVersion) || b.expectedVersion < 1) {
        fail("invalid change request cancellation", 400);
      }
      await eventExists(access.code!);
      try {
        const request = await changeRequestRpc({
          p_event_code: access.code, p_operation: "cancel", p_request_id: b.id,
          p_expected_version: b.expectedVersion, p_actor_role: "client", p_actor_user_id: null,
        });
        return j({ request: changeRequest(request) });
      } catch (e) {
        const err = e as { status?: number; message?: string };
        if (err.message === "version_conflict") return j({ error: "La solicitud cambió; vuelve a cargarla", code: "VERSION_CONFLICT" }, 409);
        throw e;
      }
    }
    if (b.op === "coordination-history") {
      if (!access) fail("valid access link required", 401);
      if (!['task', 'request'].includes(b.entityType) || typeof b.id !== "string" || !UUID.test(b.id)) {
        fail("invalid history query", 400);
      }
      await eventExists(access.code!);
      const parentTable = b.entityType === "task" ? "event_coordination_tasks" : "event_change_requests";
      const parentParams = new URLSearchParams({ id: "eq." + b.id, event_code: "eq." + access.code, select: "id", limit: "1" });
      if (b.entityType === "task") parentParams.set("assignee_role", "eq.client");
      const parent = await sb("GET", parentTable, parentParams);
      if (!Array.isArray(parent) || !parent[0]) fail("history unavailable", 404);
      const page = historyPage(b);
      const key = b.entityType === "task" ? "task_id" : "request_id";
      const params = new URLSearchParams({
        event_code: "eq." + access.code, [key]: "eq." + b.id,
        select: "id,task_id,request_id,action,from_status,to_status,actor_role,comment,task_version,request_version,created_at",
        order: "created_at.asc,id.asc", limit: String(page.limit + 1),
      });
      if (page.cursor) params.set("or", `(created_at.gt.${page.cursor[0]},and(created_at.eq.${page.cursor[0]},id.gt.${page.cursor[1]}))`);
      const rows = await sb("GET", "event_coordination_history", params);
      const items = Array.isArray(rows) ? rows.slice(0, page.limit) : [];
      const last = items[items.length - 1];
      const nextCursor = Array.isArray(rows) && rows.length > page.limit
        ? Buffer.from(JSON.stringify([last.created_at, String(last.id)])).toString("base64url") : null;
      return j({ items: items.map(historyItem), nextCursor });
    }
    if (["tables-get", "table-save", "guest-seat", "program-save", "program-delete", "guest-checkin", "gallery-get"].includes(b.op)) {
      if (!admin && !access) fail("valid access link required", 401);
      const code = admin ? String(b.code || access?.code || "") : access!.code!;
      if (!CODE.test(code) || (!admin && b.code && b.code !== code)) fail("event mismatch");
      await eventExists(code);
      const integer = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
      const version = () => { if (!integer(b.expectedVersion, 1, 2147483647)) fail("invalid version", 400); };
      let data: Row = {};
      if (b.op === "table-save") {
        if (!integer(b.mesa, 1, 1000) || !integer(b.capacity, 1, 1000) || !integer(b.x, 0, 100) || !integer(b.y, 0, 100) || !integer(b.expectedVersion, 0, 2147483647)) fail("invalid table", 400);
        data = {mesa:b.mesa,capacity:b.capacity,x:b.x,y:b.y,expectedVersion:b.expectedVersion};
      }
      if (b.op === "guest-seat") {
        version();
        if (!/^[1-9][0-9]{0,9}$/.test(String(b.guestId)) || (b.mesa !== null && !integer(b.mesa,1,1000))) fail("invalid guest seat",400);
        data = {guestId:String(b.guestId),mesa:b.mesa,expectedVersion:b.expectedVersion};
      }
      if (b.op === "guest-checkin") {
        if (!admin) fail("reception requires admin",403);
        let guestId = String(b.guestId || "");
        if (b.guestToken != null) {
          const guestAccess = verify(b.guestToken,"guest");
          if (!guestAccess || guestAccess.code !== code) fail("invalid guest pass",401);
          guestId = guestAccess.guestId!;
        }
        if (!/^[1-9][0-9]{0,9}$/.test(guestId)) fail("invalid guest",400);
        data = {guestId};
      }
      if (["program-save","program-delete"].includes(b.op)) {
        if (b.id != null || b.op === "program-delete") {
          if (!/^[1-9][0-9]{0,9}$/.test(String(b.id))) fail("invalid activity",400);
          version(); data = {id:String(b.id),expectedVersion:b.expectedVersion};
        }
        if (b.op === "program-save") {
          if (typeof b.name !== "string" || !b.name.trim() || b.name.trim().length > 160 || typeof b.time !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(b.time) || !integer(b.dur,1,1440) || typeof b.note !== "string" || b.note.length > 2000 || typeof b.responsible !== "string" || b.responsible.length > 160 || !["pending","in_progress","completed"].includes(b.status) || !integer(b.dayOffset ?? 0,0,1)) fail("invalid activity",400);
          data = {...data,name:b.name.trim(),time:b.time,dur:b.dur,note:b.note,responsible:b.responsible.trim(),status:b.status,dayOffset:b.dayOffset ?? 0};
        }
      }
      if (b.op === "gallery-get") {
        let base: URL;
        try { base = new URL(process.env.EVENTUS_GALLERY_URL || "https://muro-villaverde.vercel.app"); } catch { return j({configured:false,reason:"host_unavailable"}); }
        if (base.protocol !== "https:" || base.username || base.password || base.pathname !== "/" || base.search || base.hash) return j({configured:false,reason:"host_unavailable"});
        const rows = await sb("GET","muro_config",new URLSearchParams({event_code:"eq."+code,select:"enabled,opens_at,closes_at,gallery_token",limit:"2"}));
        if (!Array.isArray(rows) || rows.length !== 1) return j({configured:false,reason:"not_configured"});
        const config=rows[0], now=Date.now();
        const windowState=!config.enabled?"deshabilitado":config.opens_at && now<Date.parse(config.opens_at)?"aun_no":config.closes_at && now>Date.parse(config.closes_at)?"cerrado":"abierto";
        return j({configured:true,windowState,uploadUrl:windowState === "abierto"?new URL("/e/"+encodeURIComponent(code),base).href:null,galleryUrl:config.enabled && typeof config.gallery_token === "string"?new URL("/galeria/"+encodeURIComponent(config.gallery_token),base).href:null});
      }
      return j(await sb("POST","rpc/eventus_experience_mutate",new URLSearchParams(),{p_event_code:code,p_operation:b.op,p_data:data}));
    }
    if (b.op !== "db") fail("invalid operation", 400);
    const table = String(b.table || ""), method = String(b.method || "GET").toUpperCase();
    if (!Object.hasOwn(COLUMNS, table) || !["GET", "POST", "PATCH", "DELETE"].includes(method)) fail("operation not allowed", 400);
    if (!admin && !access) fail("valid access link required", 401);
    const q = queryFor(table, b.query);
    const parentKey = table === "eventus_events" ? "code" : "event_code";
    if (!admin) {
      await eventExists(access!.code!);
      if (q.has(parentKey) && q.get(parentKey) !== "eq." + access!.code) fail("event mismatch");
      q.set(parentKey, "eq." + access!.code);
      if (table === "eventus_payments" && method !== "GET") fail("payments require admin");
      if (table === "eventus_events" && ["POST", "DELETE"].includes(method)) fail("event operation requires admin");
    }
    // Dedicated operations enforce versions and staff-only reception.
    if (table === "eventus_program" && method !== "GET") fail("use program operations",400);
    if (table === "eventus_guests" && ["POST","PATCH"].includes(method)) {
      const incoming = Array.isArray(b.body) ? b.body : [b.body];
      if (incoming.some((row: Row) => row && (["arrived","arrived_at","version"].some(k => k in row) || (method === "PATCH" && "mesa" in row)))) fail("use guest operations",400);
    }
    let body: unknown;
    if (["POST", "PATCH"].includes(method)) {
      if (method === "PATCH" && table !== "eventus_events" && !q.has("id")) fail("row id required", 400);
      const incoming = Array.isArray(b.body) ? b.body : [b.body];
      if (!incoming.length || incoming.length > 500 || (method === "PATCH" && incoming.length !== 1)) fail("invalid row count", 400);
      const rows = incoming.map((row: Row) => {
        const clean = cleanBody(table, row, admin, method === "POST");
        if (method === "POST") {
          const code = row[parentKey];
          if (typeof code !== "string" || !CODE.test(code) || (!admin && code !== access!.code)) fail("event mismatch");
          clean[parentKey] = code;
        }
        return clean;
      });
      body = Array.isArray(b.body) ? rows : rows[0];
    }
    if (["PATCH", "DELETE"].includes(method) && !q.has("id") && !q.has(parentKey)) fail("scope required", 400);
    // Reads and writes use the exact same event predicate; no check-then-write race.
    const rows = await sb(method, table, q, body);
    return j(method === "DELETE" ? { ok: true } : await Promise.all(rows.map((row: Row) => privateImages(row, admin ? String(row.code || row.event_code || "") : access!.code!))));
  });
}

async function upload(req: Request) {
  if (Number(req.headers.get("content-length") || 0) > 4 * 1024 * 1024) fail("file too large", 413);
  const form = await req.formData();
  const code = String(form.get("code") || ""), access = verify(form.get("accessToken"), "event");
  if (!isAdmin(req) && access?.code !== code) fail("valid access link required", 401);
  await eventExists(code);
  await limit(req, "upload", 40, 3600000);
  const file = form.get("file");
  if (!(file instanceof File) || file.size > 3 * 1024 * 1024 || file.size === 0) fail("invalid file", 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!png && !jpg && !webp) fail("use PNG, JPEG or WebP", 400);
  const ext = png ? "png" : jpg ? "jpg" : "webp", type = png ? "image/png" : jpg ? "image/jpeg" : "image/webp";
  const path = code + "/" + randomBytes(16).toString("hex") + "." + ext;
  const r = await fetch(SUPABASE_URL + "/storage/v1/object/eventus-photos/" + path, { method: "POST", headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, "Content-Type": type, "x-upsert": "false" }, body: bytes });
  if (!r.ok) fail("upload failed", 502);
  return j({ url: "storage://eventus-photos/" + path });
}
