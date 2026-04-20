"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight, Building2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"

export function EmailGateway() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { setGuestSession } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    
    setLoading(true)
    setTimeout(() => {
      setGuestSession(email)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#f8fafc]/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px]"
      >
        <Card className="border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] overflow-hidden bg-white px-8 pt-12 pb-14">
          <div className="text-center">
            <h2 className="text-[28px] font-bold tracking-tight text-[#1a2b4b]">
              Welcome Back
            </h2>
            <p className="mt-2 text-[#7b89a8] text-base font-medium">
              Sign in to access your portal
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1">Email</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-[12px] border-2 border-[#4b7b80]/30 bg-[#f0f4f4] focus:bg-white focus:border-[#4b7b80]/60 transition-all text-sm px-4 placeholder:text-[#94a3b8] shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="h-12 rounded-[12px] border-2 border-[#4b7b80]/30 bg-[#f0f4f4] focus:bg-white focus:border-[#4b7b80]/60 transition-all text-sm px-4 placeholder:text-[#94a3b8] shadow-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 rounded-[24px] text-sm font-bold bg-[#4b7b80] hover:bg-[#3d6266] text-white transition-all shadow-none mt-6 active:scale-[0.98]"
                disabled={loading || !email.includes("@")}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
