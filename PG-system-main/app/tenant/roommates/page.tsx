"use client"

import { Users, Phone, MapPin, Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"
import { getRoommates } from "@/lib/data-store"

export default function RoommatesPage() {
  const { currentUser } = useAuth()
  const { tenants, users, pgs } = useAppState()

  // Get current tenant
  const tenant = tenants.find((t) => {
    const user = users.find((u) => u.user_id === t.user_id)
    return user?.email === currentUser?.email
  })

  // Get PG info
  const pg = pgs.find((p) => p.pg_id === tenant?.pg_id)

  // Get roommates
  const roommates = tenant ? getRoommates(tenants, users, tenant.tenant_id) : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Roommates</h1>
        <p className="mt-2 text-muted-foreground">
          Connect with your roommates in Room {tenant?.room_number}
        </p>
      </div>

      {/* Room Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Room {tenant?.room_number}
          </CardTitle>
          <CardDescription>
            {pg?.room_type === "Single" ? "Single Room" : "Shared Room"} at {pg?.pg_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{roommates.length + 1} occupant{roommates.length > 0 ? "s" : ""}</span>
            </div>
            {tenant?.sleep_preference && (
              <div className="flex items-center gap-2">
                {tenant.sleep_preference === "Early Sleeper" ? (
                  <Sun className="h-4 w-4 text-secondary" />
                ) : (
                  <Moon className="h-4 w-4 text-primary" />
                )}
                <span>You: {tenant.sleep_preference}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Roommates List */}
      {roommates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Roommates</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {pg?.room_type === "Single"
                ? "You have a single room - no roommates!"
                : "You currently have the room to yourself"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {roommates.map(({ tenant: roommateTenant, user: roommateUser }) => (
            <Card key={roommateTenant.tenant_id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {roommateUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{roommateUser.name}</h3>
                    <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{roommateUser.phone || "Not provided"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{roommateUser.place || "Not provided"}</span>
                      </div>
                    </div>
                    {roommateTenant.sleep_preference && (
                      <Badge
                        variant="outline"
                        className="mt-3 flex w-fit items-center gap-1"
                      >
                        {roommateTenant.sleep_preference === "Early Sleeper" ? (
                          <Sun className="h-3 w-3 text-secondary" />
                        ) : (
                          <Moon className="h-3 w-3 text-primary" />
                        )}
                        {roommateTenant.sleep_preference}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
