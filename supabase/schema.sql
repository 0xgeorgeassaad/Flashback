create table if not exists public.saved_movies (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null,
  watched boolean not null default false,
  saved_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

create table if not exists public.taste_selections (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null,
  selected_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

create table if not exists public.recommendation_sessions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  selected_movie_ids bigint[] not null,
  selected_movies jsonb,
  recommendations jsonb not null,
  primary key (user_id, id)
);

create index if not exists saved_movies_user_saved_at_idx
  on public.saved_movies (user_id, saved_at desc);

create index if not exists taste_selections_user_selected_at_idx
  on public.taste_selections (user_id, selected_at asc);

create index if not exists recommendation_sessions_user_created_at_idx
  on public.recommendation_sessions (user_id, created_at desc);

alter table public.saved_movies enable row level security;
alter table public.taste_selections enable row level security;
alter table public.recommendation_sessions enable row level security;

grant select, insert, update, delete on public.saved_movies to authenticated;
grant select, insert, update, delete on public.taste_selections to authenticated;
grant select, insert, update, delete on public.recommendation_sessions to authenticated;

drop policy if exists "Users manage their saved movies" on public.saved_movies;
create policy "Users manage their saved movies"
  on public.saved_movies
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their taste selections" on public.taste_selections;
create policy "Users manage their taste selections"
  on public.taste_selections
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage their recommendation sessions" on public.recommendation_sessions;
create policy "Users manage their recommendation sessions"
  on public.recommendation_sessions
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
