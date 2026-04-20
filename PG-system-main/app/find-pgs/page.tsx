"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Search, MapPin, Star, Filter, ArrowLeft, Wifi, Car, Dumbbell, ChefHat, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAppState } from "@/lib/app-context"
import { PGDetailModal } from "@/components/pg-detail-modal"
import type { PG } from "@/lib/data-store"
import { useAuth } from "@/lib/auth-context"
import { EmailGateway } from "@/components/email-gateway"

export default function FindPGsPage() {
  const router = useRouter()
  const { currentUser, isGuest, isAuthenticated, guestEmail, logout } = useAuth()
  const { pgs, rooms, tenants } = useAppState()
  const [searchQuery, setSearchQuery] = useState("")
  const [budgetRange, setBudgetRange] = useState([0, 15000])
  const [roomType, setRoomType] = useState<string>("all")
  const [acFilter, setAcFilter] = useState(false)
  const [selectedPG, setSelectedPG] = useState<PG | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredPGs = useMemo(() => {
    return pgs.filter((pg) => {
      // Search filter — guard against null/undefined fields
      const pgName = pg.pg_name ?? ""
      const pgLocation = pg.location ?? ""
      const matchesSearch =
        pgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pgLocation.toLowerCase().includes(searchQuery.toLowerCase())

      // Budget filter — parse rent safely (strip all non-numeric characters like "Rs.", spaces, or commas)
      const rentNum = Number(String(pg.rent ?? 0).replace(/[^\d.-]/g, ""))
      const matchesBudget = !isNaN(rentNum) && rentNum >= budgetRange[0] && rentNum <= budgetRange[1]

      // Room type filter — fuzzy match to handle variations like "Sharing" vs "Shared"
      const pgRoomType = (pg.room_type ?? "").toLowerCase().trim()
      const filterRoomType = roomType.toLowerCase().trim()
      
      let matchesRoomType = roomType === "all"
      if (!matchesRoomType) {
        if (filterRoomType === "single") {
          matchesRoomType = pgRoomType === "single" || pgRoomType.includes("single")
        } else if (filterRoomType === "shared") {
          // "Shared" (Any) match: covers any sharing type
          matchesRoomType = pgRoomType !== "single" && pgRoomType !== "all" && pgRoomType !== ""
        } else if (filterRoomType.includes("sharing")) {
          // New: Filter by specific sharing count (2, 3, 4, 5) using rooms inventory
          const requestedBeds = parseInt(filterRoomType.split(' ')[0])
          if (!isNaN(requestedBeds)) {
            const pgRooms = (rooms || []).filter((r: any) => r.pg_id === pg.pg_id)
            matchesRoomType = pgRooms.some((r: any) => r.beds === requestedBeds)
          } else {
            matchesRoomType = pgRoomType === filterRoomType
          }
        } else {
          matchesRoomType = pgRoomType === filterRoomType
        }
      }

      // AC filter — match if ac_type contains "AC" (covers "AC", "AC and Non-AC")
      const acType = (pg.ac_type ?? "").toLowerCase()
      const isAC = acType.includes("ac") && !acType.includes("non-ac") || acType.includes("ac and non-ac")
      const matchesAC = !acFilter || isAC

      return matchesSearch && matchesBudget && matchesRoomType && matchesAC
    })
  }, [pgs, rooms, searchQuery, budgetRange, roomType, acFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setBudgetRange([0, 15000])
    setRoomType("all")
    setAcFilter(false)
  }

  const hasActiveFilters = searchQuery || budgetRange[0] > 0 || budgetRange[1] < 15000 || roomType !== "all" || acFilter

  if (!isAuthenticated && !isGuest) {
    return <EmailGateway />
  }

  return (
    <div className="min-h-screen bg-background relative">
      <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4 lg:px-12">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SmartPG</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            {(isAuthenticated || isGuest) ? (
              <Button 
                variant="ghost" 
                onClick={() => {
                  logout()
                  router.push("/")
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="px-6 py-8 lg:px-12 transition-all">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Find Your Perfect PG</h1>
          <p className="mt-2 text-muted-foreground">
            Search and filter PGs based on your preferences
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by PG name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap text-sm">Budget:</Label>
              <div className="flex w-48 items-center gap-2">
                <Slider
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                  max={15000}
                  step={500}
                  className="w-full"
                />
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {budgetRange[0]}-{budgetRange[1]}
                </span>
              </div>
            </div>

            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Shared">Shared (Any)</SelectItem>
                <SelectItem value="2 Sharing">2 Sharing</SelectItem>
                <SelectItem value="3 Sharing">3 Sharing</SelectItem>
                <SelectItem value="4 Sharing">4 Sharing</SelectItem>
                <SelectItem value="5 Sharing">5 Sharing</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch checked={acFilter} onCheckedChange={setAcFilter} />
              <Label className="text-sm">AC Only</Label>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Budget Range</Label>
                  <Slider
                    value={budgetRange}
                    onValueChange={setBudgetRange}
                    max={15000}
                    step={500}
                  />
                  <p className="text-sm text-muted-foreground">
                    Rs. {budgetRange[0]} - Rs. {budgetRange[1]}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Shared">Shared (Any)</SelectItem>
                      <SelectItem value="2 Sharing">2 Sharing</SelectItem>
                      <SelectItem value="3 Sharing">3 Sharing</SelectItem>
                      <SelectItem value="4 Sharing">4 Sharing</SelectItem>
                      <SelectItem value="5 Sharing">5 Sharing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>AC Only</Label>
                  <Switch checked={acFilter} onCheckedChange={setAcFilter} />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button className="flex-1" onClick={() => setShowFilters(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPGs.length} of {pgs.length} PGs
          </p>
        </div>

        {/* PG Cards Grid */}
        {filteredPGs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPGs.map((pg) => (
              <PGCard 
                key={pg.pg_id} 
                pg={pg} 
                onSelect={() => setSelectedPG(pg)} 
                allRooms={rooms}
                allTenants={tenants}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No PGs Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        )}
      </main>

      {/* PG Detail Modal */}
      {selectedPG && (
        <PGDetailModal
          pg={selectedPG}
          open={!!selectedPG}
          onClose={() => setSelectedPG(null)}
        />
      )}
    </div>
  )
}

function PGCard({ pg, onSelect, allRooms, allTenants }: { pg: PG; onSelect: () => void; allRooms: any[]; allTenants: any[] }) {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-3 w-3" />
      case "parking":
        return <Car className="h-3 w-3" />
      case "gym":
        return <Dumbbell className="h-3 w-3" />
      case "food":
        return <ChefHat className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group"
      onClick={onSelect}
    >
      <div className="h-44 relative bg-muted overflow-hidden">
        {pg.image ? (
          <img 
            src={pg.image} 
            alt={pg.pg_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/20 to-secondary/20 ${pg.image ? 'hidden' : ''}`}>
          <Building2 className="h-16 w-16 text-primary/40" />
          <p className="text-xs font-medium text-primary/70">Image removed</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <p className="text-white text-xs font-medium">Click to view details</p>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{pg.pg_name}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {pg.location}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-1">
            <Star className="h-3 w-3 fill-secondary text-secondary" />
            <span className="text-sm font-medium">{pg.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">Rs. {pg.rent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          <div className="text-right">
            {(() => {
              const pgRooms = allRooms.filter(r => r.pg_id === pg.pg_id)
              const totalBeds = pgRooms.reduce((sum, r) => sum + r.beds, 0)
              const occupiedBeds = allTenants.filter(t => t.pg_id === pg.pg_id).length
              const bedsVacant = Math.max(0, totalBeds - occupiedBeds)
              
              return (
                <>
                  <p className="text-sm font-medium">{bedsVacant} beds</p>
                  <p className="text-xs text-muted-foreground">vacant</p>
                </>
              )
            })()}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={(pg.room_type || "Shared").includes("Single") ? "default" : "secondary"}>
            {(pg.room_type || "Shared") === "Shared" ? "Multi-sharing" : pg.room_type}
          </Badge>
          {pg.ac_type?.toLowerCase().includes("ac") && <Badge variant="outline">AC</Badge>}
          {pg.amenities?.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="outline" className="flex items-center gap-1">
              {getAmenityIcon(amenity)}
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
