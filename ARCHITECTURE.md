# Coffee Time Tracker - System Architecture

> **Version:** 2.0
> **Last Updated:** January 2026
> **Status:** Comprehensive Redesign & Enhancement

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Goals](#vision--goals)
3. [System Overview](#system-overview)
4. [Architecture Diagrams](#architecture-diagrams)
5. [Technology Stack](#technology-stack)
6. [Data Architecture](#data-architecture)
7. [API Layer Design](#api-layer-design)
8. [Feature Modules](#feature-modules)
9. [UI/UX Architecture](#uiux-architecture)
10. [Security & Authentication](#security--authentication)
11. [Performance & Scalability](#performance--scalability)
12. [Mobile Strategy](#mobile-strategy)
13. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**Coffee Time Tracker** is transforming from a basic time-tracking application into a **comprehensive, beautiful, all-in-one productivity suite** that combines:

- **Goal-Oriented Task Management** - Hierarchical goals with nested tasks and habits
- **Intelligent Time Tracking** - Automatic tracking, focus sessions, and productivity insights
- **Dynamic Focus Music** - Context-aware music that adapts to your goals and activities
- **Beautiful, Elegant UI** - Modern, stunning design that inspires productivity
- **Cross-Platform Experience** - Web-first architecture ready for mobile expansion

The application will feature an **API-first architecture**, separating the frontend from a robust backend that can power both web and future mobile applications.

---

## Vision & Goals

### Core Vision
Create the **most beautiful and comprehensive productivity application** that helps users achieve their goals through an integrated system of task management, time tracking, focus music, and insightful analytics.

### Key Objectives

1. **Goal-Centric Design**
   - Users create goals (e.g., "Lose Weight", "Learn Programming")
   - Goals contain structured tasks, habits, and milestones
   - Visual progress tracking with motivational insights

2. **Effortless Task Management**
   - Quick-add with smart templates
   - Frequently used task suggestions
   - Drag-and-drop organization
   - Context switching with minimal friction

3. **Immersive Focus Experience**
   - Dynamic music that adapts to activities
   - Category-based playlists (Deep Work, Creative, Exercise)
   - Goal-specific soundscapes
   - Beautiful focus mode interface

4. **Actionable Insights**
   - Daily/weekly/monthly streaks
   - Focus time analytics
   - Productivity patterns
   - Goal completion forecasting

5. **API-First Architecture**
   - Clean separation of frontend/backend
   - RESTful API for all operations
   - Ready for mobile app development
   - Third-party integration capability

6. **Stunning Visual Design**
   - Modern, elegant aesthetics
   - Smooth animations and transitions
   - Delightful micro-interactions
   - Responsive and accessible

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Web App    │  │  Mobile App  │  │  Extensions  │        │
│  │  (Next.js)   │  │(React Native)│  │   (Future)   │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ HTTPS/REST API
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                            │    API LAYER                       │
├────────────────────────────┼────────────────────────────────────┤
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────┐      │
│  │           Next.js API Routes (Backend)              │      │
│  ├─────────────────────────────────────────────────────┤      │
│  │  • /api/v1/auth/*        - Authentication           │      │
│  │  • /api/v1/goals/*       - Goal management          │      │
│  │  • /api/v1/tasks/*       - Task CRUD & tracking     │      │
│  │  • /api/v1/categories/*  - Category management      │      │
│  │  • /api/v1/notes/*       - Notes operations         │      │
│  │  • /api/v1/music/*       - Music & playlists        │      │
│  │  • /api/v1/analytics/*   - Insights & reports       │      │
│  │  • /api/v1/habits/*      - Habit tracking           │      │
│  │  • /api/v1/streaks/*     - Streak calculations      │      │
│  │  • /api/v1/sync/*        - Real-time sync           │      │
│  └──────────────────┬──────────────────────────────────┘      │
│                     │                                           │
└─────────────────────┼───────────────────────────────────────────┘
                      │
                      │
┌─────────────────────┼───────────────────────────────────────────┐
│                     │  DATA & SERVICES LAYER                    │
├─────────────────────┼───────────────────────────────────────────┤
│                     ▼                                           │
│  ┌────────────────────────────┐  ┌──────────────────────┐     │
│  │   Supabase PostgreSQL      │  │   Supabase Storage   │     │
│  ├────────────────────────────┤  ├──────────────────────┤     │
│  │  • profiles                │  │  • Music files       │     │
│  │  • goals                   │  │  • Album artwork     │     │
│  │  • tasks                   │  │  • User avatars      │     │
│  │  • habits                  │  │  • Attachments       │     │
│  │  • categories              │  └──────────────────────┘     │
│  │  • notes                   │                                │
│  │  • music_tracks            │  ┌──────────────────────┐     │
│  │  • playlists               │  │  Supabase Realtime   │     │
│  │  • time_entries            │  ├──────────────────────┤     │
│  │  • streaks                 │  │  • Task updates      │     │
│  │  • analytics_cache         │  │  • Timer sync        │     │
│  └────────────────────────────┘  │  • Collaboration     │     │
│                                   └──────────────────────┘     │
│  ┌────────────────────────────┐                                │
│  │   Supabase Auth            │  ┌──────────────────────┐     │
│  ├────────────────────────────┤  │  External Services   │     │
│  │  • Google OAuth            │  ├──────────────────────┤     │
│  │  • Session Management      │  │  • Email (Resend)    │     │
│  │  • JWT Tokens              │  │  • Analytics         │     │
│  │  • Row Level Security      │  │  • Monitoring        │     │
│  └────────────────────────────┘  └──────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Diagrams

### 1. High-Level System Architecture

```
                          ┌─────────────────┐
                          │   End Users     │
                          └────────┬────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              ┌─────▼─────┐               ┌──────▼──────┐
              │  Web App  │               │ Mobile App  │
              │ (Next.js) │               │   (Future)  │
              └─────┬─────┘               └──────┬──────┘
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                          ┌────────▼────────┐
                          │   API Gateway   │
                          │ (Next.js Routes)│
                          └────────┬────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼────────┐      ┌──────────▼──────────┐      ┌───────▼────────┐
│  Auth Service  │      │  Business Logic     │      │ Media Service  │
│   (Supabase)   │      │   (API Handlers)    │      │   (Storage)    │
└───────┬────────┘      └──────────┬──────────┘      └───────┬────────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │    PostgreSQL   │
                          │   (Supabase)    │
                          └─────────────────┘
```

### 2. Data Flow - Task Creation & Tracking

```
┌─────────────┐
│    User     │
│  Interface  │
└──────┬──────┘
       │ 1. Create Task
       ▼
┌─────────────────────────┐
│  Task Creation Dialog   │
│  - Title, Description   │
│  - Goal Association     │
│  - Quick Template       │
└──────┬──────────────────┘
       │ 2. Submit
       ▼
┌─────────────────────────┐
│   API Call              │
│   POST /api/v1/tasks    │
└──────┬──────────────────┘
       │ 3. Validate & Process
       ▼
┌─────────────────────────┐
│  Backend Handler        │
│  - Validate user auth   │
│  - Check goal exists    │
│  - Apply template       │
│  - Create time entry    │
└──────┬──────────────────┘
       │ 4. Database Write
       ▼
┌─────────────────────────┐
│   PostgreSQL            │
│   INSERT INTO tasks     │
└──────┬──────────────────┘
       │ 5. Return data
       ▼
┌─────────────────────────┐
│   Real-time Update      │
│   Supabase broadcast    │
└──────┬──────────────────┘
       │ 6. Update UI
       ▼
┌─────────────────────────┐
│   Client State Update   │
│   - Task list refresh   │
│   - Show success toast  │
│   - Update analytics    │
└─────────────────────────┘
```

### 3. Goal-Task Hierarchy

```
┌────────────────────────────────────────────────────────────┐
│                         GOAL                               │
│  "Lose 20 pounds by June"                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Progress: 45% • Streak: 23 days • Target: 150 days  │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │   TASK CATEGORY     │  │   TASK CATEGORY     │        │
│  │   Exercise          │  │   Nutrition         │        │
│  └──────────┬──────────┘  └──────────┬──────────┘        │
│             │                        │                    │
│  ┌──────────▼──────────┐  ┌──────────▼──────────┐        │
│  │  Task: Morning Run  │  │  Task: Log Meals    │        │
│  │  Type: Recurring    │  │  Type: Daily Habit  │        │
│  │  Duration: 30min    │  │  Streak: 23 days    │        │
│  │  Status: Completed  │  │  Status: Active     │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │  Task: Gym Session  │  │  Task: Meal Prep    │        │
│  │  Type: 3x per week  │  │  Type: Weekly       │        │
│  │  Duration: 60min    │  │  Status: Pending    │        │
│  │  Status: Active     │  └─────────────────────┘        │
│  └─────────────────────┘                                  │
│                                                            │
│  ┌─────────────────────────────────────────────┐         │
│  │           MILESTONES                        │         │
│  │  ☑ Lost 5 pounds (Week 2)                   │         │
│  │  ☑ Consistent exercise (Week 4)             │         │
│  │  ☐ Lost 10 pounds (Target: Week 8)          │         │
│  │  ☐ Lost 15 pounds (Target: Week 12)         │         │
│  └─────────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────────┘
```

### 4. Music System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MUSIC PLAYER SYSTEM                      │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
      ┌─────────▼─────────┐         ┌──────────▼─────────┐
      │  Music Library    │         │  Dynamic Playlists │
      │  Management       │         │  Generation        │
      └─────────┬─────────┘         └──────────┬─────────┘
                │                               │
     ┌──────────┴──────────┐         ┌──────────┴─────────┐
     │                     │         │                    │
┌────▼─────┐      ┌────────▼─────┐  │  ┌──────────────┐  │
│Categories│      │  User Upload │  │  │ Goal-Based   │  │
├──────────┤      ├──────────────┤  │  ├──────────────┤  │
│• Deep    │      │• Audio Files │  │  │• "Lose       │  │
│  Work    │      │• Metadata    │  │  │  Weight"     │  │
│• Creative│      │• Album Art   │  │  │  → Upbeat    │  │
│• Exercise│      │• Streaming   │  │  │             │  │
│• Relax   │      │  URLs        │  │  │• "Study"     │  │
│• Focus   │      └──────────────┘  │  │  → Lo-fi     │  │
│• Ambient │                        │  └──────────────┘  │
└──────────┘                        │                    │
                                    │  ┌──────────────┐  │
                                    │  │ Activity-    │  │
                                    │  │ Based        │  │
                                    │  ├──────────────┤  │
                                    │  │• Running →   │  │
                                    │  │  High BPM    │  │
                                    │  │• Coding →    │  │
                                    │  │  Instrumental│  │
                                    │  └──────────────┘  │
                                    └────────────────────┘

         ┌─────────────────────────────────────┐
         │       PLAYBACK ENGINE               │
         ├─────────────────────────────────────┤
         │  • Web Audio API                    │
         │  • Audio Context                    │
         │  • Equalizer (Future)               │
         │  • Crossfade (Future)               │
         │  • Offline Caching                  │
         └─────────────────────────────────────┘
```

### 5. Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Click "Sign in with Google"
     ▼
┌─────────────────┐
│  Login Page     │
│  /auth/login    │
└────┬────────────┘
     │ 2. Redirect to OAuth
     ▼
┌─────────────────────┐
│  Google OAuth       │
│  Consent Screen     │
└────┬────────────────┘
     │ 3. User approves
     ▼
┌─────────────────────┐
│  Supabase Auth      │
│  /auth/callback     │
└────┬────────────────┘
     │ 4. Exchange code for session
     ▼
┌─────────────────────┐
│  Create Profile     │
│  (if new user)      │
│  - Trigger function │
│  - Default settings │
└────┬────────────────┘
     │ 5. Set session cookie
     ▼
┌─────────────────────┐
│  Redirect to        │
│  /dashboard         │
└────┬────────────────┘
     │
     ▼
┌─────────────────────┐
│  Middleware checks  │
│  auth state on      │
│  every request      │
└─────────────────────┘
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.1.17 | Styling framework |
| **Radix UI** | 3.2.1 | Accessible component primitives |
| **Framer Motion** | (New) | Advanced animations |
| **Lucide React** | 0.556.0 | Icon library |
| **Recharts** | (Current) | Data visualization |
| **React Hook Form** | (New) | Form management |
| **Zod** | (New) | Schema validation |

### Backend & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | Latest | PostgreSQL database & auth |
| **PostgreSQL** | 15+ | Primary database |
| **Supabase Storage** | Latest | File storage (music, images) |
| **Supabase Realtime** | Latest | WebSocket sync |
| **Redis** | (Future) | Caching & job queues |

### Development & DevOps

| Technology | Purpose |
|------------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vercel** | Hosting & deployment |
| **GitHub Actions** | CI/CD pipeline |
| **Vercel Analytics** | Performance monitoring |
| **Sentry** | Error tracking (future) |

### Mobile (Future)

| Technology | Purpose |
|------------|---------|
| **React Native** | Mobile framework |
| **Expo** | Development platform |
| **Native Audio** | Audio playback |

---

## Data Architecture

### Database Schema

#### Core Tables

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**goals** (NEW)
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  color TEXT,
  icon TEXT,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
```

**tasks** (ENHANCED)
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('one-time', 'recurring', 'habit')),
  recurrence_rule JSONB, -- { pattern: 'daily', interval: 1, days: [0,1,2] }
  estimated_duration INTEGER, -- minutes
  actual_duration INTEGER DEFAULT 0, -- seconds
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT CHECK (status IN ('todo', 'in-progress', 'completed', 'cancelled')),
  is_template BOOLEAN DEFAULT false,
  template_name TEXT,
  tags TEXT[],
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_template ON tasks(is_template) WHERE is_template = true;
```

**time_entries** (NEW - Replaces duration tracking in tasks)
```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- seconds, calculated on end
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
```

**habits** (NEW)
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_count INTEGER DEFAULT 1,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_at)
);

CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_completed_at ON habit_completions(completed_at);
```

**streaks** (NEW)
```sql
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  streak_type TEXT CHECK (streak_type IN ('goal', 'habit', 'focus', 'general')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_streaks_goal_id ON streaks(goal_id);
```

**music_tracks** (NEW)
```sql
CREATE TABLE music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- null for system tracks
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  duration INTEGER NOT NULL, -- seconds
  file_url TEXT NOT NULL,
  artwork_url TEXT,
  category TEXT, -- 'deep-work', 'creative', 'exercise', etc.
  bpm INTEGER,
  energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  is_public BOOLEAN DEFAULT false,
  play_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_music_tracks_category ON music_tracks(category);
CREATE INDEX idx_music_tracks_user_id ON music_tracks(user_id);
```

**playlists** (NEW)
```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_dynamic BOOLEAN DEFAULT false, -- auto-generated based on rules
  generation_rules JSONB, -- { categories: ['deep-work'], bpm: { min: 80 } }
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES music_tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
```

**categories** (CURRENT - Enhanced)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**notes** (CURRENT - Keep as is)
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#ffffff',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Data Relationships

```
profiles (1) ──────────┬──────── (many) goals
                       ├──────── (many) tasks
                       ├──────── (many) categories
                       ├──────── (many) notes
                       ├──────── (many) habits
                       ├──────── (many) playlists
                       └──────── (many) time_entries

goals (1) ─────────────┬──────── (many) tasks
                       ├──────── (many) habits
                       ├──────── (many) playlists
                       └──────── (1) streaks

tasks (1) ─────────────────────── (many) time_entries

habits (1) ────────────┬──────── (many) habit_completions
                       └──────── (1) streaks

playlists (1) ─────────────────── (many) playlist_tracks ────── (many) music_tracks
```

---

## API Layer Design

### API Architecture Principles

1. **RESTful Design** - Standard HTTP methods and status codes
2. **Versioning** - `/api/v1/` namespace for future compatibility
3. **Authentication** - JWT tokens via Supabase Auth
4. **Authorization** - Row Level Security enforced at database level
5. **Error Handling** - Consistent error response format
6. **Validation** - Request validation with Zod schemas
7. **Rate Limiting** - Protect against abuse (future)
8. **Caching** - Response caching for read-heavy endpoints (future)

### API Endpoints

#### Authentication
```
POST   /api/v1/auth/login          - Initiate OAuth flow
POST   /api/v1/auth/logout         - Destroy session
GET    /api/v1/auth/session        - Get current session
GET    /api/v1/auth/user           - Get current user profile
PATCH  /api/v1/auth/user           - Update user profile
```

#### Goals
```
GET    /api/v1/goals               - List user's goals
POST   /api/v1/goals               - Create new goal
GET    /api/v1/goals/:id           - Get goal details
PATCH  /api/v1/goals/:id           - Update goal
DELETE /api/v1/goals/:id           - Delete goal
GET    /api/v1/goals/:id/progress  - Get goal progress analytics
GET    /api/v1/goals/:id/tasks     - List tasks for goal
```

#### Tasks
```
GET    /api/v1/tasks               - List tasks (with filters)
POST   /api/v1/tasks               - Create task
GET    /api/v1/tasks/:id           - Get task details
PATCH  /api/v1/tasks/:id           - Update task
DELETE /api/v1/tasks/:id           - Delete task
POST   /api/v1/tasks/:id/start     - Start timer
POST   /api/v1/tasks/:id/stop      - Stop timer
POST   /api/v1/tasks/:id/complete  - Mark complete
GET    /api/v1/tasks/templates     - Get task templates
GET    /api/v1/tasks/frequently-used - Get frequently used tasks
```

#### Time Entries
```
GET    /api/v1/time-entries        - List time entries
POST   /api/v1/time-entries        - Create manual entry
GET    /api/v1/time-entries/:id    - Get entry details
PATCH  /api/v1/time-entries/:id    - Update entry
DELETE /api/v1/time-entries/:id    - Delete entry
GET    /api/v1/time-entries/active - Get currently running entry
```

#### Habits
```
GET    /api/v1/habits              - List habits
POST   /api/v1/habits              - Create habit
GET    /api/v1/habits/:id          - Get habit details
PATCH  /api/v1/habits/:id          - Update habit
DELETE /api/v1/habits/:id          - Delete habit
POST   /api/v1/habits/:id/complete - Mark habit done for today
GET    /api/v1/habits/:id/history  - Get completion history
```

#### Streaks
```
GET    /api/v1/streaks             - Get all streaks
GET    /api/v1/streaks/goal/:id    - Get goal streak
GET    /api/v1/streaks/habit/:id   - Get habit streak
POST   /api/v1/streaks/calculate   - Recalculate streaks
```

#### Music
```
GET    /api/v1/music/tracks        - List tracks (with filters)
POST   /api/v1/music/tracks        - Upload new track
GET    /api/v1/music/tracks/:id    - Get track details
DELETE /api/v1/music/tracks/:id    - Delete track
POST   /api/v1/music/tracks/:id/play - Increment play count

GET    /api/v1/music/playlists     - List playlists
POST   /api/v1/music/playlists     - Create playlist
GET    /api/v1/music/playlists/:id - Get playlist with tracks
PATCH  /api/v1/music/playlists/:id - Update playlist
DELETE /api/v1/music/playlists/:id - Delete playlist
POST   /api/v1/music/playlists/:id/generate - Generate dynamic playlist

GET    /api/v1/music/categories    - List music categories
```

#### Analytics
```
GET    /api/v1/analytics/dashboard    - Dashboard stats
GET    /api/v1/analytics/productivity - Productivity metrics
GET    /api/v1/analytics/focus-time   - Focus time breakdown
GET    /api/v1/analytics/goal/:id     - Goal analytics
GET    /api/v1/analytics/trends       - Historical trends
GET    /api/v1/analytics/insights     - AI-generated insights (future)
```

#### Categories
```
GET    /api/v1/categories          - List categories
POST   /api/v1/categories          - Create category
PATCH  /api/v1/categories/:id      - Update category
DELETE /api/v1/categories/:id      - Delete category
```

#### Notes
```
GET    /api/v1/notes               - List notes
POST   /api/v1/notes               - Create note
GET    /api/v1/notes/:id           - Get note
PATCH  /api/v1/notes/:id           - Update note
DELETE /api/v1/notes/:id           - Delete note
POST   /api/v1/notes/:id/pin       - Toggle pin
```

### API Response Format

**Success Response:**
```typescript
{
  success: true,
  data: T,
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      totalPages: number;
      totalCount: number;
    };
    timestamp: string;
  }
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    code: string;         // 'UNAUTHORIZED', 'VALIDATION_ERROR', etc.
    message: string;      // Human-readable error message
    details?: any;        // Additional error context
    timestamp: string;
  }
}
```

### API Implementation Structure

```
app/api/v1/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── session/route.ts
├── goals/
│   ├── route.ts                    # GET /goals, POST /goals
│   └── [id]/
│       ├── route.ts                # GET, PATCH, DELETE
│       ├── progress/route.ts
│       └── tasks/route.ts
├── tasks/
│   ├── route.ts
│   ├── templates/route.ts
│   ├── frequently-used/route.ts
│   └── [id]/
│       ├── route.ts
│       ├── start/route.ts
│       ├── stop/route.ts
│       └── complete/route.ts
├── music/
│   ├── tracks/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── playlists/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── generate/route.ts
│   └── categories/route.ts
└── analytics/
    ├── dashboard/route.ts
    ├── productivity/route.ts
    └── focus-time/route.ts
```

---

## Feature Modules

### 1. Goals System

**Purpose:** Enable users to set and track meaningful long-term objectives with structured tasks and milestones.

**Key Features:**
- Create goals with title, description, target date, and visual identity (color, icon)
- Associate multiple tasks and habits to each goal
- Visual progress tracking (percentage, timeline, milestones)
- Goal templates (fitness, learning, financial, career, personal)
- Goal streaks (consecutive days working on goal)
- Motivational insights and forecasting

**User Flow:**
1. User clicks "Create Goal" from dashboard
2. Fills in goal details (title, target date, category)
3. Selects icon and color for visual identity
4. (Optional) Adds initial tasks from templates
5. Goal appears on dashboard with 0% progress
6. As user completes tasks, progress updates automatically
7. Streak counter increments for consecutive active days

**UI Components:**
- Goal creation wizard
- Goal card with progress visualization
- Goal detail view with task list
- Milestone timeline
- Progress charts (radial, linear)

### 2. Enhanced Task Management

**Purpose:** Make task creation effortless with smart templates, quick-add, and intelligent organization.

**Key Features:**

**Quick Add:**
- Global keyboard shortcut (Ctrl+K / Cmd+K)
- Floating action button always accessible
- Natural language parsing (future: "Run 30min tomorrow")

**Task Templates:**
- Pre-defined templates by category:
  - Fitness: "Morning Run", "Gym Session", "Yoga Practice"
  - Work: "Team Meeting", "Code Review", "Documentation"
  - Learning: "Tutorial", "Practice Exercise", "Read Chapter"
  - Personal: "Meditation", "Journaling", "Meal Prep"
- Custom templates from frequently used tasks
- One-click task creation from template

**Frequently Used:**
- AI-powered suggestion of commonly created tasks
- "Create Again" button on completed tasks
- Smart defaults (time, category, goal association)

**Task Types:**
- **One-time:** Single-occurrence tasks
- **Recurring:** Daily, weekly, monthly patterns
- **Habits:** Daily habits with streak tracking

**Organization:**
- Drag-and-drop reordering
- Multi-select for bulk actions
- Filters: by status, goal, category, date
- Sort: by priority, due date, duration, creation date
- Search with highlighting

**UI Enhancements:**
- Inline editing (double-click to edit)
- Keyboard shortcuts (Enter = start, Space = complete)
- Swipe actions on mobile (future)
- Task preview on hover

### 3. Dynamic Music System

**Purpose:** Provide an immersive focus experience with intelligent music that adapts to user activities and goals.

**Music Categories:**
- **Deep Work** - Instrumental, ambient, low-distraction
- **Creative** - Uplifting, inspiring, moderate energy
- **Exercise** - High BPM, energetic, motivating
- **Focus** - Lo-fi, binaural beats, concentration aids
- **Relax** - Calm, soothing, meditation-friendly
- **Ambient** - Background soundscapes, nature sounds

**Goal-Based Playlists:**
- Automatically generate playlists for active goals
- Example: "Lose Weight" goal → Exercise music + motivational tracks
- Example: "Learn Programming" goal → Deep Work + Focus music
- User can customize goal-music associations

**Dynamic Playlist Generation:**
- Rules-based generation: "BPM > 120, category = Exercise, energy = high"
- Context-aware: Time of day, current task, recent listening history
- Adaptive: Learns from user preferences over time

**Features:**
- **Upload System:**
  - Drag-and-drop music files
  - Automatic metadata extraction (ID3 tags)
  - Album artwork upload/extraction
  - Categorization wizard

- **Playback:**
  - High-quality Web Audio API
  - Gapless playback
  - Crossfade between tracks (future)
  - Audio visualization (future)

- **Library Management:**
  - Beautiful grid/list view
  - Album/artist grouping
  - Like/favorite tracks
  - Play count and statistics
  - Smart playlists

**UI Design:**
- **Full Player View:**
  - Large album artwork
  - Waveform visualization
  - Rich metadata display
  - Queue management

- **Mini Player:**
  - Floating widget on all pages
  - Expandable on hover
  - Quick controls

- **Now Playing:**
  - Immersive full-screen mode (future)
  - Lyrics display (future)
  - Related tracks suggestions

### 4. Advanced Analytics

**Purpose:** Provide actionable insights into productivity patterns, goal progress, and time usage.

**Dashboard Metrics:**
- Today's focus time (total and per goal)
- Active tasks count
- Overall productivity score (algorithm-based)
- Current streaks (goals, habits)
- Goals at risk (behind schedule)

**Visualizations:**
- **Time Distribution:** Pie/donut chart by category/goal
- **7-Day Trend:** Bar chart of daily focus time
- **Productivity Heatmap:** Calendar view of active days
- **Goal Progress:** Radial progress charts
- **Focus Patterns:** Peak hours identification
- **Task Completion Rate:** Success rate by category

**Insights (AI-Generated):**
- "You're most productive between 9 AM - 11 AM"
- "Your 'Exercise' goal needs 2 more sessions this week"
- "You've maintained a 15-day streak on 'Meditation' habit!"
- "Your focus time increased 23% this week"

**Reports:**
- Daily summary email (optional)
- Weekly progress report
- Monthly goal review
- Export data (CSV, JSON)

### 5. Streaks & Habits

**Purpose:** Build consistency through gamification and positive reinforcement.

**Streak Types:**
- **Goal Streaks:** Consecutive days working on goal
- **Habit Streaks:** Daily habit completion chains
- **Focus Streaks:** Consecutive days with > X minutes focus time
- **Overall Streak:** General productivity streak

**Habit Tracking:**
- Simple checkbox for daily habits
- Visual calendar with completion markers
- Best streak and current streak display
- Habit suggestions based on goals
- Reminder notifications (future)

**Gamification:**
- Achievement badges (7-day, 30-day, 100-day streaks)
- Milestone celebrations (confetti animations)
- Progress bars and visual rewards
- Social sharing (future)

### 6. Focus Mode

**Purpose:** Minimize distractions and create an immersive work environment.

**Features:**
- **Full-screen overlay** when task is running
- **Minimal UI:** Large timer, task title, essential controls only
- **Background music integration:** Auto-play goal-appropriate music
- **Break reminders:** Pomodoro-style intervals (optional)
- **Ambient backgrounds:** Customizable scenes (fireplace, rain, cafe)
- **Do Not Disturb:** Block notifications (browser level)

**Customization:**
- Choose background theme
- Music on/off toggle
- Timer style (countdown, count-up, clock)
- Auto-end after estimated duration
- Break interval configuration

---

## UI/UX Architecture

### Design System

**Color Palette:**

```css
/* Primary Brand Colors */
--color-brand-50:  #FFF7ED;  /* Lightest orange tint */
--color-brand-100: #FFEDD5;
--color-brand-200: #FED7AA;
--color-brand-300: #FDBA74;
--color-brand-400: #FB923C;  /* Primary CTA */
--color-brand-500: #F97316;  /* Primary brand */
--color-brand-600: #EA580C;
--color-brand-700: #C2410C;
--color-brand-800: #9A3412;
--color-brand-900: #7C2D12;  /* Darkest */

/* Neutral Colors */
--color-stone-50:  #FAFAF9;
--color-stone-100: #F5F5F4;
--color-stone-200: #E7E5E4;
--color-stone-300: #D6D3D1;
--color-stone-400: #A8A29E;
--color-stone-500: #78716C;
--color-stone-600: #57534E;
--color-stone-700: #44403C;
--color-stone-800: #292524;
--color-stone-900: #1C1917;

/* Semantic Colors */
--color-success:   #10B981;  /* Green */
--color-warning:   #F59E0B;  /* Amber */
--color-error:     #EF4444;  /* Red */
--color-info:      #3B82F6;  /* Blue */

/* Glassmorphic Effects */
--glass-bg:        rgba(255, 255, 255, 0.7);
--glass-border:    rgba(255, 255, 255, 0.3);
--glass-shadow:    0 8px 32px rgba(0, 0, 0, 0.1);
--backdrop-blur:   blur(12px);
```

**Typography:**

```css
/* Font Families */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-display: 'Cal Sans', 'Inter', sans-serif;  /* For headings */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */

/* Font Weights */
--font-light:     300;
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

**Spacing Scale:**

```css
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
```

**Border Radius:**

```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* Perfect circle */
```

### Component Library

**Atomic Components:**
- Button (primary, secondary, ghost, danger)
- Input (text, number, date, time)
- Textarea
- Select / Dropdown
- Checkbox / Radio
- Switch / Toggle
- Badge / Chip
- Avatar
- Icon
- Tooltip
- Loading Spinner

**Composite Components:**
- Card (with header, body, footer)
- Modal / Dialog
- Drawer / Sidebar
- Dropdown Menu
- Accordion
- Tabs
- Progress Bar / Ring
- Toast Notifications
- Empty State
- Error Boundary

**Layout Components:**
- Container
- Grid / Flex
- Stack (vertical/horizontal)
- Spacer
- Divider

**Feature Components:**
- Task Card
- Goal Card
- Category Selector
- Timer Display
- Music Player
- Analytics Chart
- Habit Tracker
- Streak Display

### Animation System

**Framer Motion Variants:**

```typescript
// Fade in animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

// Slide up animation
export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

// Scale animation
export const scale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
};

// Stagger children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

**Micro-interactions:**
- Hover effects (scale, color shift)
- Click feedback (scale down, ripple)
- Loading states (skeleton, pulse)
- Success animations (check mark, confetti)
- Progress animations (smooth counting)
- Drag indicators
- Tooltip appearances

### Responsive Design

**Breakpoints:**

```css
/* Mobile First */
--screen-sm: 640px;   /* Small tablets */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Desktops */
--screen-xl: 1280px;  /* Large desktops */
--screen-2xl: 1536px; /* Extra large */
```

**Layout Strategy:**
- **Mobile (<768px):** Single column, bottom navigation, collapsible sidebar
- **Tablet (768-1024px):** Two columns, side navigation
- **Desktop (>1024px):** Multi-column dashboard, persistent sidebar

**Touch Targets:**
- Minimum 44x44px for buttons
- Swipe gestures on mobile
- Larger hit areas on small screens

---

## Security & Authentication

### Authentication Strategy

**Current:** Supabase Auth with Google OAuth

**Future Enhancements:**
- Email/password authentication
- Magic link login
- Apple Sign In
- GitHub OAuth
- Two-factor authentication (2FA)

### Security Measures

**Row Level Security (RLS):**
```sql
-- Example: Tasks table policy
CREATE POLICY "Users can only see their own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);
```

**API Security:**
- JWT token validation on every request
- CORS configuration
- Rate limiting (future)
- Input validation with Zod
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized inputs)

**Data Protection:**
- Passwords hashed with bcrypt (handled by Supabase)
- Sensitive data encryption at rest
- HTTPS only in production
- Secure cookie configuration

### Privacy

**Data Collection:**
- Only collect necessary user data
- No tracking without consent
- Clear privacy policy
- GDPR compliance (data export, deletion)

**User Controls:**
- Export all data
- Delete account
- Opt-out of analytics
- Control data sharing

---

## Performance & Scalability

### Performance Optimization

**Frontend:**
- **Code Splitting:** Dynamic imports for routes and heavy components
- **Image Optimization:** Next.js Image component with lazy loading
- **Bundle Analysis:** Regular bundle size monitoring
- **Memoization:** React.memo for expensive components
- **Virtual Scrolling:** For long task/music lists
- **Debouncing:** Search inputs, auto-save
- **Throttling:** Scroll handlers, resize events

**Backend:**
- **Database Indexing:** Optimized queries with proper indexes
- **Query Optimization:** Use database functions for complex calculations
- **Caching:** Redis for frequently accessed data (future)
- **Connection Pooling:** Efficient database connections
- **Background Jobs:** Async processing for streaks, analytics

**Assets:**
- **Music Files:** Compressed audio (192kbps MP3, opus)
- **Images:** WebP format with fallbacks
- **Fonts:** Subset fonts, preload critical fonts
- **Icons:** Lucide React (tree-shakeable)

### Scalability Strategy

**Current Capacity:** Supabase free tier
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth

**Growth Path:**
1. **Supabase Pro** ($25/month)
   - 8 GB database
   - 100 GB storage
   - 50 GB bandwidth

2. **Horizontal Scaling:**
   - CDN for static assets
   - Read replicas for analytics queries
   - Separate database for music storage

3. **Microservices (if needed):**
   - Music streaming service
   - Analytics service
   - Notification service

### Monitoring

**Metrics to Track:**
- Page load time (Core Web Vitals)
- API response time
- Database query performance
- Error rate
- User engagement
- Music playback quality

**Tools:**
- Vercel Analytics (already integrated)
- Sentry for error tracking (future)
- Supabase dashboard for DB performance
- Custom analytics for user behavior

---

## Mobile Strategy

### Phase 1: Progressive Web App (PWA)

**Immediate Benefits:**
- Installable on mobile devices
- Offline support
- Push notifications
- Native-like experience

**Implementation:**
- Service worker for caching
- Manifest file for install prompts
- Responsive design (already in progress)
- Touch-optimized UI

### Phase 2: React Native App

**Timeline:** After web app is stable and proven

**Architecture:**
```
┌─────────────────────────────────────┐
│      React Native App (Expo)       │
├─────────────────────────────────────┤
│  • Shared business logic            │
│  • Platform-specific UI components  │
│  • Native audio player              │
│  • Background timer                 │
│  • Local storage (SQLite)           │
│  • Push notifications               │
└──────────────┬──────────────────────┘
               │
               │ Same API
               ▼
┌─────────────────────────────────────┐
│       Backend API (Next.js)         │
│  Same endpoints, same logic         │
└─────────────────────────────────────┘
```

**Benefits of API-First:**
- No backend rewrite needed
- Shared data models
- Consistent business logic
- Easier testing and maintenance

**Native Features:**
- Background audio playback
- Persistent timers
- Local notifications
- Widget support (iOS/Android)
- Health app integration (future)

---

## Future Roadmap

### Short-Term (1-3 months)

- ✅ API layer implementation
- ✅ Goals system with hierarchical tasks
- ✅ Enhanced task management with templates
- ✅ Music upload and categorization
- ✅ Streaks and habits tracking
- ✅ UI redesign (stunning, elegant)
- ✅ Focus mode enhancements

### Medium-Term (3-6 months)

- 🔲 Real-time collaboration (share goals with friends)
- 🔲 AI-powered insights and suggestions
- 🔲 Natural language task creation
- 🔲 Advanced music features (equalizer, crossfade)
- 🔲 Mobile PWA optimization
- 🔲 Email notifications and summaries
- 🔲 Calendar integration (Google Calendar)
- 🔲 Pomodoro technique integration

### Long-Term (6-12 months)

- 🔲 React Native mobile app
- 🔲 Team/workspace features
- 🔲 Public goal sharing and discovery
- 🔲 Marketplace for goal templates
- 🔲 Integration with fitness trackers (Apple Health, Google Fit)
- 🔲 Voice commands (Siri, Google Assistant)
- 🔲 Browser extension (quick capture)
- 🔲 Desktop apps (Electron)

### Dream Features (12+ months)

- 🔲 AI productivity coach
- 🔲 Personalized music generation
- 🔲 VR/AR focus environments
- 🔲 Social features (friends, challenges)
- 🔲 Gamification (levels, achievements, leaderboards)
- 🔲 API marketplace (third-party integrations)
- 🔲 White-label version for teams

---

## Development Workflow

### Git Strategy

**Branches:**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

**Commit Convention:**
```
type(scope): subject

Types: feat, fix, docs, style, refactor, test, chore
Examples:
  feat(goals): add goal creation wizard
  fix(tasks): timer accuracy improvement
  docs(api): update endpoint documentation
```

### Testing Strategy

**Unit Tests:**
- API handlers
- Utility functions
- Data transformations

**Integration Tests:**
- API endpoints
- Database operations
- Authentication flows

**E2E Tests:**
- Critical user flows
- Task creation and tracking
- Goal management
- Music playback

**Manual Testing:**
- UI/UX review
- Cross-browser compatibility
- Mobile responsiveness
- Performance profiling

### Deployment Pipeline

```
┌──────────────┐
│  Git Push    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   GitHub     │
│   Actions    │
└──────┬───────┘
       │
       ├─► Lint & Type Check
       ├─► Run Tests
       ├─► Build Project
       │
       ▼
┌──────────────┐
│    Vercel    │
│  Deployment  │
└──────┬───────┘
       │
       ├─► Preview (feature branches)
       ├─► Production (main branch)
       │
       ▼
┌──────────────┐
│  Post-Deploy │
│  Validation  │
└──────────────┘
```

---

## Conclusion

Coffee Time Tracker is evolving into a **world-class productivity suite** with a solid architectural foundation. The API-first approach ensures scalability and future mobile expansion, while the beautiful UI and comprehensive feature set will delight users and help them achieve their goals.

Key strengths:
- ✨ **Beautiful, Elegant Design** - Stunning visuals that inspire productivity
- 🎯 **Goal-Oriented** - Everything connects to meaningful objectives
- 🎵 **Immersive Experience** - Dynamic music creates the perfect work environment
- 📊 **Actionable Insights** - Data-driven understanding of productivity patterns
- 🏗️ **Scalable Architecture** - API-first design ready for mobile
- 🔒 **Secure by Default** - Row-level security and best practices

This architecture document will evolve as the application grows. It serves as a north star for development decisions and a reference for understanding the system holistically.

**Let's build something amazing! ☕✨**

---

*Document maintained by the development team*
*Last updated: January 2026*
