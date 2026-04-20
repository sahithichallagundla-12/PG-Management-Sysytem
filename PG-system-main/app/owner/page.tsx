"use client"

import { useState } from "react"
import { Building2, Users, AlertCircle, CreditCard, TrendingUp, Star, Edit2, Save, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppState } from "@/lib/app-context"
import { useAuth } from "@/lib/auth-context"
import { getAverageFoodRating, getUserByTenantId } from "@/lib/data-store"
import { motion } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"

export default function OwnerDashboard() {
  const { currentUser } = useAuth()
  const { pgs, tenants, complaints, payments, foodRatings, users, rooms, updatePG } = useAppState()

  // Get the owner's PG (filter by current user's ID)
  const pg = pgs.find(p => p.owner_id == currentUser?.user_id) || pgs[0]

  // Calculate dynamic stats from inventory
  const pgRooms = (rooms || []).filter((r: any) => r.pg_id === pg?.pg_id)
  const totalBeds = pgRooms.reduce((sum: number, r: any) => sum + r.beds, 0)
  const occupiedBeds = (tenants || []).filter((t: any) => t.pg_id === pg?.pg_id).length
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds)

  // Real occupancy percentage
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  const pendingComplaints = (complaints || []).filter((c) => c.status === "Pending" && c.tenant_id && tenants.some(t => t.tenant_id === c.tenant_id && t.pg_id === pg?.pg_id)).length
  const inProgressComplaints = (complaints || []).filter((c) => c.status === "In Progress" && c.tenant_id && tenants.some(t => t.tenant_id === c.tenant_id && t.pg_id === pg?.pg_id)).length
  const pgTenants = (tenants || []).filter(t => t.pg_id === pg?.pg_id)
  const pendingPayments = (payments || []).filter((p) => p.status === "Pending" && pgTenants.some(t => t.tenant_id === p.tenant_id)).length
  const totalRevenue = (payments || [])
    .filter((p) => p.status === "Paid" && pgTenants.some(t => t.tenant_id === p.tenant_id))
    .reduce((sum, p) => sum + p.amount, 0)
  const avgFoodRating = getAverageFoodRating((foodRatings || []).filter(r => pgTenants.some(t => t.tenant_id === r.tenant_id)))

  // Recent complaints
  const recentComplaints = (complaints || [])
    .filter(c => pgTenants.some(t => t.tenant_id === c.tenant_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (

    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={slideUp}>
        <h1 className="text-3xl font-semibold tracking-tight text-[#0B2E33]">Dashboard</h1>
        <p className="mt-2 text-[#5F7A7E]">
          Welcome back! Here&apos;s an overview of {pg?.pg_name || "your PG"}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Total Beds</h3>
              <div className="h-10 w-10 rounded-xl bg-[#B8E3E9]/30 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#4F7C82]" />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-3xl font-semibold text-[#0B2E33]">{totalBeds}</div>
                <p className="text-xs text-[#5F7A7E] mt-1">
                  {vacantBeds} beds vacant
                </p>
                <div className="mt-2 w-full bg-[#B8E3E9]/20 rounded-full h-1.5">
                  <div 
                    className="bg-[#4F7C82] h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>


        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Total Tenants</h3>
              <div className="h-10 w-10 rounded-xl bg-[#93B1B5]/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#4F7C82]" />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-3xl font-semibold text-[#0B2E33]">{pgTenants.length}</div>
                <p className="text-xs text-[#5F7A7E] mt-1">Active residents</p>
                <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                   <div 
                    className="bg-[#4F7C82] h-1.5 rounded-full" 
                    style={{ width: `${pgTenants.length > 0 ? (pgTenants.length / totalBeds) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Complaints</h3>
              <div className="h-10 w-10 rounded-xl bg-[#FFD6A5]/25 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-[#7A4F1A]" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-[#0B2E33]">{pendingComplaints}</div>
            <p className="text-xs text-[#5F7A7E] mt-1">{inProgressComplaints} in progress</p>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Revenue</h3>
              <div className="h-10 w-10 rounded-xl bg-[#A8E6CF]/25 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#1B5E3B]" />
              </div>
            </div>
            <div className="text-3xl font-semibold text-[#1B5E3B]">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-[#5F7A7E] mt-1">{pendingPayments} payments pending</p>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* PG Overview & Food Rating */}
      <motion.div variants={slideUp} className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/30 bg-white/70 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#0B2E33]">PG Overview</CardTitle>
            <CardDescription className="text-[#5F7A7E]">Current status of your PG</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F7A7E]">PG Name</span>
                <span className="font-medium text-[#1F2D2F]">{pg?.pg_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F7A7E]">Location</span>
                <span className="font-medium text-[#1F2D2F]">{pg?.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F7A7E]">Monthly Rent</span>
                <span className="font-medium text-[#1F2D2F]">₹{pg?.rent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F7A7E]">Occupancy Rate</span>
                <span className="font-medium text-[#1F2D2F]">
                  {occupancyRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#5F7A7E]">PG Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-[#FFD6A5] text-[#FFD6A5]" />
                  <span className="font-medium text-[#1F2D2F]">{pg?.rating}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/30 bg-white/70 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#0B2E33]">Food Rating</CardTitle>
            <CardDescription className="text-[#5F7A7E]">Average rating from tenants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 fill-[#FFD6A5] text-[#FFD6A5]" />
                <span className="text-4xl font-semibold text-[#0B2E33]">{avgFoodRating}</span>
                <span className="text-xl text-[#5F7A7E]">/ 5</span>
              </div>
              <p className="mt-2 text-sm text-[#5F7A7E]">
                Based on {foodRatings.length} ratings
              </p>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(avgFoodRating)
                        ? "fill-[#FFD6A5] text-[#FFD6A5]"
                        : "text-[#D8E5E7]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Complaints */}
      <motion.div variants={slideUp}>
        <Card className="rounded-2xl border-border/30 bg-white/70 backdrop-blur-md shadow-sm">
          <CardHeader>
            <CardTitle className="text-[#0B2E33]">Recent Complaints</CardTitle>
            <CardDescription className="text-[#5F7A7E]">Latest complaints from tenants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComplaints.length === 0 ? (
                <p className="text-center text-sm text-[#5F7A7E] py-4">
                  No complaints yet
                </p>
              ) : (
                recentComplaints.map((complaint) => {
                  const tenant = tenants.find((t) => t.tenant_id === complaint.tenant_id)
                  const user = tenant ? getUserByTenantId(tenants, users, complaint.tenant_id) : null

                  return (
                    <div
                      key={complaint.complaint_id}
                      className="flex items-start justify-between rounded-2xl border border-border/30 p-4 hover:bg-[#B8E3E9]/5 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[#1F2D2F]">{complaint.title}</h4>
                          <Badge variant="outline" className="text-[#5F7A7E] border-border/40">{complaint.category}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-[#5F7A7E] line-clamp-1">
                          {complaint.description}
                        </p>
                        <p className="mt-1 text-xs text-[#5F7A7E]">
                          By {user?.name || "Unknown"} - Room {tenant?.room_number || "N/A"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          complaint.status === "Completed"
                            ? "bg-[#A8E6CF]/20 text-[#1B5E3B] border-[#A8E6CF]/40"
                            : complaint.status === "Pending"
                            ? "bg-[#FFAAA5]/20 text-[#7A2520] border-[#FFAAA5]/40"
                            : "bg-[#FFD6A5]/20 text-[#7A4F1A] border-[#FFD6A5]/40"
                        }
                      >
                        {complaint.status}
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
