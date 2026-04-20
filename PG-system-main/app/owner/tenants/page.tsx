"use client"

import { useState } from "react"
import { Plus, Trash2, Phone, MapPin, Home, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { useAppState } from "@/lib/app-context"

export default function TenantsPage() {
  const { tenants, users, pgs, payments, addUser, addTenant, removeTenant } = useAppState()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTenant, setNewTenant] = useState({
    name: "",
    email: "",
    phone: "",
    place: "",
    room_number: "",
    room_type: "Shared",
    pg_id: "1",
    move_in_date: "",
    rent_amount: "",
    security_deposit: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    id_proof_type: "Aadhar",
    id_proof_number: "",
    payment_status: "Unpaid",
  })

  // Get the owner's PG
  const pg = pgs[0]

  // Get tenants with user info
  const tenantsWithUsers = tenants
    .filter((t) => t.pg_id === pg?.pg_id)
    .map((tenant) => ({
      ...tenant,
      user: users.find((u) => u.user_id === tenant.user_id),
    }))
    .filter((t) => t.user)

  // Filter by search
  const filteredTenants = tenantsWithUsers.filter(
    (t) =>
      t.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.room_number.toString().includes(searchQuery)
  )

  const handleAddTenant = async () => {
    if (!newTenant.name || !newTenant.email || !newTenant.room_number) return

    // First create the user
    const user = await addUser({
      name: newTenant.name,
      email: newTenant.email,
      password: "123456",
      role: "tenant",
      phone: newTenant.phone,
      place: newTenant.place,
    })

    // Then create the tenant
    addTenant({
      user_id: user.user_id,
      pg_id: parseInt(newTenant.pg_id),
      room_number: parseInt(newTenant.room_number),
      room_type: newTenant.room_type as "Single" | "Shared",
      payment_status: "Unpaid",
    })

    // Reset form
    setNewTenant({
      name: "",
      email: "",
      phone: "",
      place: "",
      room_number: "",
      room_type: "Shared",
      pg_id: "1",
      move_in_date: "",
      rent_amount: "",
      security_deposit: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      id_proof_type: "Aadhar",
      id_proof_number: "",
      payment_status: "Unpaid",
    })
    setIsAddDialogOpen(false)
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="mt-2 text-muted-foreground">
            Manage tenants at {pg?.pg_name}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Tenant (Offline Booking)</DialogTitle>
              <DialogDescription>
                Add tenant details for offline/in-person PG booking
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  placeholder="Enter tenant full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newTenant.phone}
                    onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                    placeholder="10-digit phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="place">Home Town/Place</Label>
                <Input
                  id="place"
                  value={newTenant.place}
                  onChange={(e) => setNewTenant({ ...newTenant, place: e.target.value })}
                  placeholder="Enter home city/town"
                />
              </div>

              {/* Room Assignment */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Room Assignment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number *</Label>
                    <Input
                      id="room"
                      type="number"
                      value={newTenant.room_number}
                      onChange={(e) => setNewTenant({ ...newTenant, room_number: e.target.value })}
                      placeholder="Assign room number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room_type">Room Type *</Label>
                    <Select
                      value={newTenant.room_type}
                      onValueChange={(value) => setNewTenant({ ...newTenant, room_type: value })}
                    >
                      <SelectTrigger id="room_type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Shared">Shared (Any)</SelectItem>
                        <SelectItem value="2 Sharing">2 Sharing</SelectItem>
                        <SelectItem value="3 Sharing">3 Sharing</SelectItem>
                        <SelectItem value="4 Sharing">4 Sharing</SelectItem>
                        <SelectItem value="5 Sharing">5 Sharing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="move_in_date">Move-in Date</Label>
                    <Input
                      id="move_in_date"
                      type="date"
                      value={newTenant.move_in_date}
                      onChange={(e) => setNewTenant({ ...newTenant, move_in_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Financial Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rent_amount">Monthly Rent (₹)</Label>
                    <Input
                      id="rent_amount"
                      type="number"
                      value={newTenant.rent_amount}
                      onChange={(e) => setNewTenant({ ...newTenant, rent_amount: e.target.value })}
                      placeholder="Enter rent amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="security_deposit">Security Deposit (₹)</Label>
                    <Input
                      id="security_deposit"
                      type="number"
                      value={newTenant.security_deposit}
                      onChange={(e) => setNewTenant({ ...newTenant, security_deposit: e.target.value })}
                      placeholder="Enter deposit amount"
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="payment_status">Initial Payment Status</Label>
                  <Select
                    value={newTenant.payment_status}
                    onValueChange={(value) => setNewTenant({ ...newTenant, payment_status: value })}
                  >
                    <SelectTrigger id="payment_status">
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid (Full Amount Received)</SelectItem>
                      <SelectItem value="Unpaid">Unpaid (Payment Pending)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ID Proof Details */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">ID Proof Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="id_proof_type">ID Proof Type</Label>
                    <Select
                      value={newTenant.id_proof_type}
                      onValueChange={(value) => setNewTenant({ ...newTenant, id_proof_type: value })}
                    >
                      <SelectTrigger id="id_proof_type">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aadhar">Aadhar Card</SelectItem>
                        <SelectItem value="PAN">PAN Card</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Driving License">Driving License</SelectItem>
                        <SelectItem value="Voter ID">Voter ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id_proof_number">ID Proof Number</Label>
                    <Input
                      id="id_proof_number"
                      value={newTenant.id_proof_number}
                      onChange={(e) => setNewTenant({ ...newTenant, id_proof_number: e.target.value })}
                      placeholder="Enter ID number"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_name">Contact Name</Label>
                    <Input
                      id="emergency_name"
                      value={newTenant.emergency_contact_name}
                      onChange={(e) => setNewTenant({ ...newTenant, emergency_contact_name: e.target.value })}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_phone">Contact Phone</Label>
                    <Input
                      id="emergency_phone"
                      value={newTenant.emergency_contact_phone}
                      onChange={(e) => setNewTenant({ ...newTenant, emergency_contact_phone: e.target.value })}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTenant}>Add Tenant</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or room number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantsWithUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payment Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {tenantsWithUsers.filter((t) => {
                const tp = payments.filter(p => p.tenant_id === t.tenant_id && p.status === "Paid")
                return !tp.some(p => p.type === "Room") || !tp.some(p => p.type === "Food")
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{pg?.available_rooms || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>
            {filteredTenants.length} tenant{filteredTenants.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTenants.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No tenants found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Place</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant) => (
                    <TableRow key={tenant.tenant_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tenant.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3 text-muted-foreground" />
                          {tenant.room_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tenant.room_type === "Single" ? "default" : "secondary"}>
                          {tenant.room_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {tenant.user?.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {tenant.user?.place || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const tp = payments.filter(p => p.tenant_id === tenant.tenant_id && p.status === "Paid")
                          const paidRoom = tp.some(p => p.type === "Room")
                          const paidFood = tp.some(p => p.type === "Food")
                          
                          if (paidRoom && paidFood) return <Badge variant="secondary">Paid</Badge>
                          if (paidRoom || paidFood) return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Partial</Badge>
                          return <Badge variant="destructive">Unpaid</Badge>
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Tenant</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {tenant.user?.name} from room{" "}
                                {tenant.room_number}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeTenant(tenant.tenant_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
