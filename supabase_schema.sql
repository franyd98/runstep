-- ================================================
-- RunStep — Schema SQL
-- Ejecutar en Supabase > SQL Editor > New query
-- ================================================

-- 1. Profiles
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  name          text not null,
  age           int,
  weight        numeric,
  height        numeric,
  sex           text check (sex in ('male','female')),
  level         text check (level in ('beginner','intermediate','advanced')),
  goal          text check (goal in ('weight_loss','complete_5k','habit','race')),
  days_per_week int default 3,
  onboarding_done boolean default false,
  created_at    timestamptz default now()
);

-- 2. Runs
create table if not exists public.runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        date not null,
  type        text check (type in ('easy','tempo','interval','fartlek','long','recovery')) not null,
  distance    numeric not null,
  duration    int not null,
  hr_avg      int,
  hr_max      int,
  elevation   int,
  cadence     int,
  notes       text,
  created_at  timestamptz default now()
);

-- 3. Training plan
create table if not exists public.training_plan (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  week              int not null,
  day               text not null,
  type              text not null,
  description       text,
  target_distance   numeric,
  target_duration   int,
  completed         boolean default false,
  created_at        timestamptz default now()
);

-- ================================================
-- Row Level Security (RLS) — cada usuario solo ve sus datos
-- ================================================

alter table public.profiles enable row level security;
alter table public.runs enable row level security;
alter table public.training_plan enable row level security;

-- Profiles
create policy "Users can manage own profile"
  on public.profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Runs
create policy "Users can manage own runs"
  on public.runs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Training plan
create policy "Users can manage own plan"
  on public.training_plan for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
