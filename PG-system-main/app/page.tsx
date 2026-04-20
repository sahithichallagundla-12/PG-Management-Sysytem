"use client"

import Link from "next/link"
import { Building2, Search, Users, Wrench, CreditCard, Sparkles, ArrowRight, Utensils, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"
import { AnimatedCard } from "@/components/animated-card"

const features = [
  {
    icon: Building2,
    title: "Owner Dashboard",
    desc: "Complete control over rent, inventory, and staff management with real-time analytics.",
    color: "bg-[#4F7C82]/10 text-[#4F7C82]",
  },
  {
    icon: Users,
    title: "Tenant Life",
    desc: "Hassle-free stay with digital payments, food ratings, and quick support ticketing.",
    color: "bg-[#93B1B5]/20 text-[#4F7C82]",
  },
  {
    icon: Wrench,
    title: "Complaint System",
    desc: "Dedicated technical portal for plumbing, electrical, and internet support.",
    color: "bg-[#B8E3E9]/30 text-[#0B2E33]",
  },
  {
    icon: CreditCard,
    title: "Payments",
    desc: "Automated tracking, invoicing, and real-time reminders for rent collection.",
    color: "bg-[#A8E6CF]/20 text-[#1B5E3B]",
  },
  {
    icon: Utensils,
    title: "Food Menu",
    desc: "Interactive weekly menus and transparency through tenant-led quality ratings.",
    color: "bg-[#FFD6A5]/20 text-[#7A4F1A]",
  },
  {
    icon: Sparkles,
    title: "Smart Matching",
    desc: "Connect with verified roommates and build a safe, harmonious living environment.",
    color: "bg-[#4F7C82]/10 text-[#4F7C82]",
  },
  {
    icon: Home,
    title: "Online Booking",
    desc: "Browse and book PGs directly through the website. Instant confirmation and automatic registration.",
    color: "bg-[#4CAF50]/10 text-[#2E7D32]",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Floating Abstract Background Shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#B8E3E9]/40 to-[#93B1B5]/20 blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#93B1B5]/30 to-[#4F7C82]/10 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-[#B8E3E9]/30 to-[#A8E6CF]/15 blur-3xl animate-float-delayed" />
        <div className="absolute top-20 left-1/2 h-[200px] w-[200px] rounded-full bg-[#FFD6A5]/10 blur-2xl animate-float-slow" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border/30 bg-white/60 backdrop-blur-xl px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F7C82] to-[#0B2E33] shadow-md">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[#0B2E33]">SmartPG</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-[#5F7A7E] hover:text-[#0B2E33] transition-colors">Home</Link>
          <Link href="#features" className="text-sm font-medium text-[#5F7A7E] hover:text-[#0B2E33] transition-colors">Features</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex-1">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center lg:pt-32 lg:pb-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div
              variants={slideUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#B8E3E9]/50 bg-white/70 backdrop-blur-md px-5 py-2 text-sm font-medium text-[#4F7C82] shadow-sm"
            >
              <div className="h-2 w-2 rounded-full bg-[#4F7C82] animate-pulse" />
              Next Gen PG Management
            </motion.div>

            <motion.h1
              variants={slideUp}
              className="text-balance text-4xl font-semibold tracking-tight text-[#0B2E33] sm:text-5xl lg:text-6xl leading-tight"
            >
              Manage Your PG <br />
              <span className="bg-gradient-to-r from-[#4F7C82] to-[#93B1B5] bg-clip-text text-transparent">Smarter & Easier</span>
            </motion.h1>

            <motion.p
              variants={slideUp}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5F7A7E]"
            >
              A calm, minimal, and elegant approach to your PG operations. 
              Automate payments, handle maintenance, and scale effortlessly.
            </motion.p>

            <motion.div
              variants={slideUp}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link href="/get-started">
                <Button
                  size="lg"
                  className="h-13 rounded-2xl bg-[#4F7C82] px-8 text-base font-semibold text-white shadow-lg hover:bg-[#0B2E33] hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/find-pgs">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-2xl border-2 border-[#B8E3E9] bg-white/50 backdrop-blur-sm px-8 text-base font-semibold text-[#4F7C82] shadow-sm hover:bg-[#B8E3E9]/20 hover:shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Explore PGs
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="mx-auto max-w-5xl px-6 pb-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <AnimatedCard key={feature.title} className="p-6 text-left group">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} transition-colors`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-tight text-[#1F2D2F]">{feature.title}</h3>
                <p className="text-sm text-[#5F7A7E] leading-relaxed">{feature.desc}</p>
              </AnimatedCard>
            ))}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-white/40 backdrop-blur-md px-6 py-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F7C82] to-[#0B2E33]">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold text-[#0B2E33]">SmartPG</span>
          </div>
          <p className="text-sm text-[#5F7A7E]">
            © 2024 SmartPG Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
