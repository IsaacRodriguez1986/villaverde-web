import { createTriviaHandlers } from "@/lib/videl-trivia.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Up to 4 seconds of body input plus two bounded 8-second REST calls.
export const maxDuration = 25;

const handlers = createTriviaHandlers();

export async function GET(request: Request) {
  return handlers.GET(request);
}

export async function POST(request: Request) {
  return handlers.POST(request);
}
