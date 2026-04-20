"use client"

import { useState, useRef } from "react"
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Home,
  Utensils,
  Smartphone,
  Banknote,
  Wallet,
  Check,
  Printer,
  History,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/animated-card"
import { motion } from "framer-motion"
import { staggerContainer, slideUp } from "@/lib/motions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"

export default function TenantPaymentsPage() {
  const { currentUser } = useAuth()
  const { payments, tenants, users, pgs, addPayment } = useAppState()
  const [paymentType, setPaymentType] = useState<"Room" | "Food" | null>(null)
  const [paymentStep, setPaymentStep] = useState<"method" | "processing" | "success">("method")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [showHistory, setShowHistory] = useState(false)
  const [lastPaymentId, setLastPaymentId] = useState<number | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  // Get current tenant
  const tenant = tenants.find((t) => {
    const user = users.find((u) => u.user_id === t.user_id)
    return user?.email === currentUser?.email
  })

  // Get PG info
  const pg = pgs.find((p) => p.pg_id === tenant?.pg_id)

  // Get my payments
  const myPayments = payments
    .filter((p) => p.tenant_id === tenant?.tenant_id)
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())

  const totalPaid = myPayments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = myPayments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0)

  const roomRent = pg?.rent || 6000
  const foodCharges = 3000

  const paymentMethods = [
    { id: "upi", label: "UPI (PhonePe, Google Pay)", icon: Smartphone },
    { id: "card", label: "Credit / Debit Card", icon: CreditCard },
    { id: "netbanking", label: "Net Banking", icon: Banknote },
    { id: "cash", label: "Pay at PG (Cash)", icon: Wallet },
  ]

  const getPaymentMethodLabel = (id: string) => {
    const method = paymentMethods.find((m) => m.id === id)
    return method?.label || id
  }

  const handleStartPayment = (type: "Room" | "Food") => {
    setPaymentType(type)
    setPaymentStep("method")
    setPaymentMethod("")
  }

  const handleConfirmPayment = async () => {
    if (!tenant || !paymentMethod) return

    setPaymentStep("processing")

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Add the payment
    const newPayment = await addPayment({
      tenant_id: tenant.tenant_id,
      amount: paymentType === "Room" ? roomRent : foodCharges,
      type: paymentType!,
      room_type: paymentType === "Room" ? (tenant.room_type || "Shared") : undefined,
      status: "Paid",
      payment_date: new Date().toISOString().split("T")[0],
    })

    if (newPayment) {
      setLastPaymentId(newPayment.payment_id)
      setPaymentStep("success")
    } else {
      setPaymentStep("method")
      // You might want to add a toast error here
    }
  }

  const handlePrintReceipt = () => {
    const receiptContent = receiptRef.current
    if (!receiptContent) return

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
          <div class="receipt-id">Receipt #SPG-${lastPaymentId || Date.now()}</div>
          <div class="row"><span class="label">Type</span><span class="value">${paymentType} Payment</span></div>
          ${paymentType === "Room" ? `<div class="row"><span class="label">Room Type</span><span class="value">${tenant?.room_type || "Shared"}</span></div>` : ""}
          <div class="row"><span class="label">PG Name</span><span class="value">${pg?.pg_name || "N/A"}</span></div>
          <div class="row"><span class="label">Tenant</span><span class="value">${currentUser?.name || "N/A"}</span></div>
          <div class="row"><span class="label">Room No.</span><span class="value">${tenant?.room_number || "N/A"}</span></div>
          <div class="row"><span class="label">Payment Method</span><span class="value">${getPaymentMethodLabel(paymentMethod)}</span></div>
          <div class="row"><span class="label">Date</span><span class="value">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
          <div class="total"><span>Total Paid</span><span>Rs. ${(paymentType === "Room" ? roomRent : foodCharges).toLocaleString()}</span></div>
          <div class="status">✓ Payment Successful</div>
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

  const closeDialog = () => {
    setPaymentType(null)
    setPaymentStep("method")
    setPaymentMethod("")
    setLastPaymentId(null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your rent and food payments
        </p>
      </div>

      {/* Payment Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6 grid gap-4 sm:grid-cols-3">
        <AnimatedCard>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">Total Paid</h3>
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-success-foreground" />
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
              <h3 className="tracking-tight text-sm font-medium">Pending</h3>
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
              <h3 className="tracking-tight text-sm font-medium">Payment Status</h3>
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
            </div>
            <Badge variant="outline" className={tenant?.payment_status === "Paid" ? "bg-success/20 text-success-foreground border-success/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
              {tenant?.payment_status || "Unknown"}
            </Badge>
          </div>
        </AnimatedCard>
      </motion.div>

      {/* Quick Pay Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Room Rent
            </CardTitle>
            <CardDescription>Monthly room rent payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold">Rs. {roomRent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => handleStartPayment("Room")}
              disabled={myPayments.some(p => p.type === "Room" && p.status === "Paid")}
            >
              {myPayments.some(p => p.type === "Room" && p.status === "Paid") ? "Paid" : "Pay Room Rent"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Food Charges
            </CardTitle>
            <CardDescription>Monthly food charges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-3xl font-bold">Rs. {foodCharges.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
            <Button 
              className="w-full" 
              variant="secondary" 
              onClick={() => handleStartPayment("Food")}
              disabled={myPayments.some(p => p.type === "Food" && p.status === "Paid")}
            >
              {myPayments.some(p => p.type === "Food" && p.status === "Paid") ? "Paid" : "Pay Food Charges"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            {myPayments.length} payment{myPayments.length !== 1 ? "s" : ""} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myPayments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No payment history yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayments.map((payment) => (
                    <TableRow key={payment.payment_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.type === "Room" ? (
                            <Home className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                          )}
                          {payment.type}
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
                          variant={payment.status === "Paid" ? "secondary" : "destructive"}
                          className="flex w-fit items-center gap-1"
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
                            onClick={() => {
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
                                    ${payment.room_type ? `<div class="row"><span class="label">Room Type</span><span class="value">${payment.room_type}</span></div>` : ""}
                                    <div class="row"><span class="label">PG Name</span><span class="value">${pg?.pg_name || "N/A"}</span></div>
                                    <div class="row"><span class="label">Tenant</span><span class="value">${currentUser?.name || "N/A"}</span></div>
                                    <div class="row"><span class="label">Room No.</span><span class="value">${tenant?.room_number || "N/A"}</span></div>
                                    <div class="row"><span class="label">Date</span><span class="value">${new Date(payment.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                                    <div class="total"><span>Total Paid</span><span>Rs. ${payment.amount.toLocaleString()}</span></div>
                                    <div class="status">✓ Payment Successful</div>
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
                            }}
                          >
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Print Receipt</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={!!paymentType} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-md">
          {/* Step 1: Payment Method Selection */}
          {paymentStep === "method" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Pay {paymentType === "Room" ? "Room Rent" : "Food Charges"}
                </DialogTitle>
                <DialogDescription>
                  Select your preferred payment method
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => (
                      <Card
                        key={method.id}
                        className={`p-4 cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="sr-only" />
                          <div className={`rounded-full p-2 ${paymentMethod === method.id ? "bg-primary/20" : "bg-muted"}`}>
                            <method.icon className={`h-5 w-5 ${paymentMethod === method.id ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <Label htmlFor={`payment-${method.id}`} className="flex-1 font-semibold cursor-pointer">
                            {method.label}
                          </Label>
                          {paymentMethod === method.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Summary */}
              <div className="mt-6 rounded-lg bg-muted p-4">
                <h4 className="font-semibold">Payment Summary</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PG Name</span>
                    <span className="font-medium">{pg?.pg_name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room No.</span>
                    <span className="font-medium">{tenant?.room_number || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Type</span>
                    <span className="font-medium">{paymentType}</span>
                  </div>
                  {paymentType === "Room" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Type</span>
                      <span className="font-medium">{tenant?.room_type || "Shared"}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                    <span>Total Amount</span>
                    <span>Rs. {(paymentType === "Room" ? roomRent : foodCharges).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmPayment}
                  disabled={!paymentMethod}
                >
                  Pay Rs. {(paymentType === "Room" ? roomRent : foodCharges).toLocaleString()}
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Processing */}
          {paymentStep === "processing" && (
            <>
              <DialogHeader>
                <DialogTitle>Processing Payment</DialogTitle>
                <DialogDescription>
                  Please wait while we process your payment...
                </DialogDescription>
              </DialogHeader>
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Processing {paymentType} payment of Rs.{" "}
                  {(paymentType === "Room" ? roomRent : foodCharges).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  via {getPaymentMethodLabel(paymentMethod)}
                </p>
              </div>
            </>
          )}

          {/* Step 3: Success */}
          {paymentStep === "success" && !showHistory && (
            <>
              <DialogHeader>
                <DialogTitle>Payment Successful!</DialogTitle>
              </DialogHeader>
              <div ref={receiptRef} className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                  <CheckCircle2 className="h-8 w-8 text-secondary" />
                </div>
                <p className="text-lg font-semibold">Thank you!</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your {paymentType?.toLowerCase()} payment of Rs.{" "}
                  {(paymentType === "Room" ? roomRent : foodCharges).toLocaleString()} has been
                  processed successfully.
                </p>

                {/* Receipt Details */}
                <div className="mt-6 rounded-lg bg-muted p-4 text-left">
                  <h4 className="font-semibold text-sm">Receipt Details</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receipt No.</span>
                      <span className="font-medium">SPG-{lastPaymentId || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PG Name</span>
                      <span className="font-medium">{pg?.pg_name || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room No.</span>
                      <span className="font-medium">{tenant?.room_number || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Type</span>
                      <span className="font-medium">{paymentType}</span>
                    </div>
                    {paymentType === "Room" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room Type</span>
                        <span className="font-medium">{tenant?.room_type || "Shared"}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">
                        {new Date().toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                      <span>Total Paid</span>
                      <span>Rs. {(paymentType === "Room" ? roomRent : foodCharges).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="gap-2" onClick={handlePrintReceipt}>
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => setShowHistory(true)}>
                  <History className="h-4 w-4" />
                  View History
                </Button>
              </div>
              <Button onClick={closeDialog} className="w-full">
                Done
              </Button>
            </>
          )}

          {/* Inline History View */}
          {paymentStep === "success" && showHistory && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>Payment History</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowHistory(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Button>
                </div>
                <DialogDescription>
                  All your payment records
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 max-h-[50vh] overflow-y-auto">
                {myPayments.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No payment history yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myPayments.map((payment) => (
                      <div
                        key={payment.payment_id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${payment.type === "Room" ? "bg-primary/10" : "bg-secondary/10"}`}>
                            {payment.type === "Room" ? (
                              <Home className={`h-4 w-4 ${payment.type === "Room" ? "text-primary" : "text-secondary"}`} />
                            ) : (
                              <Utensils className="h-4 w-4 text-secondary" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{payment.type} Payment</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.payment_date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-sm font-semibold">
                              Rs. {payment.amount.toLocaleString()}
                            </p>
                            <Badge
                              variant={payment.status === "Paid" ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                          {payment.status === "Paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => {
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
                                      <div class="row"><span class="label">Tenant</span><span class="value">${currentUser?.name || "N/A"}</span></div>
                                      <div class="row"><span class="label">Room No.</span><span class="value">${tenant?.room_number || "N/A"}</span></div>
                                      <div class="row"><span class="label">Date</span><span class="value">${new Date(payment.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                                      <div class="total"><span>Total Paid</span><span>Rs. ${payment.amount.toLocaleString()}</span></div>
                                      <div class="status">✓ Payment Successful</div>
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
                              }}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={closeDialog} className="w-full mt-4">
                Done
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
