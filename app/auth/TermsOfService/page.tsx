"use client"

import { Coffee, FileText, CheckCircle, AlertTriangle, Users, Book } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsOfService() {
  const terms = [
    {
      title: "Acceptance of Terms",
      icon: <CheckCircle className="w-5 h-5" />,
      content: "By accessing and using Coffee Time, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service."
    },
    {
      title: "Service Description",
      icon: <Coffee className="w-5 h-5" />,
      content: "Coffee Time provides a productivity tracking service that helps users monitor work sessions and coffee breaks. We offer features including session tracking, progress insights, and productivity analytics."
    },
    {
      title: "User Accounts",
      icon: <Users className="w-5 h-5" />,
      content: "You must create an account using Google Sign-in to access our services. You are responsible for maintaining the confidentiality of your account and restricting access to your devices."
    },
    {
      title: "Acceptable Use",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: "You agree not to use the service for any illegal purpose or in violation of any laws. You must not interfere with or disrupt the service or servers connected to the service."
    },
    {
      title: "Intellectual Property",
      icon: <Book className="w-5 h-5" />,
      content: "All content included on Coffee Time, such as text, graphics, logos, and software, is the property of Coffee Time or its content suppliers and protected by intellectual property laws."
    },
    {
      title: "Limitation of Liability",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: "Coffee Time shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service."
    },
    {
      title: "Modifications to Service",
      icon: <FileText className="w-5 h-5" />,
      content: "We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service."
    },
    {
      title: "Governing Law",
      icon: <CheckCircle className="w-5 h-5" />,
      content: "These terms shall be governed by and construed in accordance with the laws of the jurisdiction where Coffee Time operates, without regard to its conflict of law provisions."
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
              <FileText className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Please read these terms carefully before using Coffee Time
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 mb-12 border border-amber-200">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Important Legal Notice</h3>
                <p className="text-stone-700">
                  These Terms of Service constitute a legally binding agreement between you and Coffee Time.
                  By using our service, you acknowledge that you have read, understood, and agree to be bound
                  by these terms.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {terms.map((term, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-stone-200 hover:border-amber-300 transition-all hover:shadow-lg group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="text-amber-600">
                      {term.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">{term.title}</h3>
                </div>
                <p className="text-stone-700 leading-relaxed">{term.content}</p>
              </div>
            ))}
          </div>

          {/* User Responsibilities */}
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-stone-200 mb-12">
            <h2 className="text-2xl font-bold text-stone-900 mb-6 text-center">User Responsibilities</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/50 border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-3">You Agree To:</h4>
                <ul className="space-y-2 text-stone-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Provide accurate information during registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Maintain the security of your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span>Use the service for its intended purpose</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200">
                <h4 className="font-bold text-stone-900 mb-3">You Agree Not To:</h4>
                <ul className="space-y-2 text-stone-700">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                    <span>Share your account credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                    <span>Use the service for illegal activities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                    <span>Attempt to reverse engineer the service</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact & Actions */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-stone-900 mb-6">Need More Information?</h3>
            <p className="text-stone-700 mb-8 max-w-2xl mx-auto">
              If you have questions about these terms or need clarification on any points,
              please contact us before using the service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <a href="mailto:legal@coffeetime.app">Contact Legal Team</a>
              </Button>
              <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
                <Link href="/privacy">View Privacy Policy</Link>
              </Button>
              <Button variant="outline" className="border-amber-400 text-amber-600 hover:bg-amber-50">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 pt-8 border-t border-stone-200 text-center">
            <p className="text-sm text-stone-500">
              By using Coffee Time, you acknowledge that you have read, understood, and agree to be bound
              by these Terms of Service.
            </p>
            <p className="text-xs text-stone-400 mt-4">
              Effective Date: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })} | © {new Date().getFullYear()} Coffee Time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
