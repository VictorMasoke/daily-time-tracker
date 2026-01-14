"use client"

import { Coffee, Sparkles, TrendingUp, Target, Zap, Users, ArrowRight, CheckCircle, Star, Play, Clock, BarChart3, Music, Brain, Rocket, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(featuresRef, { once: true, margin: "-100px" })

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Target,
      title: "Smart Goal Tracking",
      description: "Set ambitious goals and break them into actionable tasks. Watch your progress unfold in real-time.",
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50"
    },
    {
      icon: Clock,
      title: "Focus Time Sessions",
      description: "Deep work sessions with intelligent break reminders. Track every minute of your productive flow.",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50"
    },
    {
      icon: Music,
      title: "Focus Music",
      description: "Curated ambient sounds and lo-fi beats to keep you in the zone. Your personal productivity playlist.",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: BarChart3,
      title: "AI-Powered Analytics",
      description: "Smart insights about your productivity patterns. Know when you work best and optimize your schedule.",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50"
    }
  ]

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "2M+", label: "Hours Tracked" },
    { value: "98%", label: "Satisfaction" },
    { value: "4.9", label: "App Rating" }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer at Figma",
      content: "Coffee Time completely transformed my workflow. The goal tracking feature helped me ship 3x more designs this quarter.",
      avatar: "SC",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      name: "Marcus Rivera",
      role: "Senior Engineer at Google",
      content: "As a developer, I need deep focus. The focus music and session tracking are game-changers for my coding sprints.",
      avatar: "MR",
      gradient: "from-blue-400 to-cyan-500"
    },
    {
      name: "Priya Sharma",
      role: "Founder & CEO",
      content: "Running a startup requires intense focus. Coffee Time's analytics helped me identify my peak productivity hours.",
      avatar: "PS",
      gradient: "from-emerald-400 to-teal-500"
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950" />
        <motion.div
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-amber-200/30 to-orange-200/30 dark:from-amber-500/10 dark:to-orange-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200/50 dark:border-stone-700/50 shadow-lg'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Coffee className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-stone-900 to-stone-600 dark:from-white dark:to-stone-300 bg-clip-text text-transparent">
                Coffee Time
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Testimonials', 'Pricing'].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium relative group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 group-hover:w-full" />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link href="login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-amber-500/25 font-semibold">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  The #1 Productivity App for 2025
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-stone-900 dark:text-white">Transform Your</span>
                <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Productivity
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-stone-600 dark:text-stone-400 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Track goals, manage tasks, analyze your focus patterns, and unlock your full potential with AI-powered insights.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 rounded-2xl text-lg font-semibold shadow-xl shadow-amber-500/30">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-2xl text-lg font-semibold border-2 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-4 gap-6 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Animated Dashboard Preview */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Main Dashboard Card */}
                <motion.div
                  className="bg-white dark:bg-stone-800 rounded-3xl shadow-2xl p-6 border border-stone-200/50 dark:border-stone-700/50"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-white">Today's Focus</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">3h 42m tracked</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                      Active
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-stone-600 dark:text-stone-400">Daily Goal</span>
                      <span className="font-semibold text-amber-600">74%</span>
                    </div>
                    <div className="h-3 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "74%" }}
                        transition={{ duration: 1.5, delay: 1 }}
                      />
                    </div>
                  </div>

                  {/* Tasks Preview */}
                  <div className="space-y-3">
                    {['Design new landing page', 'Review PRs', 'Team standup'].map((task, i) => (
                      <motion.div
                        key={task}
                        className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-700/50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.2 }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-stone-200 dark:bg-stone-600'}`}>
                          <CheckCircle className={`w-4 h-4 ${i === 0 ? 'text-amber-600' : 'text-stone-400'}`} />
                        </div>
                        <span className={`flex-1 ${i === 0 ? 'text-stone-900 dark:text-white font-medium' : 'text-stone-500 dark:text-stone-400'}`}>
                          {task}
                        </span>
                        {i === 0 && (
                          <span className="text-sm text-amber-600 font-medium">In Progress</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-6 -right-6 bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-4 border border-stone-200/50 dark:border-stone-700/50"
                  animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Productivity</p>
                      <p className="font-bold text-emerald-600">+23% this week</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-6 bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-4 border border-stone-200/50 dark:border-stone-700/50"
                  animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">Now Playing</p>
                      <p className="font-semibold text-stone-900 dark:text-white">Deep Focus Mix</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-stone-300 dark:border-stone-600 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 rounded-full bg-amber-500"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-32 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-6">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                achieve more
              </span>
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Built for ambitious individuals who want to take control of their time and accomplish their goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className={`group relative p-8 rounded-3xl cursor-pointer transition-all duration-500 ${
                  activeFeature === i
                    ? `bg-gradient-to-br ${feature.bgGradient} dark:from-stone-800 dark:to-stone-800 shadow-xl scale-105`
                    : 'bg-white dark:bg-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-800'
                } border border-stone-200/50 dark:border-stone-700/50`}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => setActiveFeature(i)}
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {feature.description}
                </p>
                {activeFeature === i && (
                  <motion.div
                    className="absolute bottom-4 right-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <ArrowRight className={`w-6 h-6 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-6 bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-400 text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              Loved by Thousands
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-6">
              What our users
              <br />
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                are saying
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                className="bg-white dark:bg-stone-800 rounded-3xl p-8 shadow-lg border border-stone-200/50 dark:border-stone-700/50"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 dark:text-stone-400 text-lg mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <div className="container mx-auto relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your productivity?
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Join thousands of achievers who are crushing their goals with Coffee Time.
            </p>
            <Link href="login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-white text-amber-600 hover:bg-stone-100 px-10 py-6 rounded-2xl text-lg font-bold shadow-2xl">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
            <p className="text-white/60 text-sm mt-6">
              No credit card required • Free forever plan available
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-stone-900 dark:bg-stone-950">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Coffee Time</span>
            </div>
            <p className="text-stone-400 text-sm">
              © 2025 Coffee Time. Built with passion for productivity.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/auth/PrivacyPolicy" className="text-stone-400 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link href="/auth/TermsOfService" className="text-stone-400 hover:text-white transition-colors text-sm">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
