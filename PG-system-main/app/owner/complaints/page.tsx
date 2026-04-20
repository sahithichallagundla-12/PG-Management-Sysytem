"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Send, Filter, CheckCircle2, Clock, Loader2, Plus, RotateCcw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/animated-card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppState } from "@/lib/app-context"
import { getUserByTenantId, type ComplaintCategory, type ComplaintStatus } from "@/lib/data-store"

const categories: ComplaintCategory[] = ["Food", "Cleaning", "Plumbing", "Electricity", "Carpenter", "AC Technician", "Internet", "Other"]
const statuses: ComplaintStatus[] = ["Pending", "In Progress", "Approved", "Completed"]

export default function ComplaintsPage() {
  const {
    complaints,
    tenants,
    users,
    updateComplaintStatus,
    updateComplaintCategory,
    addComplaint,
  } = useAppState()

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedComplaint, setSelectedComplaint] = useState<typeof complaints[0] | null>(null)
  const [isCreatingComplaint, setIsCreatingComplaint] = useState(false)
  const [showNonDefaultOnly, setShowNonDefaultOnly] = useState(false)
  const [resolvedComplaints, setResolvedComplaints] = useState<Set<number>>(new Set())
  const [reopenedComplaints, setReopenedComplaints] = useState<Set<number>>(new Set())
  const [sentToService, setSentToService] = useState<Set<number>>(new Set())
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "Other" as ComplaintCategory,
    isDefaultComplaint: false
  })

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter
    const matchesDefaultFilter = !showNonDefaultOnly || c.tenant_id === 0
    return matchesStatus && matchesCategory && matchesDefaultFilter
  })

  // Check if complaint has been resolved (not pending anymore)
  const isComplaintResolved = (status: ComplaintStatus) => {
    return !["Pending"].includes(status)
  }

  // Sort by date (newest first)
  const sortedComplaints = [...filteredComplaints].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Group complaints by status for tabs
  const pendingComplaints = complaints.filter((c) => c.status === "Pending")
  const inProgressComplaints = complaints.filter((c) => c.status === "In Progress")
  const notCompletedComplaintsList = complaints.filter((c) => c.status === "Not Completed")
  const approvedComplaints = complaints.filter((c) => c.status === "Approved")
  const checkedComplaints = complaints.filter((c) => c.status === "Checked")
  const completedComplaints = complaints.filter((c) => c.status === "Completed")

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

  const handleSendToService = (complaintId: number, asNotCompleted = false) => {
    updateComplaintStatus(complaintId, asNotCompleted ? "Not Completed" : "In Progress")
    // Track that this complaint was sent to service (not self-service)
    setSentToService(prev => new Set(prev).add(complaintId))
    if (asNotCompleted) {
      // Mark as sent via "Not Completed" for service portal
      const notCompletedComplaints = JSON.parse(localStorage.getItem("notCompletedComplaints") || "[]")
      if (!notCompletedComplaints.includes(complaintId)) {
        notCompletedComplaints.push(complaintId)
        localStorage.setItem("notCompletedComplaints", JSON.stringify(notCompletedComplaints))
      }
    }
  }

  const handleMarkCompleted = (complaintId: number) => {
    updateComplaintStatus(complaintId, "Completed")
    setResolvedComplaints(prev => new Set(prev).add(complaintId))
  }

  const handleResolveByOwner = (complaintId: number) => {
    updateComplaintStatus(complaintId, "Approved") // Mark as resolved by owner, waiting for tenant confirmation
    setResolvedComplaints(prev => new Set(prev).add(complaintId))
  }

  const handleRetrieveFromService = (complaintId: number) => {
    updateComplaintStatus(complaintId, "Pending") // Pull back from service portal to pending status
  }

  const handleCreateComplaint = () => {
    if (!newComplaint.title || !newComplaint.description) return

    // Create a complaint on behalf of the owner (using tenant_id 0 as placeholder)
    addComplaint({
      tenant_id: 0, // Special ID for owner-created complaints
      title: newComplaint.title,
      description: newComplaint.description,
      category: newComplaint.category,
      status: "Pending",
      worker_name: null,
      worker_phone: null
    })

    // Reset form
    setNewComplaint({
      title: "",
      description: "",
      category: "Other",
      isDefaultComplaint: false
    })
    setIsCreatingComplaint(false)
  }

  // Track reopened complaints (completed -> pending)
  useEffect(() => {
    const reopened = new Set<number>()
    complaints.forEach(complaint => {
      // Check if this complaint was previously completed and is now pending
      const tenant = tenants.find(t => t.tenant_id === complaint.tenant_id)
      if (tenant && complaint.status === "Pending") {
        reopened.add(complaint.complaint_id)
      }
    })
    setReopenedComplaints(reopened)
  }, [complaints, tenants])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Complaints</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and track tenant complaints
        </p>
      </div>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6 grid gap-4 sm:grid-cols-5">
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Pending</h3>
              <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {pendingComplaints.length}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">In Progress</h3>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary">
              {inProgressComplaints.length}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Not Completed</h3>
              <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {notCompletedComplaintsList.length}
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Approved</h3>
              <div className="h-8 w-8 rounded-full bg-secondary/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-secondary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-secondary-foreground">
              {approvedComplaints.length}
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
              {completedComplaints.length}
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Create Complaint Button */}
      <div className="mb-6">
        <Button
          onClick={() => setIsCreatingComplaint(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Complaint
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            {sortedComplaints.length} complaint{sortedComplaints.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedComplaints.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No complaints found
            </div>
          ) : (
            <div className="space-y-4">
              {sortedComplaints.map((complaint) => {
                const tenant = tenants.find((t) => t.tenant_id === complaint.tenant_id)
                const user = getUserByTenantId(tenants, users, complaint.tenant_id)

                return (
                  <div
                    key={complaint.complaint_id}
                    className={`flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between ${
                      reopenedComplaints.has(complaint.complaint_id) && complaint.status === "Pending" 
                        ? "border-orange-400 bg-orange-50/50" 
                        : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{complaint.title}</h4>
                          {reopenedComplaints.has(complaint.complaint_id) && complaint.status === "Pending" && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Reopened
                            </Badge>
                          )}
                        </div>
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                          {complaint.category}
                        </span>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 ${
                            complaint.status === "Completed"
                              ? "bg-success/20 text-success-foreground border-success/30"
                              : complaint.status === "Pending" || complaint.status === "Not Completed"
                              ? "bg-destructive/20 text-destructive border-destructive/30"
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
                        <span>By: {user?.name || "Unknown"}</span>
                        <span>Room: {tenant?.room_number || "N/A"}</span>
                        <span>
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {complaint.worker_name && (
                        <div className="mt-2 rounded bg-muted p-2 text-sm">
                          <span className="font-medium">Worker:</span> {complaint.worker_name} ({complaint.worker_phone})
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {complaint.status === "Pending" && (
                        <>
                          {reopenedComplaints.has(complaint.complaint_id) ? (
                            // Re-raised complaint: only show Not Completed which sends to service
                            <>
                              <div className="flex flex-col gap-2">
                                <p className="text-xs text-orange-600 font-medium">Tenant raised again - needs service</p>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleSendToService(complaint.complaint_id, true)}
                                >
                                  <XCircle className="mr-1 h-3 w-3" />
                                  Not Completed
                                </Button>
                              </div>
                            </>
                          ) : resolvedComplaints.has(complaint.complaint_id) ? (
                            // After clicking any button: show colored category box + Complete button
                            <>
                              <span className={`rounded px-3 py-1 text-xs font-medium ${getCategoryColor(complaint.category)}`}>
                                {complaint.category}
                              </span>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleMarkCompleted(complaint.complaint_id)}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            </>
                          ) : (
                            // Initial state: category dropdown + Send to Service + Complete Self
                            <>
                              <Select
                                value={complaint.category}
                                onValueChange={(value) =>
                                  updateComplaintCategory(complaint.complaint_id, value as ComplaintCategory)
                                }
                              >
                                <SelectTrigger className="w-28">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                onClick={() => {
                                  handleSendToService(complaint.complaint_id)
                                  setResolvedComplaints(prev => new Set(prev).add(complaint.complaint_id))
                                }}
                              >
                                <Send className="mr-1 h-3 w-3" />
                                Send to Service
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleMarkCompleted(complaint.complaint_id)
                                }}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Self Service
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {complaint.status === "In Progress" && (
                        <>
                          {sentToService.has(complaint.complaint_id) ? (
                            // Only show Retrieve if it was sent to service (not self-service)
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRetrieveFromService(complaint.complaint_id)}
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Retrieve from Service
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkCompleted(complaint.complaint_id)}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Complete
                            </Button>
                          )}
                        </>
                      )}
                      {complaint.status === "Approved" && (
                        <>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-blue-600 font-medium">
                              {complaint.worker_name ? `Worker ${complaint.worker_name} assigned` : "Owner resolved"}
                            </p>
                            <p className="text-xs text-muted-foreground">Waiting for tenant confirmation</p>
                          </div>
                          {complaint.category === "Food" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRetrieveFromService(complaint.complaint_id)}
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Retrieve
                            </Button>
                          )}
                        </>
                      )}
                      {complaint.status === "Checked" && (
                        <>
                          <div className="flex flex-col gap-2">
                            <p className="text-xs text-blue-600 font-medium">Work done by service</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleMarkCompleted(complaint.complaint_id)}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleSendToService(complaint.complaint_id, true)}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Not Complete
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Complaint Dialog */}
      <Dialog open={isCreatingComplaint} onOpenChange={() => setIsCreatingComplaint(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Complaint</DialogTitle>
            <DialogDescription>
              Create a complaint on behalf of the PG management
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Complaint Title
              </label>
              <Input
                id="title"
                value={newComplaint.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                placeholder="Enter complaint title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Complaint Type
              </label>
              <Select
                value={newComplaint.category}
                onValueChange={(value) => setNewComplaint({ ...newComplaint, category: value as ComplaintCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select complaint type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newComplaint.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                placeholder="Enter complaint description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newComplaint.isDefaultComplaint}
                onChange={(e) => setNewComplaint({ ...newComplaint, isDefaultComplaint: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-sm">
                This is a default complaint (can be retrieved later)
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreatingComplaint(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateComplaint}
                disabled={!newComplaint.title || !newComplaint.description}
              >
                Create Complaint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedComplaint?.title}</DialogTitle>
            <DialogDescription>
              Complaint #{selectedComplaint?.complaint_id}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${getCategoryColor(selectedComplaint.category)}`}>
                  {selectedComplaint.category}
                </span>
                <Badge variant={getStatusColor(selectedComplaint.status) as "destructive" | "default" | "secondary" | "outline"}>
                  {selectedComplaint.status}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedComplaint.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tenant:</span>{" "}
                  {getUserByTenantId(tenants, users, selectedComplaint.tenant_id)?.name || "Unknown"}
                </div>
                <div>
                  <span className="font-medium">Room:</span>{" "}
                  {tenants.find((t) => t.tenant_id === selectedComplaint.tenant_id)?.room_number || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(selectedComplaint.created_at).toLocaleString()}
                </div>
              </div>
              {selectedComplaint.worker_name && (
                <div className="rounded-lg bg-muted p-3">
                  <h4 className="text-sm font-medium">Assigned Worker</h4>
                  <p className="mt-1 text-sm">
                    {selectedComplaint.worker_name} - {selectedComplaint.worker_phone}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
