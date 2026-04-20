"use client"

import { useState } from "react"
import { Plus, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/animated-card"
import { motion } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"
import type { ComplaintCategory, ComplaintStatus } from "@/lib/data-store"

const categories: ComplaintCategory[] = ["Food", "Cleaning", "Plumbing", "Electricity", "Carpenter", "AC Technician", "Internet", "Other"]

export default function TenantComplaintsPage() {
  const { currentUser } = useAuth()
  const { complaints, tenants, users, addComplaint, updateComplaintStatus } = useAppState()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "" as ComplaintCategory | "",
  })

  // Get current tenant
  const tenant = tenants.find((t) => {
    const user = users.find((u) => u.user_id === t.user_id)
    return user?.email === currentUser?.email
  })

  // Get my complaints
  const myComplaints = complaints
    .filter((c) => c.tenant_id === tenant?.tenant_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const pendingCount = myComplaints.filter((c) => c.status === "Pending").length
  const inProgressCount = myComplaints.filter((c) => c.status === "In Progress" || c.status === "Approved").length
  const completedCount = myComplaints.filter((c) => c.status === "Completed").length

  const getStatusIcon = (status: ComplaintStatus, category?: ComplaintCategory) => {
    switch (status) {
      case "Pending":
        return <AlertCircle className="h-4 w-4" />
      case "In Progress":
        return <Loader2 className="h-4 w-4" />
      case "Approved":
        return category === "Food" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />
      case "Completed":
        return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ComplaintStatus, category?: ComplaintCategory) => {
    switch (status) {
      case "Pending":
        return "destructive"
      case "In Progress":
        return "default"
      case "Approved":
        return category === "Food" ? "success" : "secondary" // Show green for food work completed
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

  const handleSubmit = () => {
    if (!tenant || !newComplaint.title || !newComplaint.category) return

    addComplaint({
      tenant_id: tenant.tenant_id,
      title: newComplaint.title,
      description: newComplaint.description,
      category: newComplaint.category as ComplaintCategory,
      status: "Pending",
      worker_name: null,
      worker_phone: null,
    })

    setNewComplaint({ title: "", description: "", category: "" })
    setIsDialogOpen(false)
  }

  const handleMarkCompleted = (complaintId: number) => {
    updateComplaintStatus(complaintId, "Completed")
  }

  const handleRaiseAgain = (complaintId: number) => {
    updateComplaintStatus(complaintId, "Pending") // Reopen the complaint
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Complaints</h1>
          <p className="mt-2 text-muted-foreground">
            Submit and track your complaints
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit a Complaint</DialogTitle>
              <DialogDescription>
                Describe your issue and we&apos;ll look into it
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newComplaint.title}
                  onChange={(e) =>
                    setNewComplaint({ ...newComplaint, title: e.target.value })
                  }
                  placeholder="Brief title for your complaint"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newComplaint.category}
                  onValueChange={(value) =>
                    setNewComplaint({ ...newComplaint, category: value as ComplaintCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newComplaint.description}
                  onChange={(e) =>
                    setNewComplaint({ ...newComplaint, description: e.target.value })
                  }
                  placeholder="Describe the issue in detail..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newComplaint.title || !newComplaint.category}
              >
                Submit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6 grid gap-4 sm:grid-cols-3">
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Pending</h3>
              <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <div className="text-2xl font-bold text-destructive">{pendingCount}</div>
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
            <div className="text-2xl font-bold text-primary">{inProgressCount}</div>
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
            <div className="text-2xl font-bold text-success-foreground">{completedCount}</div>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Complaints List */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            {myComplaints.length} complaint{myComplaints.length !== 1 ? "s" : ""} submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myComplaints.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No complaints submitted yet</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Submit Your First Complaint
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myComplaints.map((complaint) => (
                <div
                  key={complaint.complaint_id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">{complaint.title}</h4>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getCategoryColor(
                            complaint.category
                          )}`}
                        >
                          {complaint.category}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {complaint.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Submitted: {new Date(complaint.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${
                          complaint.status === "Completed" || complaint.status === "Approved"
                            ? "bg-success/20 text-success-foreground border-success/30"
                            : complaint.status === "Pending"
                            ? "bg-destructive/20 text-destructive border-destructive/30"
                            : "bg-warning/20 text-warning-foreground border-warning/30"
                        }`}
                      >
                        {getStatusIcon(complaint.status, complaint.category)}
                        {complaint.status === "Approved" ? "Work Completed" : complaint.status}
                      </Badge>
                      {complaint.status === "Approved" && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-green-600 font-medium">
                            {complaint.worker_name ? `Worker assigned: ${complaint.worker_name}` : "Owner has resolved this"}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleMarkCompleted(complaint.complaint_id)}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              OK - Resolved
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRaiseAgain(complaint.complaint_id)}
                            >
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Raise Again
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {complaint.worker_name && (
                    <div className="mt-3 rounded bg-muted p-2 text-sm">
                      <span className="font-medium">Assigned Worker:</span>{" "}
                      {complaint.worker_name} ({complaint.worker_phone})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
