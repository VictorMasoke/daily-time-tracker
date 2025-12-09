"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Coffee, Sparkles, Target, Zap, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-orange-50 flex">
      {/* Left Side - Artwork Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient - Updated to match landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-60/40 via-orange-80/40 to-stone-50/60" />

        {/* Abstract Coffee Art Pattern */}
        <div className="absolute inset-0">
          {/* Large decorative circles */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/30 to-orange-200/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/30 to-amber-200/20 blur-3xl" />

          {/* Coffee rings - softer colors */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full border border-amber-300/15 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/3 right-1/3 w-48 h-48 rounded-full border border-orange-300/10 transform translate-x-1/2 animate-pulse"
              style={{ animationDuration: '10s', animationDelay: '1s' }} />

          {/* Subtle floating coffee beans */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-8 rounded-full bg-gradient-to-b from-stone-700/15 to-stone-800/10 transform rotate-45"
              style={{
                left: `${25 + i * 12}%`,
                top: `${20 + Math.sin(i) * 40}%`,
                animation: `float 6s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <div className="max-w-md mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200/30 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-stone-700 tracking-wider">
                PRODUCTIVITY REIMAGINED
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-5xl font-light text-stone-900 mb-6 leading-tight">
              Brew Your Best
              <span className="block font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Work Daily
              </span>
            </h2>

            {/* Description */}
            <p className="text-stone-600/80 text-lg leading-relaxed mb-10">
              A minimalistic productivity tracker that turns your coffee breaks into
              meaningful progress markers. Focus, track, achieve.
            </p>

            {/* Features List */}
            <div className="space-y-4 mb-10">
              {[
                { icon: Target, text: "Track focused work sessions" },
                { icon: TrendingUp, text: "Monitor productivity patterns" },
                { icon: Zap, text: "Minimal, distraction-free interface" }
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group hover:translate-x-2 transition-transform">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <feature.icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-stone-700 group-hover:text-stone-900 transition-colors">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Enhanced Coffee Cup Container with better contrast */}
            <div className="mt-12 relative">
              <div className="relative w-56 h-56 mx-auto">
                {/* Background circle for contrast */}
                <div className="absolute inset-0 w-48 h-48 bg-gradient-to-br from-amber-100/40 to-orange-100/30 rounded-full blur-xl" />

                {/* Steam */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-16 bg-gradient-to-b from-amber-300/0 via-amber-300/50 to-amber-300/0 rounded-full animate-steam"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '4s'
                      }}
                    />
                  ))}
                </div>

                {/* Enhanced Coffee Cup */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-40 h-48">
                  {/* Cup */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-36 h-44 bg-gradient-to-br from-white to-amber-50/90 rounded-t-3xl rounded-b-lg shadow-lg border border-amber-200/50 backdrop-blur-sm">
                    {/* Coffee liquid */}
                    <div className="absolute bottom-4 left-2 right-2 h-36 bg-gradient-to-b from-amber-800/90 to-amber-900/90 rounded-t-2xl rounded-b-lg overflow-hidden">
                      {/* Coffee surface with shimmer */}
                      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-700/90 via-amber-600/90 to-amber-700/90 rounded-t-2xl" />

                      {/* Coffee texture */}
                      <div className="absolute top-8 left-4 w-28 h-28 rounded-full border-2 border-amber-700/30" />
                      <div className="absolute top-12 right-6 w-16 h-16 rounded-full border border-amber-600/20" />
                    </div>

                    {/* Handle with better contrast */}
                    <div className="absolute -right-6 top-12 w-10 h-20 border-4 border-amber-200 bg-gradient-to-b from-amber-100 to-amber-50 rounded-r-full shadow-inner" />
                  </div>

                  {/* Saucer */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-6 bg-gradient-to-br from-white to-amber-50/80 rounded-full shadow-md border border-amber-200/50 backdrop-blur-sm">
                    {/* Reflection */}
                    <div className="absolute top-1 left-8 right-8 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-200/20 backdrop-blur-sm mb-6 shadow-lg hover:shadow-xl transition-shadow">
              <Coffee className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-light text-stone-900 mb-3 tracking-tight">
              Welcome to
              <span className="font-semibold block mt-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Coffee Time
              </span>
            </h1>
            <p className="text-stone-600 text-base">Sign in to continue your productivity journey</p>
          </div>

          {/* Google Sign In */}
          <div className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-14 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-amber-500 rounded-xl font-medium text-base transition-all duration-300 shadow-sm hover:shadow-xl flex items-center justify-center gap-3 group hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="group-hover:text-amber-700 transition-colors duration-300">
                {isLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </Button>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in backdrop-blur-sm">
                <p className="text-sm text-red-600 text-center font-medium">{error}</p>
              </div>
            )}

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-stone-500 font-medium">Secure & Passwordless</span>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/30 text-center hover:border-amber-300 hover:shadow-md transition-all group cursor-pointer">
                <div className="text-amber-600 mb-2">
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900">No Password</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl border border-orange-200/30 text-center hover:border-orange-300 hover:shadow-md transition-all group cursor-pointer">
                <div className="text-orange-600 mb-2">
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900">Instant Setup</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-stone-200">
            <p className="text-xs text-stone-500 text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="TermsOfService" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="PrivacyPolicy" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Privacy Policy
              </a>
            </p>
            <p className="text-xs text-stone-400 text-center mt-2">
              Coffee Time is committed to protecting your privacy and data
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(45deg); }
          50% { transform: translateY(-20px) rotate(45deg); }
        }

        @keyframes steam {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-steam {
          animation: steam 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
