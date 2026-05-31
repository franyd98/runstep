-- Ejecutar en Supabase > SQL Editor

-- 1. Nuevas columnas en runs
alter table public.runs add column if not exists strava_id bigint unique;
alter table public.runs add column if not exists polyline text;

-- 2. Tabla tokens de Strava
create table if not exists public.strava_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  athlete_id    bigint,
  access_token  text,
  refresh_token text,
  expires_at    bigint,
  created_at    timestamptz default now()
);

alter table public.strava_tokens enable row level security;

create policy "Users manage own strava tokens"
  on public.strava_tokens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
