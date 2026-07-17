// Server-side password check for the /invitaciones gallery.
// The password used to be hardcoded in public/invitaciones.html (shipped to every
// visitor). It now lives ONLY in the INVITACIONES_PASSWORD env var (server-side).
// Compared with a constant-time check to avoid timing side-channels.

import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function j(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const expected = process.env.INVITACIONES_PASSWORD || "";
  if (!expected) {
    // Not configured on the server — fail closed.
    return j({ ok: false, error: "not_configured" }, 500);
  }

  let password: unknown;
  try {
    const body = await req.json();
    password = body?.password;
  } catch {
    return j({ ok: false }, 400);
  }

  if (typeof password !== "string") {
    return j({ ok: false }, 401);
  }

  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual throws on length mismatch, so guard length first.
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);

  return match ? j({ ok: true }, 200) : j({ ok: false }, 401);
}
