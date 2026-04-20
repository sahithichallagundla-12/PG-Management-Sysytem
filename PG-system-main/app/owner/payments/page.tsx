"use client"

import { useState } from "react"
import { CreditCard, TrendingUp, AlertCircle, CheckCircle2, Filter, Printer, Home, Utensils } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/animated-card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAppState } from "@/lib/app-context"
import { getUserByTenantId } from "@/lib/data-store"

export default function PaymentsPage() {
  const { payments, tenants, users, pgs } = useAppState()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  // Calculate stats
  const totalPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0)
  const roomPayments = payments.filter((p) => p.type === "Room")
  const foodPayments = payments.filter((p) => p.type === "Food")

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    const matchesType = typeFilter === "all" || p.type === typeFilter
    return matchesStatus && matchesType
  })

  // Sort by date (newest first)
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  )

  const handlePrintReceipt = (payment: typeof payments[0]) => {
    const tenant = tenants.find((t) => t.tenant_id === payment.tenant_id)
    const user = getUserByTenantId(tenants, users, payment.tenant_id)
    const pg = tenant ? pgs.find((p) => p.pg_id === tenant.pg_id) : null

    const printWindow = window.open("", "_blank", "width=400,height=600")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - SmartPG</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 30px; color: #1a1a1a; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; }
            .header p { margin: 4px 0 0; color: #666; font-size: 13px; }
            .receipt-id { text-align: center; background: #f0f0f0; padding: 8px; border-radius: 6px; margin-bottom: 20px; font-size: 13px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
            .row:last-child { border-bottom: none; }
            .row .label { color: #666; }
            .row .value { font-weight: 600; }
            .total { display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #333; margin-top: 12px; font-size: 16px; font-weight: bold; }
            .status { text-align: center; margin-top: 20px; padding: 10px; background: #e8f5e9; border-radius: 6px; color: #2e7d32; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SmartPG</h1>
            <p>Payment Receipt</p>
          </div>
          <div class="receipt-id">Receipt #SPG-${payment.payment_id}</div>
          <div class="row"><span class="label">Type</span><span class="value">${payment.type} Payment</span></div>
          <div class="row"><span class="label">PG Name</span><span class="value">${pg?.pg_name || "N/A"}</span></div>
          <div class="row"><span class="label">Tenant</span><span class="value">${user?.name || "Unknown"}</span></div>
          <div class="row"><span class="label">Room No.</span><span class="value">${tenant?.room_number || "N/A"}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${new Date(payment.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
          <div class="total"><span>Total Paid</span><span>Rs. ${payment.amount.toLocaleString()}</span></div>
          <div class="status">✓ Payment ${payment.status}</div>
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>This is a computer-generated receipt.</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="mt-2 text-muted-foreground">
          Track rent and food payments from tenants
        </p>
      </div>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6 grid gap-4 sm:grid-cols-4">
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Total Collected</h3>
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold text-success-foreground">
              Rs. {totalPaid.toLocaleString()}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Pending Amount</h3>
              <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <div className="text-2xl font-bold text-destructive">
              Rs. {totalPending.toLocaleString()}
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Room Payments</h3>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Home className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold">{roomPayments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {roomPayments.filter((p) => p.status === "Paid").length} paid
            </p>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Food Payments</h3>
              <div className="h-8 w-8 rounded-full bg-secondary/30 flex items-center justify-center">
                <Utensils className="h-4 w-4 text-secondary-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold">{foodPayments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {foodPayments.filter((p) => p.status === "Paid").length} paid
            </p>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Room">Room</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {sortedPayments.length} payment{sortedPayments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No payments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.map((payment) => {
                    const tenant = payment.tenants || tenants.find((t) => t.tenant_id === payment.tenant_id)
                    const user = payment.tenants?.users || getUserByTenantId(tenants, users, payment.tenant_id)

                    return (
                      <TableRow key={payment.payment_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">
                              {user?.email || ""}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{tenant?.room_number || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {payment.type === "Room" ? (
                              <Home className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <Badge variant="outline">{payment.type}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          Rs. {payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              payment.status === "Paid"
                                ? "bg-success/20 text-success-foreground border-success/30 flex w-fit items-center gap-1"
                                : "bg-destructive/20 text-destructive border-destructive/30 flex w-fit items-center gap-1"
                            }
                          >
                            {payment.status === "Paid" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === "Paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handlePrintReceipt(payment)}
                            >
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">Print Receipt</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
