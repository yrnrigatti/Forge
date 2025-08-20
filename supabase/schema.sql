-- USERS (auth handled by Supabase)
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text,
  type text,
  notes text,
  created_at timestamp default now()
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamp default now()
);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts (id) on delete cascade,
  exercise_id uuid references exercises (id) on delete cascade,
  "order" int
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  workout_id uuid references workouts (id),
  date timestamp default now()
);

create table if not exists sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id) on delete cascade,
  exercise_id uuid references exercises (id),
  reps int,
  weight numeric,
  notes text
);
