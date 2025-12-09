"use client"

import { Coffee, Sparkles, TrendingUp, Target, Zap, Users, Quote, Github, Mail, ArrowRight, CheckCircle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [loaded, setLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    // const handleMouseMove = (e: MouseEvent) => {
    //   setMousePosition({
    //     x: (e.clientX / window.innerWidth) * 100,
    //     y: (e.clientY / window.innerHeight) * 100
    //   })
    // }

    window.addEventListener('scroll', handleScroll)
    //window.addEventListener('mousemove', handleMouseMove)
    setLoaded(true)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      //window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      content: "Coffee Time transformed how I track my deep work sessions. The minimal interface keeps me focused.",
      avatar: "SC",
      rating: 5,
      color: "from-purple-400 to-pink-500"
    },
    {
      name: "Marcus Rivera",
      role: "Software Engineer",
      content: "As a developer, I love the simplicity. It's the perfect pomodoro companion for coding sprints.",
      avatar: "MR",
      rating: 5,
      color: "from-blue-400 to-cyan-500"
    },
    {
      name: "Priya Sharma",
      role: "Writer & Editor",
      content: "The coffee break tracking is genius. It makes productivity feel rewarding and sustainable.",
      avatar: "PS",
      rating: 5,
      color: "from-green-400 to-emerald-500"
    }
  ]

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Focused Sessions",
      description: "Track concentrated work periods with coffee-break intervals",
      gradient: "from-amber-400 to-orange-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Insights",
      description: "Visualize your productivity patterns over time",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Minimal Interface",
      description: "Clean design that stays out of your way",
      gradient: "from-green-400 to-teal-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Google Sign-in",
      description: "Secure, passwordless authentication",
      gradient: "from-purple-400 to-pink-500"
    }
  ]

  const parallaxX = mousePosition.x * 0.01
  const parallaxY = mousePosition.y * 0.01

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white overflow-hidden" ref={containerRef}>
      <style jsx>{`
        @keyframes float-smooth {
          0%, 100% {
            transform: translateY(0px) rotate(45deg) scale(1);
          }
          33% {
            transform: translateY(-15px) rotate(50deg) scale(1.05);
          }
          66% {
            transform: translateY(-5px) rotate(40deg) scale(0.95);
          }
        }

        @keyframes steam-float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
            filter: blur(0px);
          }
          20% {
            opacity: 0.8;
            filter: blur(2px);
          }
          100% {
            transform: translateY(-120px) scale(1.8);
            opacity: 0;
            filter: blur(8px);
          }
        }

        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bean-spin {
          0% {
            transform: rotate(0deg) translateX(0) scale(1);
          }
          25% {
            transform: rotate(90deg) translateX(10px) scale(1.1);
          }
          50% {
            transform: rotate(180deg) translateX(0) scale(1);
          }
          75% {
            transform: rotate(270deg) translateX(-10px) scale(0.9);
          }
          100% {
            transform: rotate(360deg) translateX(0) scale(1);
          }
        }

        @keyframes bee-fly {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(30px, -20px) rotate(5deg);
          }
          50% {
            transform: translate(10px, -40px) rotate(-5deg);
          }
          75% {
            transform: translate(-20px, -20px) rotate(3deg);
          }
        }

        .animate-float-smooth {
          animation: float-smooth 6s ease-in-out infinite;
        }

        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradient-flow 8s ease infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }

        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-bean-spin {
          animation: bean-spin 20s linear infinite;
        }

        .animate-bee-fly {
          animation: bee-fly 10s ease-in-out infinite;
        }

        .transition-smooth {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .transition-bounce {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-smooth ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-stone-200/50 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-amber-300/30 hover:scale-105 transition-bounce">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-stone-900 hover:text-amber-600 transition-colors cursor-pointer">
                Coffee Time
              </span>
            </div>

            {/* Desktop Navigation Links - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-stone-600 hover:text-amber-600 transition-smooth relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
              </Link>
              <Link href="#testimonials" className="text-stone-600 hover:text-amber-600 transition-smooth relative group">
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full"></span>
              </Link>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-bounce text-sm sm:text-base px-4 sm:px-6">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>

            {/* Mobile Menu Button - Optional */}
            <div className="md:hidden">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl text-sm px-4">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 z-0">
          {/* Base gradient with subtle animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50" />

          {/* Animated coffee rings with parallax */}
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-amber-300/30 animate-pulse-subtle"
            style={{
              transform: `translate(${parallaxX * 2}px, ${parallaxY * 2}px)`,
              animationDuration: '12s'
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full border border-orange-400/20 animate-pulse-subtle"
            style={{
              transform: `translate(${-parallaxX * 1.5}px, ${-parallaxY * 1.5}px)`,
              animationDuration: '10s',
              animationDelay: '2s'
            }}
          />

          {/* Enhanced glowing orbs */}
          <div
            className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-amber-300/30 to-orange-300/20 rounded-full blur-3xl animate-pulse-subtle"
            style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}
          />
          <div
            className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-amber-300/30 rounded-full blur-3xl animate-pulse-subtle"
            style={{
              transform: `translate(${-parallaxX}px, ${-parallaxY}px)`,
              animationDelay: '3s'
            }}
          />

          {/* Realistic floating coffee beans */}
          {[...Array(9)].map((_, i) => {
            const size = 6 + Math.random() * 6
            const duration = 8 + Math.random() * 8
            const delay = Math.random() * 5
            const rotation = Math.random() * 360

            return (
              <div
                key={i}
                className="absolute animate-bean-spin"
                style={{
                  width: `${size}px`,
                  height: `${size * 1.8}px`,
                  left: `${15 + i * 8}%`,
                  top: `${10 + Math.sin(i) * 60}%`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              >
                {/* Coffee bean with realistic shape */}
                <div
                  className="w-full h-full rounded-full bg-gradient-to-b from-stone-800/80 to-stone-900/60 transform"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    clipPath: 'ellipse(40% 60% at 50% 50%)',
                    boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.3)'
                  }}
                />
                {/* Bean highlight */}
                <div
                  className="absolute top-1/4 left-1/4 w-1/3 h-1/6 rounded-full bg-gradient-to-r from-stone-300/40 to-transparent blur-[1px]"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              </div>
            )
          })}


          {/* Enhanced steam animations */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-32 bg-gradient-to-b from-amber-300/0 via-amber-300/40 to-amber-300/0 rounded-full animate-steam-float"
                style={{
                  left: `${i * 12 - 36}px`,
                  animation: `steam-float ${4 + i * 0.3}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.7 - i * 0.1
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-amber-200/50 shadow-lg hover:shadow-xl hover:scale-105 transition-bounce animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse-subtle" />
              <span className="text-sm font-medium text-stone-700 tracking-wider">
                PRODUCTIVITY REIMAGINED
              </span>
            </div>

            {/* Main Heading */}
            <h1
              className="text-5xl md:text-7xl font-light text-stone-900 mb-6 leading-tight animate-fade-up"
              style={{ animationDelay: '0.2s' }}
            >
              Brew Your Best
              <span className="block font-semibold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent animate-gradient-flow">
                Work Daily
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-white/40 p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-smooth animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              A minimalistic productivity tracker that turns your coffee breaks into
              meaningful progress markers. Focus, track, achieve.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 animate-fade-up"
              style={{ animationDelay: '0.4s' }}
            >
              <Button
                size="lg"
                className="h-14 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg font-medium shadow-lg hover:shadow-2xl hover:scale-105 transition-bounce group"
              >
                <Link href="/auth/login" className="flex items-center gap-2">
                  Start Brewing
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-xl border-2 border-stone-300 hover:border-amber-400 bg-white/80 backdrop-blur-sm hover:bg-white text-stone-700 text-lg hover:scale-105 transition-bounce hover:shadow-lg"
              >
                <a href="#features" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  See Features
                </a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { value: "10K+", label: "Focused Hours", delay: '0.5s' },
                { value: "5K+", label: "Coffee Breaks", delay: '0.6s' },
                { value: "99%", label: "Satisfaction", delay: '0.7s' },
                { value: "24/7", label: "Productivity", delay: '0.8s' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center backdrop-blur-sm bg-white/60 p-4 rounded-2xl border border-white/40 hover:bg-white/80 hover:border-amber-300 hover:scale-105 transition-bounce animate-fade-in group cursor-pointer"
                  style={{ animationDelay: stat.delay }}
                >
                  <div className="text-3xl font-bold text-stone-900 mb-1 group-hover:text-amber-600 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-stone-600 group-hover:text-stone-700 transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-stone-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/20 to-transparent animate-pulse-subtle" />

        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl font-semibold text-stone-900 mb-4">
              Brewed to Perfection
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Everything you need for focused productivity, nothing you don't
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl border border-stone-200/50 hover:border-amber-300/50 transition-smooth hover:shadow-2xl hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transition-smooth group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-xl`}>
                  <div className="text-white transition-smooth group-hover:scale-110">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3 group-hover:text-amber-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-stone-600 transition-colors group-hover:text-stone-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <h2 className="text-4xl font-semibold text-stone-900 mb-6">
                Simple. Focused. Effective.
              </h2>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Coffee Time uses the power of ritual to boost your productivity.
                Each coffee break becomes a natural checkpoint in your workflow.
              </p>

              <ul className="space-y-4">
                {[
                  "Sign in with Google - no passwords to remember",
                  "Start a focused work session",
                  "Take coffee breaks as natural intervals",
                  "Track your progress with beautiful insights"
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 animate-slide-in-right hover:translate-x-2 transition-smooth"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 animate-pulse-subtle" />
                    <span className="text-stone-700 hover:text-stone-900 transition-colors">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {/* Mockup */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-200/50 shadow-2xl hover:shadow-3xl transition-smooth hover:scale-105">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center animate-pulse-subtle">
                      <Coffee className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">Current Session</div>
                      <div className="text-sm text-stone-600">2 hours of deep work</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {["Design Review", "Code Sprint", "Documentation"].map((task, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-stone-50/50 hover:bg-stone-100 transition-smooth hover:scale-105 cursor-pointer"
                        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                      >
                        <span className="text-stone-700 hover:text-stone-900 transition-colors">{task}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-6 rounded transition-smooth ${
                                i <= index ? 'bg-gradient-to-b from-amber-500 to-orange-500' : 'bg-stone-200'
                              }`}
                              style={{
                                transitionDelay: `${i * 0.1}s`,
                                opacity: i <= index ? 1 : 0.5
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-stone-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-amber-200 rounded-full blur-3xl animate-pulse-subtle" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 mb-4">
              <Quote className="w-6 h-6 text-amber-500 animate-pulse-subtle" />
              <span className="text-sm font-medium text-stone-700 uppercase tracking-wider">
                What Brewers Say
              </span>
            </div>
            <h2 className="text-4xl font-semibold text-stone-900 mb-4">
              Loved by Focused Minds
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-stone-200/50 hover:border-amber-300/50 transition-smooth hover:shadow-2xl hover:-translate-y-1 animate-fade-in group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400 transition-smooth group-hover:scale-125 hover:scale-150"
                      style={{ transitionDelay: `${i * 0.05}s` }}
                    />
                  ))}
                </div>

                <p className="text-stone-700 mb-6 italic leading-relaxed hover:text-stone-800 transition-colors">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-110 transition-smooth`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-stone-600 group-hover:text-stone-700 transition-colors">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer id="contact" className="bg-stone-900 text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full blur-3xl animate-pulse-subtle" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="animate-fade-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg hover:shadow-amber-300/30 hover:scale-105 transition-bounce">
                  <Coffee className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-semibold hover:text-amber-400 transition-colors cursor-pointer">
                  Coffee Time
                </span>
              </div>
              <p className="text-stone-400 mb-8 max-w-md leading-relaxed hover:text-stone-300 transition-colors">
                A minimalistic productivity tool designed for focused work and
                meaningful breaks. Brew your best work, one cup at a time.
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/VictorMasoke/daily-time-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-bounce hover:scale-110 hover:shadow-lg"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="mailto:vmasoke2@gmail.com"
                  className="w-12 h-12 rounded-full bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-bounce hover:scale-110 hover:shadow-lg"
                >
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-semibold mb-6 hover:text-amber-400 transition-colors">
                Contact the Developer
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 hover:translate-x-2 transition-smooth cursor-pointer">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <span className="text-stone-400 hover:text-white transition-colors">
                    vmasoke2@gmail.com
                  </span>
                </div>
                <div className="flex items-center gap-3 hover:translate-x-2 transition-smooth cursor-pointer">
                  <Github className="w-5 h-5 text-amber-400" />
                  <a
                    href="https://github.com/VictorMasoke/daily-time-tracker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    Github Repository
                  </a>
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="font-medium mb-4 hover:text-amber-400 transition-colors">
                  Stay Updated
                </h4>
                <div className="flex gap-2 items-stretch">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg bg-stone-800/50 backdrop-blur-sm border border-stone-700 focus:outline-none focus:border-amber-500 focus:shadow-lg transition-all duration-300 min-h-[48px]"
                  />
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:scale-105 transition-all duration-300 shadow-lg border border-amber-500/30 min-h-[48px] px-6">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-800/50 mt-12 pt-8 text-center text-stone-500 text-sm">
            <p className="animate-fade-up">© {new Date().getFullYear()} Coffee Time. Brewing productivity since today.</p>
            <p className="mt-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Made with <span className="text-amber-400">☕</span> and <span className="text-red-400">❤️</span> for focused minds.
            </p>
            <p> </p>
            <p className="mt-2 animate-fade-up" style={{ animationDelay: '0.1s' }}><a href="PrivacyPolicy">Privacy Policy</a> | <a href="TermsOfService">Terms of Service</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
