"use client"

import { ArrowRight, Sparkles, Github, Menu, X, Zap, Code, GitPullRequest, Rocket, CheckCircle, Clock, Shield, Users, Star } from "lucide-react"
import { useState } from "react"

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#integrations", label: "Integrations" },
    { href: "#pricing", label: "Pricing" },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#9ACD32] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0A0A0A]" />
            </div>
            <span className="text-white font-semibold text-lg">AutoIntegrate</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Reliathedisco/auto_integrate"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="/dashboard"
              className="hidden md:block px-4 py-2 bg-[#9ACD32] text-[#0A0A0A] rounded-lg hover:bg-[#88bb20] transition-colors font-medium"
            >
              Get Started
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-white/5">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/dashboard"
              className="block w-full px-4 py-2 bg-[#9ACD32] text-[#0A0A0A] rounded-lg hover:bg-[#88bb20] transition-colors text-center font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF69B4]/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#006D77]/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#9ACD32]" />
            <span className="text-sm text-gray-300">Automated API integrations that just work</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6 text-balance">
            Build integrations in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-[#9ACD32]">minutes</span> — not
            weeks
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto text-pretty">
            Automated API integrations that generate code, commit changes, and open pull requests — all from one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/sandbox"
              className="group px-8 py-4 bg-[#9ACD32] text-[#0A0A0A] rounded-lg hover:bg-[#88bb20] transition-all flex items-center gap-2 font-medium"
            >
              Generate your first PR
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/sandbox?demo=true"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              Try Demo Mode
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500">One click → a ready-to-merge PR</p>
        </div>

        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10" />
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-xl border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#FF69B4]" />
              <div className="w-3 h-3 rounded-full bg-[#9ACD32]" />
              <div className="w-3 h-3 rounded-full bg-[#006D77]" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { color: "#9ACD32", name: "Stripe", desc: "Payment processing" },
                { color: "#FF69B4", name: "Resend", desc: "Email delivery" },
                { color: "#006D77", name: "OpenAI", desc: "AI capabilities" },
              ].map((item) => (
                <div key={item.name} className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <div
                    className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: item.color }} />
                  </div>
                  <div className="text-white font-medium mb-1">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect your repo",
      description: "Link your GitHub repository with one click. We support all major frameworks.",
      icon: Github,
    },
    {
      number: "02",
      title: "Pick an integration",
      description: "Choose from 30+ pre-built integrations: Stripe, Resend, OpenAI, and more.",
      icon: Code,
    },
    {
      number: "03",
      title: "Get a PR",
      description: "We generate production-ready code and open a pull request automatically.",
      icon: GitPullRequest,
    },
    {
      number: "04",
      title: "Ship it",
      description: "Review the changes, merge, and deploy. Your integration is live.",
      icon: Rocket,
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl text-white mb-4">How it works</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Four simple steps to production-ready integrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent" />
              )}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#9ACD32]/50 transition-colors">
                <div className="text-[#9ACD32] text-sm font-mono mb-4">{step.number}</div>
                <div className="w-12 h-12 bg-[#9ACD32]/10 rounded-lg flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-[#9ACD32]" />
                </div>
                <h3 className="text-xl text-white font-medium mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: Clock,
      title: "Save hours of work",
      description: "Stop writing boilerplate. Get production-ready code in seconds.",
    },
    {
      icon: Shield,
      title: "Best practices built-in",
      description: "Every integration follows security best practices and industry standards.",
    },
    {
      icon: CheckCircle,
      title: "Type-safe code",
      description: "Full TypeScript support with proper types for all integrations.",
    },
    {
      icon: Users,
      title: "Team-friendly",
      description: "PRs make code review easy. Keep your team in the loop.",
    },
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl text-white mb-4">Why developers love it</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built by developers, for developers who value their time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-xl p-8 hover:border-[#FF69B4]/50 transition-colors"
            >
              <div className="w-12 h-12 bg-[#FF69B4]/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#FF69B4]" />
              </div>
              <h3 className="text-xl text-white font-medium mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Integrations() {
  const integrations = [
    "Stripe",
    "Resend",
    "OpenAI",
    "Anthropic",
    "Supabase",
    "MongoDB",
    "Redis",
    "AWS S3",
    "Cloudflare R2",
    "GitHub",
    "GitLab",
    "Clerk",
    "Pinecone",
    "PlanetScale",
    "SendGrid",
    "Replicate",
  ]

  return (
    <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl text-white mb-4">30+ integrations</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            All the APIs you need, ready to integrate in one click
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {integrations.map((name) => (
            <div
              key={name}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:border-[#9ACD32]/50 hover:text-white transition-colors"
            >
              {name}
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 mt-8">And many more...</p>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl text-white mb-4">Simple pricing</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Start for free, upgrade when you need more</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-xl text-white font-medium mb-2">Free</h3>
            <div className="text-4xl text-white font-bold mb-4">
              $0<span className="text-lg font-normal text-gray-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["3 integrations/month", "Public repos only", "Community support"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#9ACD32]" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/sandbox"
              className="block w-full py-3 text-center bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Get Started
            </a>
          </div>

          <div className="bg-gradient-to-b from-[#9ACD32]/10 to-transparent border border-[#9ACD32]/50 rounded-xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#9ACD32] text-[#0A0A0A] text-sm font-medium rounded-full">
              Popular
            </div>
            <h3 className="text-xl text-white font-medium mb-2">Pro</h3>
            <div className="text-4xl text-white font-bold mb-4">
              $19<span className="text-lg font-normal text-gray-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Unlimited integrations", "Private repos", "Priority support", "Custom templates"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#9ACD32]" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/sandbox"
              className="block w-full py-3 text-center bg-[#9ACD32] text-[#0A0A0A] rounded-lg hover:bg-[#88bb20] transition-colors font-medium"
            >
              Start Free Trial
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-xl text-white font-medium mb-2">Team</h3>
            <div className="text-4xl text-white font-bold mb-4">
              $49<span className="text-lg font-normal text-gray-400">/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Everything in Pro", "5 team members", "Shared templates", "Admin dashboard"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-[#9ACD32]" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/sandbox"
              className="block w-full py-3 text-center bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#9ACD32] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0A0A0A]" />
            </div>
            <span className="text-white font-semibold">AutoIntegrate</span>
          </div>

          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="https://github.com/Reliathedisco/auto_integrate" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>

          <p className="text-gray-500 text-sm">© 2024 AutoIntegrate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />
      <Hero />
      <HowItWorks />
      <Features />
      <Integrations />
      <Pricing />
      <Footer />
    </div>
  )
}
