import { createHmac } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VERSION = "alina-8-v1";
const DB_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const MAX_BODY = 8192;
const QUESTIONS = [
  { id: "1", text: "¿Cuál es el color favorito de Alina?", correct: "rosa", options: [["azul", "Azul"], ["rosa", "Rosa"], ["verde", "Verde"], ["lila", "Lila"]] },
  { id: "2", text: "¿Cuál es su comida favorita?", correct: "chilaquiles", options: [["pizza", "Pizza"], ["sushi", "Sushi"], ["chilaquiles", "Chilaquiles"], ["tacos", "Tacos"]] },
  { id: "3", text: "¿Cuál es su postre favorito?", correct: "uvas", options: [["uvas", "Uvas"], ["helado", "Helado"], ["pastel", "Pastel de chocolate"], ["fresas", "Fresas"]] },
  { id: "4", text: "¿Quién es su cantante o grupo favorito?", correct: "charles-ans", options: [["billie-eilish", "Billie Eilish"], ["bad-bunny", "Bad Bunny"], ["taylor-swift", "Taylor Swift"], ["charles-ans", "Charles Ans"]] },
  { id: "5", text: "¿Cuál es su canción favorita?", correct: "visita", options: [["enchanted", "Enchanted (Taylor Swift)"], ["visita", "Visita (Enjambre)"], ["perfect", "Perfect (Ed Sheeran)"], ["rosa-pastel", "Rosa pastel (Belanova)"]] },
  { id: "7", text: "¿Qué le gusta hacer en su tiempo libre?", correct: "videos", options: [["leer", "Leer"], ["bailar", "Bailar"], ["videos", "Ver videos"], ["dibujar", "Dibujar"]] },
  { id: "8", text: "¿Cuál es su animal favorito?", correct: "cerditos", options: [["cerditos", "Cerditos"], ["gatitos", "Gatitos"], ["perritos", "Perritos"], ["conejos", "Conejos"]] },
  { id: "9", text: "¿Qué país le gustaría conocer?", correct: "suiza", options: [["japon", "Japón"], ["italia", "Italia"], ["canada", "Canadá"], ["suiza", "Suiza"]] },
] as const;

class TriviaError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
function fail(message: string, status: number): never { throw new TriviaError(message, status); }
function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" } });
}
function errorResponse(error: unknown) {
  return error instanceof TriviaError ? json({ error: error.message }, error.status) : json({ error: "La trivia no está disponible por el momento. Inténtalo de nuevo." }, 503);
}
async function rpc(name: string, body: unknown): Promise<any> {
  if (!DB_URL || !SERVICE_KEY) fail("La trivia no está disponible por el momento. Inténtalo de nuevo.", 503);
  const response = await fetch(DB_URL + "/rest/v1/rpc/" + name, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(8000),
    headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    if (data?.code === "23505" && data?.message === "attempt_conflict") fail("Este intento ya tiene un resultado guardado.", 409);
    fail("No pudimos guardar o consultar el marcador. Inténtalo de nuevo.", 503);
  }
  return data;
}
function board(data: any) {
  if (!data || !Array.isArray(data.leaderboard) || !Number.isSafeInteger(data.totalPlayers) || data.totalPlayers < 0) fail("No pudimos consultar el marcador. Inténtalo de nuevo.", 503);
  return { leaderboard: data.leaderboard.map((row: any) => ({ name: row.name, score: row.score, rank: row.rank })), totalPlayers: data.totalPlayers };
}
export async function GET() {
  try {
    const current = board(await rpc("alina_trivia_board", { p_quiz_version: VERSION }));
    return json({ version: VERSION, pointsPerCorrect: 100, questions: QUESTIONS.map(q => ({ id: q.id, text: q.text, options: q.options.map(([id, text]) => ({ id, text })) })), ...current });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") fail("Abre la trivia desde la invitación.", 403);
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) fail("La solicitud debe ser JSON.", 415);
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY) fail("La solicitud es demasiado grande.", 413);
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY) fail("La solicitud es demasiado grande.", 413);
    let input: any;
    try { input = JSON.parse(raw); } catch { fail("No pudimos leer tus respuestas.", 400); }
    if (!input || typeof input !== "object" || Array.isArray(input)) fail("No pudimos leer tus respuestas.", 400);
    if (input.version !== VERSION || typeof input.attemptId !== "string" || !UUID.test(input.attemptId)) fail("Actualiza la invitación para jugar esta trivia.", 400);
    if (typeof input.name !== "string" || /[\x00-\x1f\x7f<>]/.test(input.name)) fail("Escribe un nombre o apodo de 2 a 32 caracteres.", 400);
    const name = input.name.trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 32) fail("Escribe un nombre o apodo de 2 a 32 caracteres.", 400);
    if (!Array.isArray(input.answers) || input.answers.length !== QUESTIONS.length) fail("Responde las ocho preguntas para ver tu resultado.", 400);
    const byId = new Map<string, string>();
    for (const answer of input.answers) {
      if (!answer || typeof answer.questionId !== "string" || typeof answer.optionId !== "string" || byId.has(answer.questionId)) fail("Revisa tus respuestas e inténtalo de nuevo.", 400);
      const question = QUESTIONS.find(q => q.id === answer.questionId);
      if (!question || !question.options.some(([id]) => id === answer.optionId)) fail("Revisa tus respuestas e inténtalo de nuevo.", 400);
      byId.set(answer.questionId, answer.optionId);
    }
    const answers = QUESTIONS.map(q => ({ questionId: q.id, optionId: byId.get(q.id)! }));
    const correctCount = QUESTIONS.filter(q => byId.get(q.id) === q.correct).length;
    // Use the shared database limiter, so this also holds across serverless instances.
    const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") || "unknown" : "local";
    const key = "alina-trivia:" + createHmac("sha256", SERVICE_KEY).update(ip).digest("hex");
    if (await rpc("check_rate_limit", { p_key: key, p_max: 10, p_window_seconds: 600 }) !== true) fail("Has hecho varios intentos. Espera unos minutos e inténtalo de nuevo.", 429);
    const data = await rpc("alina_trivia_submit", { p_attempt_id: input.attemptId, p_quiz_version: VERSION, p_name: name, p_answers: answers, p_score: correctCount * 100, p_correct_count: correctCount });
    if (!data?.result || !Number.isInteger(data.result.score) || !Number.isInteger(data.result.rank)) fail("No pudimos confirmar tu resultado. Inténtalo de nuevo.", 503);
    return json({ version: VERSION, result: data.result, ...board(data) });
  } catch (error) { return errorResponse(error); }
}
