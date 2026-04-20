"use client"

import { useState, useEffect } from "react"
import { Home, MapPin, Star, Users, Wifi, Car, Dumbbell, ChefHat, Waves, BookOpen, Shirt, Check, CreditCard, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"
import { getRoommates } from "@/lib/data-store"

export default function TenantRoomPage() {
  const { currentUser } = useAuth()
  const { tenants, users, pgs } = useAppState()

  const [hoveredStar, setHoveredStar] = useState<number>(0)
  const [rating, setRating] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)

  // Check localStorage on mount to see if user already rated this month
  useEffect(() => {
    if (!currentUser) return
    const curMonth = new Date().getMonth()
    const curYear = new Date().getFullYear()
    const storageKey = `pg_rating_${currentUser.email}_${curYear}_${curMonth}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setRating(Number(saved))
      setIsLocked(true)
    }
  }, [currentUser])

  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRate = (star: number) => {
    if (isLocked || !currentUser) return
    setRating(star)
    setIsLocked(true)
    const curMonth = new Date().getMonth()
    const curYear = new Date().getFullYear()
    const storageKey = `pg_rating_${currentUser.email}_${curYear}_${curMonth}`
    localStorage.setItem(storageKey, String(star))
  }

  // Get current tenant
  const tenant = tenants.find((t: any) => {
    // 1. Try matching using joined user data from API (most reliable)
    const joinedEmail = t.users?.email
    if (joinedEmail && currentUser?.email && joinedEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      return true
    }

    // 2. Try direct user_id match
    if (t.user_id && currentUser?.user_id && String(t.user_id) === String(currentUser.user_id)) {
      return true
    }

    // 3. Fallback to searching in the users array using email
    const user = users.find((u: any) => String(u.user_id) === String(t.user_id))
    return user?.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  })

  // Get PG info
  const pg = pgs.find((p) => p.pg_id === tenant?.pg_id)

  // Get roommates count
  const roommates = tenant ? getRoommates(tenants, users, tenant.tenant_id) : []

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      wifi: <Wifi className="h-4 w-4" />,
      parking: <Car className="h-4 w-4" />,
      gym: <Dumbbell className="h-4 w-4" />,
      food: <ChefHat className="h-4 w-4" />,
      "swimming pool": <Waves className="h-4 w-4" />,
      "study room": <BookOpen className="h-4 w-4" />,
      laundry: <Shirt className="h-4 w-4" />,
    }
    return iconMap[amenity.toLowerCase()] || <Check className="h-4 w-4" />
  }

  if (!tenant || !pg) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Room details not available</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Room</h1>
        <p className="mt-2 text-muted-foreground">
          View your room and PG details
        </p>
      </div>

      {/* Room Overview */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Room Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Room Number</span>
                <span className="text-2xl font-bold">{tenant.room_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Room Type</span>
                <Badge>{pg.room_type || "Shared"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AC</span>
                <Badge variant={pg.ac_type === "AC" || pg.ac_type === "Both" ? "secondary" : "outline"}>
                  {pg.ac_type === "AC" || pg.ac_type === "Both" ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Roommates</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{roommates.length}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge
                  variant={tenant.payment_status === "Paid" ? "secondary" : "destructive"}
                >
                  {tenant.payment_status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Monthly Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Room Rent</span>
                <span className="font-semibold">Rs. {pg.rent.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Food Charges</span>
                <span className="font-semibold">Rs. 3,000</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Monthly</span>
                  <span className="text-xl font-bold text-primary">
                    Rs. {(pg.rent + 3000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relevant Data: WiFi & Manager */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Community & Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Wi-Fi Network</p>
                  <p className="text-lg font-bold">{pg.pg_name}_Free</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopy(`${pg.pg_name}_Free`)}
                >
                  {copied ? "Copied" : "Copy SSID"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Wi-Fi Password</p>
                  <p className="text-lg font-bold">pg@12345</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopy("pg@12345")}
                >
                  {copied ? "Copied" : "Copy Pwd"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              PG Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Manager Name</p>
                  <p className="font-semibold text-foreground">Vikram Singh</p>
                </div>
                <Badge variant="outline">Owner</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Contact Number</p>
                  <p className="font-bold text-primary">+91 98765 43214</p>
                </div>
                <Button variant="ghost" size="sm">Call Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Rating Stats Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Rating Statistics</CardTitle>
            <CardDescription>Overview of community ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = s === 5 ? 12 : s === 4 ? 8 : s === 3 ? 3 : 1;
                const percentage = (count / 24) * 100;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-3 text-xs font-semibold">{s}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <div className="h-2 flex-1 rounded-full bg-secondary/20 overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
                  </div>
                )
              })}
              <div className="mt-4 border-t pt-4 text-center">
                <p className="text-3xl font-bold">{pg.rating || "4.5"}</p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= (pg.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Total 24 reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Your PG */}
        <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Rate Your Experience</CardTitle>
              <CardDescription className="mt-1">
                Help us improve by rating your stay at {pg.pg_name} this month.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary-foreground">
              Monthly Check-in
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <h4 className="mb-4 text-lg font-medium text-foreground">
              {isLocked ? "Thank you for your feedback!" : "How would you rate your stay overall?"}
            </h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoveredStar || rating);
                return (
                  <button
                    key={star}
                    disabled={isLocked}
                    className={`rounded-full p-1 transition-transform focus:outline-none ${!isLocked ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    onMouseEnter={() => !isLocked && setHoveredStar(star)}
                    onMouseLeave={() => !isLocked && setHoveredStar(0)}
                    onClick={() => handleRate(star)}
                  >
                    <Star 
                      className={`h-10 w-10 transition-colors ${
                        isFilled 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-muted-foreground/30"
                      }`} 
                    />
                  </button>
                )
              })}
            </div>
            {isLocked ? (
              <p className="mt-4 flex items-center gap-1 text-sm font-medium text-success-foreground">
                <CheckCircle2 className="h-4 w-4" /> Rating submitted for this month
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Select a star to submit your rating</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
