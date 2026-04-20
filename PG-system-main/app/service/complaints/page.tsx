"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, Clock, Loader2, UserPlus, Filter, XCircle, User, Phone, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/animated-card"
import { motion } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"
import { getUserByTenantId, type ComplaintStatus, type ComplaintCategory, type Staff } from "@/lib/data-store"

const categories: ComplaintCategory[] = ["Plumbing", "Electricity", "Carpenter", "AC Technician", "Internet", "Other"]
const serviceCategories: ComplaintCategory[] = ["Plumbing", "Electricity", "Carpenter", "AC Technician", "Internet", "Other"]

export default function ServiceComplaintsPage() {
  const { currentUser } = useAuth()
  const { complaints, tenants, users, assignWorker, pgs, updateComplaintStatus, staff } = useAppState()
  
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
  const [selectedComplaint, setSelectedComplaint] = useState<typeof complaints[0] | null>(null)
  const [workerName, setWorkerName] = useState("")
  const [workerPhone, setWorkerPhone] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>(assignedCategory === "all" ? "all" : assignedCategory)
  const [activeTab, setActiveTab] = useState("in-progress")
  const [notCompletedComplaints, setNotCompletedComplaints] = useState<Set<number>>(new Set())

  // Ensure category filter matches assignment if restricted
  useEffect(() => {
    if (assignedCategory !== "all" && categoryFilter !== assignedCategory) {
      setCategoryFilter(assignedCategory)
    }
  }, [assignedCategory, categoryFilter])

  // Read complaints sent via "Not Completed" from owner portal
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notCompletedComplaints") || "[]")
    setNotCompletedComplaints(new Set(stored))
  }, [complaints])

  // Filter complaints - exclude food complaints completely
  const filterComplaints = (status: ComplaintStatus) => {
    return complaints.filter((c) => {
      const matchesStatus = c.status === status
      const isServiceCategory = serviceCategories.includes(c.category)
      const matchesCategory = categoryFilter === "all" || c.category === categoryFilter
      return matchesStatus && isServiceCategory && matchesCategory
    })
  }

  const inProgressComplaints = filterComplaints("In Progress")
  const notCompletedComplaintsList = filterComplaints("Not Completed")
  const approvedComplaints = filterComplaints("Approved")
  const checkedComplaints = filterComplaints("Checked")
  const completedComplaints = filterComplaints("Completed")

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case "Pending":
        return <AlertCircle className="h-4 w-4" />
      case "In Progress":
        return <Loader2 className="h-4 w-4" />
      case "Approved":
        return <Clock className="h-4 w-4" />
      case "Checked":
        return <CheckCircle2 className="h-4 w-4" />
      case "Not Completed":
        return <XCircle className="h-4 w-4" />
      case "Completed":
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "Pending":
        return "destructive"
      case "In Progress":
        return "default"
      case "Approved":
        return "secondary"
      case "Checked":
        return "default"
      case "Not Completed":
        return "destructive"
      case "Completed":
        return "outline"
    }
  }

  const getCategoryColor = (category: ComplaintCategory) => {
    switch (category) {
      case "Food":
        return "bg-orange-100 text-orange-800"
      case "Cleaning":
        return "bg-blue-100 text-blue-800"
      case "Plumbing":
        return "bg-cyan-100 text-cyan-800"
      case "Electricity":
        return "bg-yellow-100 text-yellow-800"
      case "Carpenter":
        return "bg-amber-100 text-amber-800"
      case "AC Technician":
        return "bg-sky-100 text-sky-800"
      case "Internet":
        return "bg-indigo-100 text-indigo-800"
      case "Other":
        return "bg-slate-100 text-slate-800"
    }
  }

  const handleAssignWorker = () => {
    if (!selectedComplaint || !workerName || !workerPhone) return

    assignWorker(selectedComplaint.complaint_id, workerName, workerPhone)
    setSelectedComplaint(null)
    setWorkerName("")
    setWorkerPhone("")
  }

  const renderComplaintList = (complaintsList: typeof complaints) => {
    if (complaintsList.length === 0) {
      return (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No complaints in this category</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {complaintsList.map((complaint) => {
          const tenant = tenants.find((t) => t.tenant_id === complaint.tenant_id)
          const user = getUserByTenantId(tenants, users, complaint.tenant_id)
          const pg = tenant ? pgs.find((p) => p.pg_id === tenant.pg_id) : null
          const complaintSource = complaint.tenant_id === 0 ? "Owner Created" : "Tenant Created"

          const isNotCompleted = notCompletedComplaints.has(complaint.complaint_id) && complaint.status === "In Progress"
          
          return (
            <div
              key={complaint.complaint_id}
              className={`flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between ${
                isNotCompleted
                  ? "border-orange-400 bg-orange-50/50"
                  : ""
              }`}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{complaint.title}</h4>
                    {notCompletedComplaints.has(complaint.complaint_id) && complaint.status === "In Progress" && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Re-raised
                      </Badge>
                    )}
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${getCategoryColor(
                      complaint.category
                    )}`}
                  >
                    {complaint.category}
                  </span>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 ${
                      complaint.status === "Completed"
                        ? "bg-success/20 text-success-foreground border-success/30"
                        : complaint.status === "Pending" || complaint.status === "Not Completed"
                        ? "bg-destructive/20 text-destructive border-destructive/30"
                        : complaint.status === "Checked"
                        ? "bg-blue-500/20 text-blue-700 border-blue-500/30"
                        : "bg-warning/20 text-warning-foreground border-warning/30"
                    }`}
                  >
                    {getStatusIcon(complaint.status)}
                    <span className="ml-1">{complaint.status}</span>
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {complaint.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span>Room: {tenant?.room_number || "N/A"}</span>
                  <span>PG: {pg?.pg_name || "Unknown"} ({pg?.location || "Unknown Location"})</span>
                  <span>Source: {complaintSource}</span>
                  <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
                {complaint.worker_name && (
                  <div className="mt-2 rounded bg-muted p-2 text-sm">
                    <span className="font-medium">Assigned Worker:</span>{" "}
                    {complaint.worker_name} ({complaint.worker_phone})
                  </div>
                )}
              </div>
              {(complaint.status === "In Progress" || complaint.status === "Not Completed") && (
                <Button
                  size="sm"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Assign Worker
                </Button>
              )}
              {complaint.status === "Approved" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateComplaintStatus(complaint.complaint_id, "Checked")}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Mark as Checked
                </Button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {assignedCategory !== "all" ? `${assignedCategory} Complaints Management` : "Complaints Management"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {assignedCategory !== "all" 
            ? `View and assign workers to ${assignedCategory.toLowerCase()} complaints`
            : "View and assign workers to all complaints"}
        </p>
      </div>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6 grid gap-4 sm:grid-cols-5">
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Awaiting Assignment</h3>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {complaints.filter((c) => c.status === "In Progress" && serviceCategories.includes(c.category)).length}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Not Completed</h3>
              <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {complaints.filter((c) => c.status === "Not Completed" && serviceCategories.includes(c.category)).length}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Work In Progress</h3>
              <div className="h-8 w-8 rounded-full bg-secondary/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-secondary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-secondary-foreground">
              {complaints.filter((c) => c.status === "Approved" && serviceCategories.includes(c.category)).length}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Work Done</h3>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-yellow-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-700">
              {complaints.filter((c) => c.status === "Checked" && serviceCategories.includes(c.category)).length}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Completed</h3>
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-success-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-success-foreground">
              {complaints.filter((c) => c.status === "Completed" && serviceCategories.includes(c.category)).length}
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Category Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Category:</span>
        </div>
        <Select 
          value={categoryFilter} 
          onValueChange={setCategoryFilter}
          disabled={assignedCategory !== "all"}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {assignedCategory === "all" ? (
              <>
                <SelectItem value="all">All Categories</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </>
            ) : (
              <SelectItem value={assignedCategory}>{assignedCategory}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Complaints Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="in-progress" className="flex items-center gap-2">
            <Loader2 className="h-4 w-4" />
            Awaiting Assignment
            <Badge variant="secondary" className="ml-1">
              {inProgressComplaints.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="not-completed" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Not Completed
            <Badge variant="secondary" className="ml-1">
              {notCompletedComplaintsList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Progress
            <Badge variant="secondary" className="ml-1">
              {approvedComplaints.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="checked" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Work Done
            <Badge variant="secondary" className="ml-1">
              {checkedComplaints.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completed
            <Badge variant="secondary" className="ml-1">
              {completedComplaints.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "in-progress"
                ? "Complaints Awaiting Worker Assignment"
                : activeTab === "not-completed"
                ? "Not Completed Complaints - Needs Re-work"
                : activeTab === "approved"
                ? "Complaints Being Worked On"
                : activeTab === "checked"
                ? "Work Completed - Awaiting Owner Decision"
                : "Completed Complaints"}
            </CardTitle>
            <CardDescription>
              {activeTab === "in-progress"
                ? "Assign workers to these complaints"
                : activeTab === "not-completed"
                ? "Owner marked these as not complete - assign worker to fix"
                : activeTab === "approved"
                ? "Workers have been assigned and work is in progress"
                : activeTab === "checked"
                ? "Work is done, waiting for owner to mark as Complete or Not Complete"
                : "These complaints have been resolved"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="in-progress" className="mt-0">
              {renderComplaintList(inProgressComplaints)}
            </TabsContent>
            <TabsContent value="not-completed" className="mt-0">
              {renderComplaintList(notCompletedComplaintsList)}
            </TabsContent>
            <TabsContent value="approved" className="mt-0">
              {renderComplaintList(approvedComplaints)}
            </TabsContent>
            <TabsContent value="checked" className="mt-0">
              {renderComplaintList(checkedComplaints)}
            </TabsContent>
            <TabsContent value="completed" className="mt-0">
              {renderComplaintList(completedComplaints)}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* Assign Worker Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Worker</DialogTitle>
            <DialogDescription>
              Assign a worker to handle this complaint
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold">{selectedComplaint.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedComplaint.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${getCategoryColor(
                      selectedComplaint.category
                    )}`}
                  >
                    {selectedComplaint.category}
                  </span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <div>
                      <span className="font-medium">Source:</span> {selectedComplaint.tenant_id === 0 ? "Owner Created" : "Tenant Created"}
                    </div>
                    {(() => {
                      const tenant = tenants.find((t) => t.tenant_id === selectedComplaint.tenant_id)
                      const pg = tenant ? pgs.find((p) => p.pg_id === tenant.pg_id) : null
                      return pg ? (
                        <div>
                          <span className="font-medium">PG:</span> {pg.pg_name} ({pg.location})
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Quick Select Specialist</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {staff
                      .filter(s => s.category === selectedComplaint.category)
                      .map((worker) => (
                        <Button
                          key={worker.staff_id}
                          variant="outline"
                          disabled={worker.status !== "Available"}
                          className={`h-auto flex flex-col items-start p-3 rounded-xl transition-all relative ${
                            workerName === worker.name 
                              ? "border-[#4F7C82] bg-[#4F7C82]/5" 
                              : worker.status !== "Available"
                              ? "opacity-50 grayscale bg-muted/20"
                              : "border-border/40 hover:border-[#4F7C82]/50"
                          }`}
                          onClick={() => {
                            setWorkerName(worker.name)
                            setWorkerPhone(worker.phone)
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-semibold text-xs">{worker.name}</span>
                            {workerName === worker.name && <Check className="h-3 w-3 text-[#4F7C82]" />}
                          </div>
                          
                          <div className="flex items-center justify-between w-full mt-1">
                            <span className="text-[10px] text-[#5F7A7E]">{worker.phone}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-[8px] px-1 py-0 h-4 border-none bg-transparent flex items-center gap-1 ${
                                worker.status === "Available" ? "text-emerald-500" : worker.status === "Busy" ? "text-amber-500" : "text-slate-400"
                              }`}
                            >
                              <div className={`h-1 w-1 rounded-full ${
                                worker.status === "Available" ? "bg-emerald-500" : worker.status === "Busy" ? "bg-amber-500" : "bg-slate-400"
                              }`} />
                              {worker.status}
                            </Badge>
                          </div>
                        </Button>
                      ))}
                    {staff.filter(s => s.category === selectedComplaint.category && s.status === "Available").length === 0 && (
                      <p className="col-span-2 text-xs text-center text-[#5F7A7E] py-2 bg-muted/30 rounded-lg">
                        No available experts for this category.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-border/10">
                  <div className="space-y-2">
                    <Label htmlFor="workerName">Worker Name</Label>
                    <Input
                      id="workerName"
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      placeholder="Enter worker name"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workerPhone">Worker Phone</Label>
                    <Input
                      id="workerPhone"
                      value={workerPhone}
                      onChange={(e) => setWorkerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignWorker}
                  disabled={!workerName || !workerPhone}
                >
                  Assign Worker
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
