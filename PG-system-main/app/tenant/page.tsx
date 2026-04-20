"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Home, Utensils, AlertCircle, CreditCard, Users, Star, ArrowRight, Coffee, Sun, Moon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/animated-card"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"
import { motion } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"

export default function TenantDashboard() {

  const { currentUser } = useAuth()
  const { tenants, complaints, payments, users, foodMenu, loading } = useAppState()

  // Get current tenant by matching user email
  const tenant = tenants.find((t) => {
    const user = users.find((u) => u.user_id === t.user_id)
    return user?.email === currentUser?.email
  })

  // Filter complaints for this tenant
  const myComplaints = complaints.filter(
    (c) => c.tenant_id === tenant?.tenant_id
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const pendingComplaints = myComplaints.filter(
    (c) => c.status !== "Completed"
  )

  const latestComplaint = pendingComplaints[0]

  // Filter payments for this tenant
  const myPayments = payments.filter((p) => p.tenant_id === tenant?.tenant_id)
  
  // Find roommates (other tenants in the same PG and room)
  const roommates = tenants.filter(
    (t) => 
      t.pg_id === tenant?.pg_id && 
      t.room_number === tenant?.room_number && 
      t.tenant_id !== tenant?.tenant_id
  ).map(t => ({
    ...t,
    user: users.find(u => u.user_id === t.user_id)
  }))

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const todayMeals = foodMenu.filter(m => m.day_of_week === today)

  const tenantUser = users.find((u) => u.user_id === tenant?.user_id)

  const quickActions = [
    { label: "Pay Rent", icon: CreditCard, href: "/tenant/payments", color: "bg-emerald-50 text-emerald-600" },
    { label: "Raise Complaint", icon: AlertCircle, href: "/tenant/complaints", color: "bg-rose-50 text-rose-600" },
    { label: "Food Menu", icon: Utensils, href: "/tenant/food", color: "bg-amber-50 text-amber-600" },
    { label: "My Room", icon: Home, href: "/tenant/room", color: "bg-blue-50 text-blue-600" },
  ]

  const hasPaidRoom = myPayments.some(p => p.type === "Room" && p.status === "Paid")
  const hasPaidFood = myPayments.some(p => p.type === "Food" && p.status === "Paid")
  const isFullyPaid = hasPaidRoom && hasPaidFood

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header with Background Glow */}
      <motion.div variants={slideUp} className="relative">
        <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-3xl" />
        <h1 className="text-4xl font-bold tracking-tight text-[#0B2E33]">
          Hello, {tenantUser?.name || currentUser?.name}
        </h1>
        <p className="mt-2 text-[#5F7A7E] flex items-center gap-2">
          <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
          Everything looks great with your stay today
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <AnimatedCard>
          <div className="p-6">
            <h3 className="text-sm text-[#5F7A7E]">Room</h3>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-[#0B2E33]">{tenant?.room_number || "N/A"}</div>
              <Badge variant="outline" className="text-[10px] h-4 px-1 border-emerald-100 text-emerald-600 bg-emerald-50">
                {tenant?.room_type || "Shared"}
              </Badge>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <h3 className="text-sm text-[#5F7A7E]">Roommates</h3>
            <div className="text-3xl font-bold text-[#0B2E33]">{roommates.length}</div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <h3 className="text-sm text-[#5F7A7E]">Active Complaints</h3>
            <div className="text-3xl font-bold text-[#0B2E33]">{pendingComplaints.length}</div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <h3 className="text-sm text-[#5F7A7E]">Payment Status</h3>
            <div className="mt-1">
              {isFullyPaid ? (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-3 py-1">
                  Paid
                </Badge>
              ) : (
                <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none px-3 py-1">
                  {hasPaidRoom || hasPaidFood ? "Partially Paid" : "Unpaid"}
                </Badge>
              )}
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Bottom Layout: Food Menu & Quick Actions */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Today's Specials Card */}
        <motion.div variants={slideUp} className="lg:col-span-2">
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-sm overflow-hidden relative h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-[#0B2E33]">Today&apos;s Menu</CardTitle>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium">{today}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border border-slate-50 transition-all">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Coffee className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Breakfast</p>
                  <p className="font-semibold text-[#0B2E33]">{todayMeals.find(m => m.meal_type === "Breakfast")?.items || "Standard Breakfast"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border border-slate-50 transition-all">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <Sun className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lunch</p>
                  <p className="font-semibold text-[#0B2E33]">{todayMeals.find(m => m.meal_type === "Lunch")?.items || "Executive Lunch"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/50 border border-slate-50 transition-all">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Moon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dinner</p>
                  <p className="font-semibold text-[#0B2E33]">{todayMeals.find(m => m.meal_type === "Dinner")?.items || "Signature Dinner"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Card */}
        <motion.div variants={slideUp}>
          <Card className="border-none shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks & links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              {quickActions.map((action, i) => (
                <Link key={i} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm transition-all border border-transparent hover:border-slate-100 ${action.color}`}
                  >
                    <div className="rounded-xl bg-white/50 p-2">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{action.label}</span>
                    <ArrowRight className="ml-auto h-4 w-4 opacity-30" />
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}