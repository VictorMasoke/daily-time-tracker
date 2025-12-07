# Daily Task Tracker

A modern task management application built with Next.js, Supabase for database and authentication, and Google OAuth for login.

## 🛠️ Technologies Used
- **Frontend**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Authentication**: Google OAuth
- **Styling**: [Tailwind CSS/your choice]
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn** or **pnpm** (package manager)
3. **Git** installed
4. **Supabase account** (free tier available)
5. **Google Cloud Console** project with OAuth 2.0 credentials

## 🔧 Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/daily-task-tracker.git
cd daily-task-tracker
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory (do NOT commit this file):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

SUPERBASE_DATABASE_PASSWORD=your_supabase_database_password
NEXT_DISABLE_SWC_BINARY=1
```

**Important Security Notes:**
- Never commit your `.env.local` file to version control
- The provided credentials are examples - use your own in production
- For production, rotate all API keys and passwords

### Step 4: Set Up Supabase

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key to the `.env.local` file

2. **Set Up Database Schema:**
   - In Supabase Dashboard, go to SQL Editor
   - Run the following SQL to create a tasks table:

2. **Run the 001_create_tables.sql file located in the root of the project:**

### Step 5: Configure Google OAuth

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Set Application type as **Web application**
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback
     https://yourdomain.com/api/auth/callback
     ```
   - Copy Client ID and Client Secret to your `.env.local` file

2. **Configure Supabase Auth:**
   - In Supabase Dashboard, go to **Authentication** → **Providers**
   - Enable **Google**
   - Paste your Google Client ID and Client Secret
   - Add authorized redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### Step 6: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 7: Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
daily-task-tracker/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── tasks/            # Task management pages
│   └── layout.js         # Root layout
├── components/           # Reusable components
├── lib/                  # Utility functions
│   └── supabase.js      # Supabase client
├── public/              # Static assets
├── .env.local           # Environment variables (gitignored)
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. Google redirects back to Supabase callback
4. Supabase creates user session
5. User redirected to dashboard

## 🗄️ Database Schema

**Tables:**
- `tasks`: Stores user tasks with title, description, status, due date
- `profiles`: (Optional) Extended user profile information

**Relationships:**
- Each task belongs to one user (`user_id` foreign key)
- Users can have multiple tasks

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**
   - Verify Google OAuth credentials in Supabase
   - Check redirect URIs match exactly

2. **Database connection errors**
   - Verify Supabase URL and keys
   - Check if tables and RLS policies exist

3. **Environment variables not loading**
   - Ensure file is named `.env.local` (not `.env`)
   - Restart development server after changes

4. **CORS errors**
   - Configure authorized origins in Supabase Dashboard
   - Add `localhost:3000` to allowed origins

### Development Commands:

```bash
# Check Supabase connection
npm run test:supabase

# Reset database (caution: deletes all data)
npm run db:reset

# View logs
npm run logs
```

## 📞 Support

For issues:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Create an issue in the GitHub repository
4. Get in touch with me on my email vmasoke20@gmail.com

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

**Note for Development:** Replace all placeholder credentials with your actual credentials before running the application. For production deployment, use environment variables in your hosting platform (Vercel, Netlify, etc.).

