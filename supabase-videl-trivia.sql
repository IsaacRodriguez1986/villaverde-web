-- VIDEL: isolated trivia storage. Applied after publication approval, 2026-10-09.
-- Supabase project: gfbixkddumsqlfrfbsmp; migration videl_trivia_private_ranking.
-- It does not touch Eventus/CRM tables or grant public database access.
BEGIN;

CREATE TABLE IF NOT EXISTS public.videl_trivia_results (
  participant_id UUID PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50 AND name = btrim(name)),
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 10),
  finished_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS videl_trivia_results_rank_idx
  ON public.videl_trivia_results (score DESC, finished_at ASC, participant_id ASC);

ALTER TABLE public.videl_trivia_results ENABLE ROW LEVEL SECURITY;
GRANT USAGE ON SCHEMA public TO service_role;
REVOKE ALL ON public.videl_trivia_results FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.videl_trivia_results TO service_role;
-- No anon/authenticated policies: deny-all. Service role accesses only from BFF.
-- No UPDATE/DELETE privilege: a repeated UUID never changes its first result.

CREATE OR REPLACE FUNCTION public.videl_trivia_snapshot(p_participant_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE SQL
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH ranked AS MATERIALIZED (
    SELECT participant_id, name, score,
      row_number() OVER (ORDER BY score DESC, finished_at ASC, participant_id ASC) AS rank
    FROM public.videl_trivia_results
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM ranked),
    'top20', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('rank', rank, 'name', name, 'score', score) ORDER BY rank)
      FROM ranked WHERE rank <= 20
    ), '[]'::jsonb),
    'me', (
      SELECT jsonb_build_object('rank', rank, 'name', name, 'score', score)
      FROM ranked WHERE participant_id = p_participant_id
    )
  );
$$;

REVOKE ALL ON FUNCTION public.videl_trivia_snapshot(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.videl_trivia_snapshot(UUID) TO service_role;
COMMENT ON FUNCTION public.videl_trivia_snapshot(UUID) IS
  'Videl only: complete count, top 20 and caller rank; never returns participant UUIDs.';

COMMIT;
