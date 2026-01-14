-- Enhanced Features Migration
-- This migration adds: Goals, Habits, Streaks, Time Entries, Music System, and Notes

-- =============================================================================
-- NOTES TABLE (if not exists)
-- =============================================================================

create table if not exists public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  content text not null default '',
  color text not null default '#ffffff',
  is_pinned boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================================================
-- GOALS TABLE
-- =============================================================================

create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  target_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  color text not null default '#f59e0b',
  icon text not null default 'Target',
  progress_percentage numeric(5,2) not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================================================
-- ENHANCED TASKS TABLE
-- =============================================================================

-- Add new columns to existing tasks table
alter table public.tasks
  add column if not exists goal_id uuid references public.goals(id) on delete cascade,
  add column if not exists task_type text default 'one-time' check (task_type in ('one-time', 'recurring', 'habit')),
  add column if not exists recurrence_rule jsonb,
  add column if not exists estimated_duration integer, -- minutes
  add column if not exists actual_duration integer default 0, -- seconds (keeps existing duration field)
  add column if not exists priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  add column if not exists is_template boolean default false,
  add column if not exists template_name text,
  add column if not exists tags text[],
  add column if not exists completed_at timestamp with time zone;

-- Update status check constraint to include more states
alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check check (status in ('todo', 'idle', 'in-progress', 'running', 'completed', 'cancelled'));

-- Make category_id nullable (tasks can exist without category)
alter table public.tasks alter column category_id drop not null;

-- =============================================================================
-- TIME ENTRIES TABLE
-- =============================================================================

create table if not exists public.time_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete cascade,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  duration integer, -- seconds, calculated on end
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================================================
-- HABITS TABLE
-- =============================================================================

create table if not exists public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade,
  name text not null,
  description text,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  target_count integer not null default 1,
  icon text default 'CheckCircle',
  color text default '#10b981',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.habit_completions (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  completed_at date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, completed_at)
);

-- =============================================================================
-- STREAKS TABLE
-- =============================================================================

create table if not exists public.streaks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade,
  habit_id uuid references public.habits(id) on delete cascade,
  streak_type text not null check (streak_type in ('goal', 'habit', 'focus', 'general')),
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================================================
-- MUSIC SYSTEM TABLES
-- =============================================================================

