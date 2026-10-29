-- One row per signed-in user holding their dashboard data.
create table if not exists public.user_finances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bills jsonb not null default '[]'::jsonb,
  income numeric not null default 0,
  variables jsonb not null default '[]'::jsonb,
  subs jsonb not null default '[]'::jsonb,
  savings_rate numeric not null default 20,
  updated_at timestamptz not null default now()
);

alter table public.user_finances enable row level security;

-- Each user can only see and change their own row.
create policy "Users read own finances"
  on public.user_finances for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users insert own finances"
  on public.user_finances for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update own finances"
  on public.user_finances for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete own finances"
  on public.user_finances for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.touch_user_finances_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_finances_updated_at
  before update on public.user_finances
  for each row execute function public.touch_user_finances_updated_at();
