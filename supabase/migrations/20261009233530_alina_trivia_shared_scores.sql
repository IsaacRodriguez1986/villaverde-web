-- Isolated invitation game: no access to CRM guests, leads, or event records.
create table public.alina_trivia_results (
  attempt_id uuid primary key,
  quiz_version text not null check (quiz_version = 'alina-8-v1'),
  name text not null check (char_length(name) between 2 and 32),
  answers jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) = 8),
  score integer not null check (score between 0 and 800 and score % 100 = 0),
  correct_count integer not null check (correct_count between 0 and 8 and score = correct_count * 100),
  created_at timestamptz not null default now()
);
create index alina_trivia_ranking on public.alina_trivia_results (quiz_version, score desc, created_at, attempt_id);
alter table public.alina_trivia_results enable row level security;
revoke all on table public.alina_trivia_results from public, anon, authenticated;
grant select, insert on table public.alina_trivia_results to service_role;

create function public.alina_trivia_board(p_quiz_version text)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  with ranked as (
    select name, score, created_at, attempt_id,
      rank() over (order by score desc) as place
    from public.alina_trivia_results where quiz_version = p_quiz_version
  ), leaders as (
    select name, score, place, created_at, attempt_id from ranked
    order by score desc, created_at, attempt_id limit 20
  )
  select jsonb_build_object(
    'totalPlayers', (select count(*) from ranked),
    'leaderboard', coalesce((select jsonb_agg(jsonb_build_object('name', name, 'score', score, 'rank', place)
      order by score desc, created_at, attempt_id) from leaders), '[]'::jsonb)
  );
$$;
revoke all on function public.alina_trivia_board(text) from public, anon, authenticated;
grant execute on function public.alina_trivia_board(text) to service_role;

create function public.alina_trivia_submit(
  p_attempt_id uuid, p_quiz_version text, p_name text, p_answers jsonb,
  p_score integer, p_correct_count integer
)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare
  saved public.alina_trivia_results%rowtype;
begin
  insert into public.alina_trivia_results (attempt_id, quiz_version, name, answers, score, correct_count)
    values (p_attempt_id, p_quiz_version, p_name, p_answers, p_score, p_correct_count)
    on conflict (attempt_id) do nothing;
  select * into strict saved from public.alina_trivia_results where attempt_id = p_attempt_id;
  if saved.quiz_version <> p_quiz_version or saved.name <> p_name or saved.answers <> p_answers
     or saved.score <> p_score or saved.correct_count <> p_correct_count then
    raise exception using errcode = '23505', message = 'attempt_conflict';
  end if;
  -- Compute personal rank and board in one statement/snapshot, including concurrent submissions.
  return public.alina_trivia_board(p_quiz_version) || jsonb_build_object('result',
    jsonb_build_object('name', saved.name, 'score', saved.score, 'correctCount', saved.correct_count,
      'totalQuestions', 8, 'rank', (select count(*) + 1 from public.alina_trivia_results
        where quiz_version = p_quiz_version and score > saved.score)));
end;
$$;
revoke all on function public.alina_trivia_submit(uuid, text, text, jsonb, integer, integer) from public, anon, authenticated;
grant execute on function public.alina_trivia_submit(uuid, text, text, jsonb, integer, integer) to service_role;
