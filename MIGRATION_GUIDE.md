# Database Migration Guide

This guide will help you apply the new database schema to add Goals, Habits, Streaks, Music, and enhanced features.

## Step 1: Backup Your Current Database (Important!)

Before running any migrations, backup your data:

1. Go to your Supabase Dashboard
2. Navigate to Database → Backups
3. Create a manual backup or download your data

## Step 2: Run the Migration

### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Open the file `002_enhanced_features.sql` from your project root
5. Copy the entire contents of the file
6. Paste it into the SQL Editor
7. Click **"Run"** or press `Ctrl+Enter`

### Option B: Using Supabase CLI (If you have it installed)

```bash
# Make sure you're in the project directory
cd c:\Users\Masoke\Downloads\dev_app\daily-time-tracker

# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Step 3: Verify the Migration

After running the migration, verify that everything worked:

1. In Supabase Dashboard, go to **Database → Tables**
2. You should now see these new tables:
   - `goals`
   - `habits`
   - `habit_completions`
   - `streaks`
   - `time_entries`
   - `music_tracks`
   - `playlists`
   - `playlist_tracks`
   - `notes` (if it didn't exist before)

3. Check that existing tables have been updated:
   - `tasks` should have new columns: `goal_id`, `task_type`, `priority`, `is_template`, etc.

## Step 4: Test Row Level Security

To verify RLS is working:

1. Go to **Authentication → Users** in Supabase Dashboard
2. Note your user ID (or create a test user)
3. Go to **SQL Editor**
4. Run a test query:

```sql
-- This should return your goals (empty at first, which is fine)
SELECT * FROM goals WHERE user_id = auth.uid();

-- This should work (insert a test goal)
INSERT INTO goals (user_id, title, description)
VALUES (auth.uid(), 'Test Goal', 'This is a test');

-- Verify it was created
SELECT * FROM goals WHERE user_id = auth.uid();
```

## Step 5: Optional - Add Default Music Tracks

If you want to seed some default music tracks:

1. First, upload some MP3 files to Supabase Storage:
   - Go to **Storage** in Supabase Dashboard
   - Create a bucket called `music` (make it public if you want)
   - Upload your audio files

2. Get the public URLs of the uploaded files

3. Run this SQL (modify with your actual URLs):

```sql
INSERT INTO public.music_tracks (user_id, title, artist, duration, file_url, artwork_url, category, energy_level, is_public, source_type)
VALUES
  (null, 'Deep Focus Flow', 'System', 1800, 'https://your-project.supabase.co/storage/v1/object/public/music/deep-focus-1.mp3', null, 'deep-work', 'low', true, 'upload'),
  (null, 'Creative Vibes', 'System', 2400, 'https://your-project.supabase.co/storage/v1/object/public/music/creative-1.mp3', null, 'creative', 'medium', true, 'upload')
ON CONFLICT DO NOTHING;
```

## Step 6: Update Environment Variables (If Needed)

Make sure your `.env.local` file has these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### Error: "relation already exists"

This is fine! It means some tables already existed. The migration uses `IF NOT EXISTS` so it won't overwrite existing tables.

### Error: "column already exists"

This is also fine! The migration uses `ADD COLUMN IF NOT EXISTS` for the tasks table enhancements.

### Error: "permission denied"

Make sure you're running the SQL as the database owner/admin. In Supabase Dashboard, this should happen automatically.

### RLS Policies Not Working

1. Make sure RLS is enabled: `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;`
2. Check that policies exist: Go to Database → Tables → [TableName] → Policies
3. Verify you're authenticated when testing queries

## Next Steps

After the migration is complete:

1. Restart your Next.js development server
2. The frontend code will now be able to use the new features
3. Test creating a goal, adding tasks to it, and tracking progress

## Need Help?

If you encounter any issues:

1. Check the Supabase Dashboard logs (Database → Logs)
2. Verify your SQL syntax in the SQL Editor
3. Make sure your tables don't have conflicting data
4. Contact support or check the Supabase documentation

---

**You're ready to go!** 🚀

Once the migration is complete, come back and we'll continue implementing the frontend features.