create table if not exists public.music_tracks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade, -- null for system tracks
  title text not null,
  artist text,
  album text,
  duration integer not null, -- seconds
  file_url text not null, -- Supabase Storage URL or YouTube URL
  artwork_url text,
  source_type text not null default 'upload' check (source_type in ('upload', 'youtube', 'soundcloud', 'spotify')),
  source_id text, -- external ID for streaming services
  category text, -- 'deep-work', 'creative', 'exercise', etc.
  bpm integer,
  energy_level text check (energy_level in ('low', 'medium', 'high')),
  is_public boolean default false,
  play_count integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.playlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_id uuid references public.goals(id) on delete cascade,
  name text not null,
  description text,
  is_dynamic boolean default false, -- auto-generated based on rules
  generation_rules jsonb, -- { categories: ['deep-work'], bpm: { min: 80 } }
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.playlist_tracks (
  id uuid primary key default uuid_generate_v4(),
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  track_id uuid references public.music_tracks(id) on delete cascade not null,
  position integer not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(playlist_id, track_id)
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

alter table public.notes enable row level security;
alter table public.goals enable row level security;
alter table public.time_entries enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.streaks enable row level security;
alter table public.music_tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - NOTES
-- =============================================================================

create policy "Users can view their own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - GOALS
-- =============================================================================

create policy "Users can view their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - TIME ENTRIES
-- =============================================================================

create policy "Users can view their own time entries"
  on public.time_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own time entries"
  on public.time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own time entries"
  on public.time_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own time entries"
  on public.time_entries for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - HABITS
-- =============================================================================

create policy "Users can view their own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Users can delete their own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

create policy "Users can view their own habit completions"
  on public.habit_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habit completions"
  on public.habit_completions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own habit completions"
  on public.habit_completions for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - STREAKS
-- =============================================================================

create policy "Users can view their own streaks"
  on public.streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own streaks"
  on public.streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own streaks"
  on public.streaks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own streaks"
  on public.streaks for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - MUSIC
-- =============================================================================

-- Music tracks can be viewed by owner or if public
create policy "Users can view their own music tracks"
  on public.music_tracks for select
  using (auth.uid() = user_id or is_public = true or user_id is null);

create policy "Users can insert their own music tracks"
  on public.music_tracks for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update their own music tracks"
  on public.music_tracks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own music tracks"
  on public.music_tracks for delete
  using (auth.uid() = user_id);

-- Playlists
create policy "Users can view their own playlists"
  on public.playlists for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own playlists"
  on public.playlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own playlists"
  on public.playlists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own playlists"
  on public.playlists for delete
  using (auth.uid() = user_id);

-- Playlist tracks inherit playlist permissions
create policy "Users can view playlist tracks if they can view the playlist"
  on public.playlist_tracks for select
  using (
    exists (
      select 1 from public.playlists
      where playlists.id = playlist_tracks.playlist_id
      and (playlists.user_id = auth.uid() or playlists.is_public = true)
    )
  );

create policy "Users can manage tracks in their own playlists"
  on public.playlist_tracks for all
  using (
    exists (
      select 1 from public.playlists
      where playlists.id = playlist_tracks.playlist_id
      and playlists.user_id = auth.uid()
    )
  );

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- Goals indexes
create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_goals_status on public.goals(status);
create index if not exists idx_goals_target_date on public.goals(target_date);

-- Tasks indexes (additional)
create index if not exists idx_tasks_goal_id on public.tasks(goal_id);
create index if not exists idx_tasks_task_type on public.tasks(task_type);
create index if not exists idx_tasks_is_template on public.tasks(is_template) where is_template = true;
create index if not exists idx_tasks_completed_at on public.tasks(completed_at);

-- Time entries indexes
create index if not exists idx_time_entries_user_id on public.time_entries(user_id);
create index if not exists idx_time_entries_task_id on public.time_entries(task_id);
create index if not exists idx_time_entries_goal_id on public.time_entries(goal_id);
create index if not exists idx_time_entries_start_time on public.time_entries(start_time);

-- Habits indexes
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habits_goal_id on public.habits(goal_id);
create index if not exists idx_habit_completions_habit_id on public.habit_completions(habit_id);
create index if not exists idx_habit_completions_completed_at on public.habit_completions(completed_at);
create index if not exists idx_habit_completions_user_id on public.habit_completions(user_id);

-- Streaks indexes
create index if not exists idx_streaks_user_id on public.streaks(user_id);
create index if not exists idx_streaks_goal_id on public.streaks(goal_id);
create index if not exists idx_streaks_habit_id on public.streaks(habit_id);
create index if not exists idx_streaks_type on public.streaks(streak_type);

-- Music indexes
create index if not exists idx_music_tracks_user_id on public.music_tracks(user_id);
create index if not exists idx_music_tracks_category on public.music_tracks(category);
create index if not exists idx_music_tracks_source_type on public.music_tracks(source_type);
create index if not exists idx_music_tracks_is_public on public.music_tracks(is_public) where is_public = true;
create index if not exists idx_playlists_user_id on public.playlists(user_id);
create index if not exists idx_playlists_goal_id on public.playlists(goal_id);
create index if not exists idx_playlist_tracks_playlist_id on public.playlist_tracks(playlist_id);
create index if not exists idx_playlist_tracks_track_id on public.playlist_tracks(track_id);

-- Notes indexes
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_category_id on public.notes(category_id);
create index if not exists idx_notes_is_pinned on public.notes(is_pinned) where is_pinned = true;
create index if not exists idx_notes_updated_at on public.notes(updated_at);

-- =============================================================================
-- DATABASE FUNCTIONS
-- =============================================================================

-- Function to calculate goal progress based on completed tasks
create or replace function calculate_goal_progress(goal_uuid uuid)
returns numeric
language plpgsql
as $$
declare
  total_tasks integer;
  completed_tasks integer;
  progress numeric;
begin
  select count(*) into total_tasks
  from public.tasks
  where goal_id = goal_uuid;

  if total_tasks = 0 then
    return 0;
  end if;

  select count(*) into completed_tasks
  from public.tasks
  where goal_id = goal_uuid and status = 'completed';

  progress := (completed_tasks::numeric / total_tasks::numeric) * 100;
  return round(progress, 2);
end;
$$;

-- Function to update goal progress (called by trigger)
create or replace function update_goal_progress()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' or TG_OP = 'DELETE' then
    update public.goals
    set
      progress_percentage = calculate_goal_progress(
        case
          when TG_OP = 'DELETE' then OLD.goal_id
          else NEW.goal_id
        end
      ),
      updated_at = now()
    where id = case
      when TG_OP = 'DELETE' then OLD.goal_id
      else NEW.goal_id
    end;
  end if;

  return null;
end;
$$;

-- Trigger to automatically update goal progress when tasks change
drop trigger if exists trigger_update_goal_progress on public.tasks;
create trigger trigger_update_goal_progress
  after insert or update or delete on public.tasks
  for each row
  when (
    (TG_OP = 'DELETE' and OLD.goal_id is not null) or
    (TG_OP != 'DELETE' and NEW.goal_id is not null)
  )
  execute function update_goal_progress();

-- Function to calculate habit streak
create or replace function calculate_habit_streak(habit_uuid uuid)
returns table (current_streak integer, longest_streak integer)
language plpgsql
as $$
declare
  completion_dates date[];
  streak integer := 0;
  max_streak integer := 0;
  prev_date date;
  curr_date date;
  i integer;
begin
  -- Get all completion dates for this habit, sorted desc
  select array_agg(completed_at order by completed_at desc)
  into completion_dates
  from public.habit_completions
  where habit_id = habit_uuid;

  if array_length(completion_dates, 1) is null then
    return query select 0, 0;
    return;
  end if;

  -- Calculate current streak
  prev_date := current_date;
  for i in 1..array_length(completion_dates, 1) loop
    curr_date := completion_dates[i];
    if curr_date = prev_date or curr_date = prev_date - 1 then
      streak := streak + 1;
      max_streak := greatest(max_streak, streak);
      prev_date := curr_date;
    else
      exit; -- Break current streak
    end if;
  end loop;

  -- Calculate longest streak
  streak := 0;
  prev_date := null;
  for i in 1..array_length(completion_dates, 1) loop
    curr_date := completion_dates[i];
    if prev_date is null or curr_date = prev_date - 1 then
      streak := streak + 1;
      max_streak := greatest(max_streak, streak);
    else
      streak := 1;
    end if;
    prev_date := curr_date;
  end loop;

  return query select
    case when completion_dates[1] >= current_date - 1 then streak else 0 end as current_streak,
    max_streak as longest_streak;
end;
$$;

-- Function to update habit streak in streaks table
create or replace function update_habit_streak()
returns trigger
language plpgsql
as $$
declare
  streak_data record;
  streak_record record;
begin
  -- Calculate new streak
  select * into streak_data from calculate_habit_streak(NEW.habit_id);

  -- Check if streak record exists
  select * into streak_record from public.streaks
  where habit_id = NEW.habit_id and streak_type = 'habit';

  if streak_record is null then
    -- Insert new streak record
    insert into public.streaks (user_id, habit_id, streak_type, current_streak, longest_streak, last_activity_date)
    select user_id, NEW.habit_id, 'habit', streak_data.current_streak, streak_data.longest_streak, NEW.completed_at
    from public.habits where id = NEW.habit_id;
  else
    -- Update existing streak record
    update public.streaks
    set
      current_streak = streak_data.current_streak,
      longest_streak = streak_data.longest_streak,
      last_activity_date = NEW.completed_at,
      updated_at = now()
    where habit_id = NEW.habit_id and streak_type = 'habit';
  end if;

  return NEW;
end;
$$;

-- Trigger to update habit streaks
drop trigger if exists trigger_update_habit_streak on public.habit_completions;
create trigger trigger_update_habit_streak
  after insert on public.habit_completions
  for each row
  execute function update_habit_streak();

-- Function to update timestamps
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

-- Apply updated_at triggers to all tables
drop trigger if exists set_updated_at on public.goals;
create trigger set_updated_at before update on public.goals
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at before update on public.tasks
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.time_entries;
create trigger set_updated_at before update on public.time_entries
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.habits;
create trigger set_updated_at before update on public.habits
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.streaks;
create trigger set_updated_at before update on public.streaks
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.music_tracks;
create trigger set_updated_at before update on public.music_tracks
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.playlists;
create trigger set_updated_at before update on public.playlists
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.notes;
create trigger set_updated_at before update on public.notes
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();

-- =============================================================================
-- SEED DATA - Default System Music Tracks (optional)
-- =============================================================================

-- Insert some default focus music categories as examples
-- Users can add their own tracks later
-- Note: file_urls would need to point to actual audio files in Supabase Storage

-- This is commented out as it requires actual audio files to be uploaded first
-- Uncomment and modify after uploading default music files

/*
insert into public.music_tracks (user_id, title, artist, duration, file_url, artwork_url, category, energy_level, is_public)
values
  (null, 'Deep Focus Flow', 'System', 1800, '/music/deep-focus-1.mp3', '/music/artwork/deep-focus.jpg', 'deep-work', 'low', true),
  (null, 'Creative Vibes', 'System', 2400, '/music/creative-1.mp3', '/music/artwork/creative.jpg', 'creative', 'medium', true),
  (null, 'High Energy Workout', 'System', 1200, '/music/exercise-1.mp3', '/music/artwork/exercise.jpg', 'exercise', 'high', true),
  (null, 'Calm Ambient', 'System', 3000, '/music/ambient-1.mp3', '/music/artwork/ambient.jpg', 'relax', 'low', true)
on conflict do nothing;
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- After running this migration:
-- 1. Upload default music files to Supabase Storage (optional)
-- 2. Update the seed data section above with correct file URLs
-- 3. Run the seed data insert statements
-- 4. Test RLS policies by querying as different users
-- 5. Verify triggers are working by creating/updating records
