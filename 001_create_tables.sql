-- Enable UUID extension (The only tables that in the database soo far)
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create coffee_entries table
create table if not exists public.coffee_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_name text not null,
  category text not null default 'Work',
  duration integer not null default 0,
  status text not null default 'stopped',
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.coffee_entries enable row level security;

-- RLS policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS policies for coffee_entries
create policy "Users can view their own entries"
  on public.coffee_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on public.coffee_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.coffee_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.coffee_entries for delete
  using (auth.uid() = user_id);

-- Create function to handle new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


  -- ADDITIONAL FEATURES
  ------------------------------------------------------------------------------------------
  ------------------------------------------------------------------------------------------
  ------------------------------------------------------------------------------------------

  -- Categories table (referenced in the app but missing from schema)
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#f59e0b',
  icon text not null default 'Coffee',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table (the app uses 'tasks' but your schema has 'coffee_entries')
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'idle', -- 'idle', 'running', 'completed'
  duration integer not null default 0, -- in seconds
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for new tables
alter table public.categories enable row level security;
alter table public.tasks enable row level security;

-- RLS policies for categories
create policy "Users can view their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- RLS policies for tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Create default categories for new users
create or replace function public.create_default_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, color, icon)
  values
    (new.id, 'Work', '#f59e0b', 'Briefcase'),
    (new.id, 'Study', '#3b82f6', 'BookOpen'),
    (new.id, 'Exercise', '#10b981', 'Dumbbell'),
    (new.id, 'Personal', '#8b5cf6', 'Coffee')
  on conflict do nothing;

  return new;
end;
$$;

-- Trigger to create default categories
drop trigger if exists on_user_create_categories on auth.users;

create trigger on_user_create_categories
  after insert on auth.users
  for each row
  execute function public.create_default_categories();

-- Add indexes for performance
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_category_id on public.tasks(category_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_created_at on public.tasks(created_at);
create index if not exists idx_coffee_entries_user_id on public.coffee_entries(user_id);

-- Optional: Migration function to convert coffee_entries to tasks
-- Run this if you want to preserve existing data
create or replace function migrate_coffee_entries_to_tasks()
returns void
language plpgsql
as $$
declare
  entry record;
  cat_id uuid;
begin
  for entry in select * from public.coffee_entries loop
    -- Find or create category
    select id into cat_id
    from public.categories
    where user_id = entry.user_id and name = entry.category
    limit 1;

    if cat_id is null then
      insert into public.categories (user_id, name, color, icon)
      values (entry.user_id, entry.category, '#f59e0b', 'Coffee')
      returning id into cat_id;
    end if;

    -- Insert into tasks
    insert into public.tasks (
      id, user_id, category_id, title, status, duration,
      start_time, end_time, created_at, updated_at
    )
    values (
      entry.id, entry.user_id, cat_id, entry.task_name, entry.status,
      entry.duration, entry.start_time, entry.end_time,
      entry.created_at, entry.updated_at
    )
    on conflict (id) do nothing;
  end loop;
end;
$$;

-- Uncomment to run migration:
-- select migrate_coffee_entries_to_tasks();
