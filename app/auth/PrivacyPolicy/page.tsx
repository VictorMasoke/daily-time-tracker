"use client"

import { Coffee, Shield, Lock, Eye, Mail, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Information We Collect",
      icon: <Eye className="w-5 h-5" />,
      content: [
        "When you sign in with Google, we collect your name, email address, and profile picture.",
        "We collect your productivity data including work sessions, coffee breaks, and productivity metrics.",
        "Usage data such as timestamps, session duration, and feature interactions.",
        "Technical data including browser type, device information, and IP address for security purposes."
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <Coffee className="w-5 h-5" />,
      content: [
        "To provide and improve our productivity tracking services.",
        "To personalize your experience and provide relevant insights.",
        "To communicate with you about service updates and announcements.",
        "To ensure the security and integrity of our platform."
      ]
    },
    {
      title: "Data Security",
      icon: <Lock className="w-5 h-5" />,
      content: [
        "All data is encrypted in transit using TLS 1.2+.",
        "We use industry-standard security measures to protect your information.",
        "Your data is stored on secure servers with regular security audits.",
        "We never sell or share your personal data with third parties for advertising."
      ]
    },
    {
      title: "Your Rights",
      icon: <Shield className="w-5 h-5" />,
      content: [
        "Right to access your personal data at any time.",
        "Right to request deletion of your data (subject to legal requirements).",
        "Right to export your productivity data in a machine-readable format.",
        "Right to opt-out of non-essential communications."
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-stone-200 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-stone-900">Coffee Time</span>
            </div>

            <div className="flex items-center gap-6">
              <Link href="/" className="text-stone-600 hover:text-amber-600 transition-colors">
                Home
              </Link>
              <Link href="login" className="text-stone-600 hover:text-amber-600 transition-colors">
                Login
              </Link>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Link href="login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-6">
              <Shield className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-stone-200 shadow-sm mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              At Coffee Time, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our productivity tracking service.
            </p>
          </div>

          {/* Main Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-stone-200 hover:border-amber-300 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="text-amber-600">
                      {section.icon}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-stone-900">{section.title}</h2>
                </div>

                <ul className="space-y-3 pl-4">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <ChevronRight className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
                      <span className="text-stone-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 md:p-12 border border-amber-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-6">
                <Mail className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">Questions About Privacy?</h3>
              <p className="text-stone-700 mb-6 max-w-2xl mx-auto">
                If you have any questions about our Privacy Policy or how we handle your data,
                please don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  <a href="mailto:privacy@coffeetime.app">Email Our Privacy Team</a>
                </Button>
                <Button variant="outline" className="border-amber-400 text-amber-600 hover:bg-amber-50">
                  <Link href="TermsOfService">View Terms of Service</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-500">
              This Privacy Policy may be updated periodically. We encourage you to review this page
              regularly for any changes.
            </p>
            <p className="text-xs text-stone-400 mt-4">
              © {new Date().getFullYear()} Coffee Time. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
