"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Clock, Loader2, ArrowRight, Wrench, Zap, Hammer, Droplets, Brush, AirVent, Wifi, XCircle, UserPlus, Check, ArrowLeft, Filter, Phone, User, LayoutGrid, Calendar, Building, Home, UserCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/animated-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"
import { getUserByTenantId, type ComplaintStatus, type ComplaintCategory, type Staff } from "@/lib/data-store"
import { motion, AnimatePresence } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ServiceDashboard() {
  const { currentUser } = useAuth()
  const { complaints, tenants, users, staff, assignWorker, pgs } = useAppState()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | null>(null)
  const [detailStatus, setDetailStatus] = useState<ComplaintStatus | "All">("All")
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null)
  const [workerName, setWorkerName] = useState("")
  const [workerPhone, setWorkerPhone] = useState("")

  // Sync selectedCategory with URL param
  useEffect(() => {
    const catParam = searchParams.get("category")
    if (catParam) {
      setSelectedCategory(catParam as ComplaintCategory)
    } else {
      setSelectedCategory(null)
    }
  }, [searchParams])

  const handleCategorySelection = (cat: ComplaintCategory | null) => {
    if (cat) {
      router.push(`/service?category=${encodeURIComponent(cat)}`)
    } else {
      router.push("/service")
    }
  }

  // Determine assigned category based on email/role
  const getAssignedCategory = () => {
    if (!currentUser) return "all"
    const info = (currentUser.email + " " + (currentUser.role || "")).toLowerCase()
    if (info.includes("electrical") || info.includes("electricity")) return "Electricity"
    if (info.includes("plumbing")) return "Plumbing"
    if (info.includes("carpenter")) return "Carpenter"
    if (info.includes("ac")) return "AC Technician"
    if (info.includes("internet")) return "Internet"
    if (info.includes("cleaning")) return "Cleaning"
    return "all"
  }

  const assignedCategory = getAssignedCategory()

  const handleAssignWorker = () => {
    if (!selectedComplaint || !workerName || !workerPhone) return
    assignWorker(selectedComplaint.complaint_id, workerName, workerPhone)
    setSelectedComplaint(null)
    setWorkerName("")
    setWorkerPhone("")
  }

  // Filter complaints based on assignment (Overview stats)
  // Reraised / Not Completed
  const reraisedCountTotal = complaints.filter(c => (c.status === "Reraised" || c.status === "Not Completed") && (assignedCategory === "all" || c.category === assignedCategory)).length
  
  // Awaiting Worker (status is In Progress because it's been sent to service but not assigned a worker)
  const awaitingWorkerTotal = complaints.filter(c => c.status === "In Progress" && (assignedCategory === "all" || c.category === assignedCategory)).length
  
  // Work In Progress / Assigned (status is Approved or Checked)
  const assignedTotal = complaints.filter(c => (c.status === "Approved" || c.status === "Checked") && (assignedCategory === "all" || c.category === assignedCategory)).length
  
  // Completed
  const completedTotal = complaints.filter(c => c.status === "Completed" && (assignedCategory === "all" || c.category === assignedCategory)).length

  // Sub-dashboard calculations (for selectedCategory)
  const categoryComplaints = complaints.filter(c => c.category === selectedCategory)
  const catStats = {
    awaiting: categoryComplaints.filter(c => c.status === "In Progress").length,
    notCompleted: categoryComplaints.filter(c => c.status === "Not Completed").length,
    wip: categoryComplaints.filter(c => c.status === "Approved").length,
    workDone: categoryComplaints.filter(c => c.status === "Checked").length,
    completed: categoryComplaints.filter(c => c.status === "Completed").length,
  }

  const displayComplaints = categoryComplaints.filter(c => detailStatus === "All" || c.status === detailStatus)

  // Category counts (Only count active service complaints: In Progress, Approved, Checked, Not Completed, Reraised)
  const getCategoryCount = (category: ComplaintCategory) => 
    complaints.filter(c => 
      c.category === category && 
      ["In Progress", "Approved", "Checked", "Not Completed", "Reraised"].includes(c.status)
    ).length

  const categoryStats = [
    { id: "Electricity" as ComplaintCategory, name: "Electricity", count: getCategoryCount("Electricity"), icon: Zap, color: "text-amber-500", bg: "bg-amber-50", activeBg: "bg-amber-100", border: "border-amber-200" },
    { id: "Carpenter" as ComplaintCategory, name: "Carpenter", count: getCategoryCount("Carpenter"), icon: Hammer, color: "text-orange-600", bg: "bg-orange-50", activeBg: "bg-orange-100", border: "border-orange-200" },
    { id: "Plumbing" as ComplaintCategory, name: "Plumbing", count: getCategoryCount("Plumbing"), icon: Droplets, color: "text-blue-500", bg: "bg-blue-50", activeBg: "bg-blue-100", border: "border-blue-200" },
    { id: "Cleaning" as ComplaintCategory, name: "Cleaning", count: getCategoryCount("Cleaning"), icon: Brush, color: "text-emerald-500", bg: "bg-emerald-50", activeBg: "bg-emerald-100", border: "border-emerald-200" },
    { id: "AC Technician" as ComplaintCategory, name: "AC Tech", count: getCategoryCount("AC Technician"), icon: AirVent, color: "text-cyan-500", bg: "bg-cyan-50", activeBg: "bg-cyan-100", border: "border-cyan-200" },
    { id: "Internet" as ComplaintCategory, name: "Internet", count: getCategoryCount("Internet"), icon: Wifi, color: "text-indigo-500", bg: "bg-indigo-50", activeBg: "bg-indigo-100", border: "border-indigo-200" },
  ]

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case "Pending": return <AlertCircle className="h-4 w-4" />
      case "In Progress": return <Loader2 className="h-4 w-4" />
      case "Approved": return <Clock className="h-4 w-4" />
      case "Completed": return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: ComplaintCategory) => {
    switch (category) {
      case "Food": return "bg-[#FFD6A5]/20 text-[#7A4F1A]"
      case "Cleaning": return "bg-[#B8E3E9]/20 text-[#4F7C82]"
      case "Plumbing": return "bg-[#93B1B5]/20 text-[#4F7C82]"
      case "Electricity": return "bg-[#FFD6A5]/30 text-[#7A4F1A]"
      case "Carpenter": return "bg-[#FFD6A5]/20 text-[#7A4F1A]"
      case "AC Technician": return "bg-[#B8E3E9]/30 text-[#0B2E33]"
      case "Internet": return "bg-[#4F7C82]/10 text-[#4F7C82]"
      case "Other": return "bg-[#1F2D2F]/10 text-[#1F2D2F]"
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <motion.div variants={slideUp}>
              <h1 className="text-3xl font-semibold tracking-tight text-[#0B2E33]">
                {assignedCategory !== "all" ? `${assignedCategory} Service Dashboard` : "Service Dashboard"}
              </h1>
              <p className="mt-2 text-[#5F7A7E]">
                {assignedCategory !== "all" 
                  ? `Manage and assign workers to ${assignedCategory.toLowerCase()} complaints`
                  : "Manage and assign workers to all complaints"}
              </p>
            </motion.div>

            {/* Overview Stats */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatedCard>
                <div className="p-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Reraised</h3>
                    <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-red-600">{reraisedCountTotal}</div>
                  <p className="text-xs text-[#5F7A7E] mt-1">Immediate action needed</p>
                </div>
              </AnimatedCard>
              <AnimatedCard>
                <div className="p-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Awaiting Assignment</h3>
                    <div className="h-10 w-10 rounded-xl bg-[#B8E3E9]/30 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-[#4F7C82]" />
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-[#4F7C82]">{awaitingWorkerTotal}</div>
                  <p className="text-xs text-[#5F7A7E] mt-1">Need worker assignment</p>
                </div>
              </AnimatedCard>
              <AnimatedCard>
                <div className="p-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Work In Progress</h3>
                    <div className="h-10 w-10 rounded-xl bg-[#FFD6A5]/25 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-[#7A4F1A]" />
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-[#7A4F1A]">{assignedTotal}</div>
                  <p className="text-xs text-[#5F7A7E] mt-1">Workers at site</p>
                </div>
              </AnimatedCard>
              <AnimatedCard>
                <div className="p-6">
                  <div className="flex flex-row items-center justify-between pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-[#5F7A7E]">Completed</h3>
                    <div className="h-10 w-10 rounded-xl bg-[#A8E6CF]/25 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-[#1B5E3B]" />
                    </div>
                  </div>
                  <div className="text-3xl font-semibold text-[#1B5E3B]">{completedTotal}</div>
                  <p className="text-xs text-[#5F7A7E] mt-1">Total resolved</p>
                </div>
              </AnimatedCard>
            </motion.div>

            {/* Categories Selection */}
            <motion.div variants={slideUp} className="space-y-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-[#4F7C82]" />
                <h2 className="text-xl font-semibold text-[#0B2E33]">Complaints by Category</h2>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {categoryStats.map((cat) => {
                  return (
                    <AnimatedCard key={cat.name}>
                      <div 
                        onClick={() => {
                          handleCategorySelection(cat.id)
                          setDetailStatus("All")
                        }}
                        className={`p-6 flex flex-col items-center text-center space-y-3 cursor-pointer transition-all duration-300 rounded-2xl border-2 bg-white border-transparent hover:border-border/50 hover:shadow-md hover:-translate-y-1`}
                      >
                        <div className={`h-14 w-14 rounded-2xl ${cat.bg} flex items-center justify-center transition-colors duration-300`}>
                          <cat.icon className={`h-7 w-7 ${cat.color}`} />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-[#0B2E33]">{cat.count}</div>
                          <p className="text-sm font-semibold text-[#4F7C82]">{cat.name}</p>
                          <p className="text-xs text-[#5F7A7E] mt-1">Click to view detailed metrics</p>
                        </div>
                      </div>
                    </AnimatedCard>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Header Area */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCategorySelection(null)}
                className="text-[#4F7C82] hover:bg-[#B8E3E9]/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              
              <div className="flex flex-col items-center sm:items-start group">
                <div className="flex items-center gap-3">
                  {categoryStats.find(s => s.id === selectedCategory)?.icon && (
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                      {(() => {
                        const Icon = categoryStats.find(s => s.id === selectedCategory)!.icon
                        return <Icon className="h-6 w-6" />
                      })()}
                    </div>
                  )}
                  <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight">
                    {selectedCategory}
                  </h1>
                </div>
                <div className="h-1 w-16 bg-emerald-600 rounded-full mt-2 transition-all duration-300 group-hover:w-24" />
                <p className="text-sm text-emerald-800/60 mt-3 font-medium">
                  Comprehensive management for all {selectedCategory.toLowerCase()} services
                </p>
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-5">
              {[
                { label: "Awaiting Worker", count: catStats.awaiting, icon: Loader2, color: "text-blue-600", bg: "bg-blue-50", status: "In Progress" },
                { label: "Not Completed", count: catStats.notCompleted, icon: XCircle, color: "text-red-500", bg: "bg-red-50", status: "Not Completed" },
                { label: "Assigned", count: catStats.wip, icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50", status: "Approved" },
                { label: "Work Done", count: catStats.workDone, icon: CheckCircle2, color: "text-yellow-600", bg: "bg-yellow-50", status: "Checked" },
                { label: "Completed", count: catStats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", status: "Completed" },
              ].map((stat) => (
                <AnimatedCard key={stat.label}>
                  <div className="p-6">
                    <div className="flex flex-row items-center justify-between pb-2">
                      <h3 className="tracking-tight text-[10px] font-medium text-[#5F7A7E] uppercase">{stat.label}</h3>
                      <div className={`h-8 w-8 rounded-full ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                  </div>
                </AnimatedCard>
              ))}
            </motion.div>

            {/* Status Tabs/Pills */}
            <motion.div variants={slideUp} className="flex flex-wrap items-center gap-2 bg-white/50 p-1 rounded-2xl border border-border/10 backdrop-blur-sm">
              <button 
                onClick={() => setDetailStatus("All")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  detailStatus === "All" ? "bg-[#4F7C82] text-white shadow-sm" : "text-[#5F7A7E] hover:bg-white"
                }`}
              >
                All Complaints
                <Badge variant={detailStatus === "All" ? "secondary" : "outline"} className="ml-1 px-1.5 py-0 min-w-5 h-5 flex justify-center">{categoryComplaints.length}</Badge>
              </button>
              {[
                { label: "Awaiting Assignment", status: "In Progress", icon: Loader2 },
                { label: "Not Completed", status: "Not Completed", icon: XCircle },
                { label: "In Progress", status: "Approved", icon: Clock },
                { label: "Work Done", status: "Checked", icon: CheckCircle2 },
                { label: "Completed", status: "Completed", icon: CheckCircle2 }
              ].map((pill) => (
                <button 
                  key={pill.label}
                  onClick={() => setDetailStatus(pill.status as ComplaintStatus)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    detailStatus === pill.status ? "bg-[#4F7C82] text-white shadow-sm" : "text-[#5F7A7E] hover:bg-white"
                  }`}
                >
                  <pill.icon className="h-4 w-4" />
                  {pill.label}
                  <Badge variant={detailStatus === pill.status ? "secondary" : "outline"} className="ml-1 px-1.5 py-0 min-w-5 h-5 flex justify-center">
                    {categoryComplaints.filter(c => c.status === pill.status).length}
                  </Badge>
                </button>
              ))}
            </motion.div>

            {/* Detailed Complaints List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="rounded-2xl border-border/30 bg-white/70 backdrop-blur-md shadow-sm overflow-hidden">
                <CardHeader className="border-b border-border/10 bg-emerald-50/50">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <CardTitle className="text-xl font-bold text-emerald-900">
                      {detailStatus === "All" ? `${selectedCategory} Operations Center` : `${selectedCategory}: ${detailStatus}`}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-emerald-800/60 font-medium">Review, track, and dispatch specialists for these issues</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {displayComplaints.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/20">
                          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg text-[#0B2E33]">All clear!</h3>
                        <p className="text-[#5F7A7E]">No {detailStatus !== "All" ? detailStatus.toLowerCase() : ""} complaints found.</p>
                      </div>
                    ) : (
                      displayComplaints.map((complaint) => {
                        const tenant = tenants.find(t => t.tenant_id === complaint.tenant_id)
                        const user = getUserByTenantId(tenants, users, complaint.tenant_id)
                        const pg = tenant ? pgs.find(p => p.pg_id === tenant.pg_id) : null
                        
                        return (
                          <div key={complaint.complaint_id} className="group relative rounded-2xl border border-emerald-100 p-6 bg-white hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
                             <div className="absolute top-0 right-0 p-4">
                               <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <ArrowRight className="h-4 w-4" />
                               </div>
                             </div>
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <h4 className="text-lg font-bold text-[#0B2E33] leading-tight">{complaint.title}</h4>
                                  <Badge variant="outline" className="bg-[#B8E3E9]/20 text-[#4F7C82] border-none rounded-lg px-2">
                                    {complaint.category}
                                  </Badge>
                                  <Badge variant="outline" className={`flex items-center gap-1 rounded-lg ${
                                    complaint.status === "In Progress" || complaint.status === "Pending" ? "bg-[#FFD6A5]/30 text-[#7A4F1A] border-none" : 
                                    complaint.status === "Approved" ? "bg-blue-100 text-blue-700 border-none" : 
                                    complaint.status === "Checked" ? "bg-yellow-100 text-yellow-700 border-none" :
                                    complaint.status === "Completed" ? "bg-emerald-100 text-emerald-700 border-none" : 
                                    complaint.status === "Not Completed" ? "bg-red-100 text-red-700 border-none" : "bg-muted text-muted-foreground"
                                  }`}>
                                    {getStatusIcon(complaint.status)}
                                    {complaint.status === "In Progress" ? "Awaiting Worker" : 
                                     complaint.status === "Approved" ? "Assigned" : 
                                     complaint.status}
                                  </Badge>
                                </div>
                                <p className="text-[#5F7A7E] text-sm leading-relaxed">{complaint.description}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                  <div className="flex items-center gap-2 text-xs text-[#5F7A7E]">
                                    <Home className="h-3 w-3" />
                                    <span>Room: {tenant?.room_number || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-[#5F7A7E]">
                                    <Building className="h-3 w-3" />
                                    <span>PG: {pg?.pg_name || "Unknown"}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-[#5F7A7E]">
                                    <User className="h-3 w-3" />
                                    <span>Source: {complaint.tenant_id === 0 ? "Owner" : (user?.name || "Tenant")}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-[#5F7A7E]">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 min-w-[140px]">
                                {(complaint.status === "In Progress" || complaint.status === "Not Completed") && (
                                  <Button 
                                    size="sm" 
                                    className="w-full bg-[#4F7C82] hover:bg-[#0B2E33] text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                                    onClick={() => setSelectedComplaint(complaint)}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                    Assign Worker
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Worker Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0B2E33]">Assign Professional Worker</DialogTitle>
            <DialogDescription className="text-[#5F7A7E]">Choose an available specialist for this task</DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#B8E3E9]/10 p-4 border border-[#B8E3E9]/20">
                <h4 className="font-bold text-[#0B2E33]">{selectedComplaint.title}</h4>
                <p className="mt-1 text-xs text-[#5F7A7E]">{selectedComplaint.description}</p>
                <div className="mt-2 text-[10px] text-[#4F7C82] flex gap-2">
                  <span className="font-semibold uppercase tracking-wider">{selectedComplaint.category}</span>
                  <span>•</span>
                  <span>ID: #{selectedComplaint.complaint_id}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[#0B2E33] font-semibold">Select Available Specialist</Label>
                <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-hide">
                  {staff
                    .filter(s => s.category === selectedComplaint.category)
                    .map((worker) => (
                      <button
                        key={worker.staff_id}
                        disabled={worker.status !== "Available"}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          workerName === worker.name 
                            ? "border-[#4F7C82] bg-[#4F7C82]/5" 
                            : worker.status !== "Available"
                            ? "opacity-50 bg-muted cursor-not-allowed"
                            : "border-border/30 hover:border-[#4F7C82]/50 hover:bg-white"
                        }`}
                        onClick={() => {
                          setWorkerName(worker.name)
                          setWorkerPhone(worker.phone)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${workerName === worker.name ? "bg-[#4F7C82] text-white" : "bg-[#B8E3E9]/20 text-[#4F7C82]"}`}>
                            {worker.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#0B2E33]">{worker.name}</p>
                            <p className="text-[10px] text-[#5F7A7E]">{worker.phone}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`rounded-lg border-none ${worker.status === "Available" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                          {worker.status}
                        </Badge>
                      </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/10 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-[#5F7A7E]">Name</Label>
                    <Input value={workerName} readOnly className="rounded-xl bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-[#5F7A7E]">Contact</Label>
                    <Input value={workerPhone} readOnly className="rounded-xl bg-muted/30" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" className="rounded-xl" onClick={() => setSelectedComplaint(null)}>Cancel</Button>
                <Button 
                  className="rounded-xl bg-[#4F7C82] hover:bg-[#0B2E33] text-white px-8"
                  disabled={!workerName}
                  onClick={handleAssignWorker}
                >
                  Assign Worker
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
