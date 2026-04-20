"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  MapPin,
  Star,
  Users,
  Wifi,
  Car,
  Dumbbell,
  ChefHat,
  Waves,
  BookOpen,
  Shirt,
  Check,
  Moon,
  Sun,
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  Camera,
  Bed,
  Bath,
  Users2,
  X,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  MessageSquare,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import type { PG } from "@/lib/data-store"

import { useAppState } from "@/lib/app-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"

interface PGDetailModalProps {
  pg: PG
  open: boolean
  onClose: () => void
}

export function PGDetailModal({ pg, open, onClose }: PGDetailModalProps) {
  const router = useRouter()
  const { reviews, rooms, tenants } = useAppState()
  const { isGuest, guestEmail, isAuthenticated, currentUser, login } = useAuth()
  
  const [step, setStep] = useState<"details" | "preferences" | "rooms" | "registration" | "payment" | "success">("details")
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [sleepPreference, setSleepPreference] = useState<string>("")
  const [selectedRoomType, setSelectedRoomType] = useState<string>("all")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Registration states for guests
  const [regName, setRegName] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRoomPhotos, setShowRoomPhotos] = useState<boolean>(false)
  const [selectedRoomForPhotos, setSelectedRoomForPhotos] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0)

  // fetch REAL room data from state
  const pgRooms = useMemo(() => {
    return rooms
      .filter((r: any) => r.pg_id === pg.pg_id)
      .map((r: any) => {
        // Map DB fields to UI expected format
        const pgSlug = pg.pg_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
        const pgRoomsBase = `/rooms/pgs/${pgSlug}`;

        return {
          roomNumber: String(r.room_number),
          floor: Math.floor(parseInt(r.room_number) / 100) || 1,
          type: r.room_type,
          beds: r.beds,
          occupants: r.is_occupied ? r.beds : 0, 
          maxOccupants: r.beds,
          suggested: false, 
          photos: [
            { id: "1", url: `${pgRoomsBase}/single.jpg`, caption: "Room View" },
            { id: "2", url: `${pgRoomsBase}/study.jpg`, caption: "Study Area" },
            { id: "3", url: `${pgRoomsBase}/washroom.jpg`, caption: "Washroom" }
          ],
          description: r.description,
          rent: r.rent
        }
      })
  }, [rooms, pg.pg_id, pg.pg_name])

  const pgReviews = useMemo(() => {
    return reviews.filter((r: any) => r.pg_id === pg.pg_id)
  }, [reviews, pg.pg_id])

  // Filter rooms based on selected room type
  const filteredRooms = useMemo(() => {
    let filtered = pgRooms
    if (selectedRoomType === "single") {
      filtered = pgRooms.filter((r) => r.type.toLowerCase().includes("single"))
    } else if (selectedRoomType === "shared") {
      filtered = pgRooms.filter((r) => r.type.toLowerCase().includes("sharing") || r.type.toLowerCase().includes("double") || r.type.toLowerCase().includes("triple"))
    }
    
    return filtered.map((room) => {
      const roomTenants = tenants.filter(t => t.pg_id === pg.pg_id && String(t.room_number) === room.roomNumber)
      
      let earlyCount = 0
      let nightCount = 0
      
      roomTenants.forEach(t => {
        if (t.sleep_preference === 'Early Sleeper') earlyCount++
        else if (t.sleep_preference === 'Night Owl') nightCount++
      })
      
      let composition = ""
      let compositionText = ""
      
      if (earlyCount > nightCount) {
        composition = "early"
        compositionText = "Mostly Early Sleepers"
      } else if (nightCount > earlyCount) {
        composition = "night"
        compositionText = "Mostly Night Owls"
      } else if (earlyCount > 0 && earlyCount === nightCount) {
        composition = "mixed"
        compositionText = "Mixed Preferences"
      }
      
      // Determine if suggested based on the current user's selection in 'preferences' step
      // The preferences step sets `sleepPreference` to 'early' or 'night'
      let isSuggested = false
      if (sleepPreference && sleepPreference === composition) {
        isSuggested = true
      }
      
      return {
        ...room,
        suggested: isSuggested,
        compositionText,
        // Override occupant count with real dynamic count to be completely accurate
        occupants: roomTenants.length
      }
    })
  }, [pgRooms, selectedRoomType, sleepPreference, tenants, pg.pg_id])

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

  const handleBook = () => {
    if (isGuest) {
      setStep("registration")
    } else {
      setStep("payment")
    }
  }

  const handleRegistration = () => {
    if (!regName || !regPhone || !regPassword) {
      setError("Please fill in all registration fields")
      return
    }
    setError(null)
    setStep("payment")
  }

  const handleViewRoomPhotos = (roomNumber: string) => {
    setSelectedRoomForPhotos(roomNumber)
    setCurrentPhotoIndex(0)
    setShowRoomPhotos(true)
  }

  const handleCloseRoomPhotos = () => {
    setShowRoomPhotos(false)
    setSelectedRoomForPhotos(null)
    setCurrentPhotoIndex(0)
  }

  const currentRoomPhotos = selectedRoomForPhotos
    ? pgRooms.find((r: any) => r.roomNumber === selectedRoomForPhotos)?.photos ?? []
    : []

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPhotoIndex(prev => (prev + 1) % currentRoomPhotos.length)
  }

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentPhotoIndex(prev => (prev - 1 + currentRoomPhotos.length) % currentRoomPhotos.length)
  }

  const handlePayment = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (isGuest) {
        // Atomic Registration + Booking
        const response = await fetch('/api/guest-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: guestEmail,
            password: regPassword,
            name: regName,
            phone: regPhone,
            pg_id: pg.pg_id,
            room_number: selectedRoom,
            room_type: selectedRoomType === 'all' ? pg.room_type : selectedRoomType,
            sleep_preference: sleepPreference === 'early' ? 'Early Sleeper' : 'Night Owl',
            rent_amount: pg.rent
          })
        })

        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Booking failed")
        }

        // No auto-login per requirements. They need to login with their mail and password to open tenant portal.
        // await login(guestEmail!, regPassword)
      } else {
        // Standard booking for already logged in user
        const response = await fetch('/api/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser?.user_id,
            pg_id: pg.pg_id,
            room_number: selectedRoom,
            room_type: selectedRoomType === 'all' ? pg.room_type : selectedRoomType,
            sleep_preference: sleepPreference === 'early' ? 'Early Sleeper' : 'Night Owl',
            payment_status: 'Unpaid'
          })
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Booking failed")
        }
      }

      setStep("success")
      
      // Automatic redirection to explore pgs
      setIsRedirecting(true)
      setTimeout(() => {
        window.location.href = "/find-pgs"
      }, 8000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep("details")
    setSelectedRoom(null)
    setSleepPreference("")
    setPaymentMethod("")
    setCurrentPhotoIndex(0)
    onClose()
  }

  const handlePrintReceipt = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Receipt - SmartPG</title>
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
            <p>Booking Receipt</p>
          </div>
          <div class="receipt-id">Receipt #SPG-BOOK-${Date.now()}</div>
          <div class="row"><span class="label">PG Name</span><span class="value">${pg.pg_name}</span></div>
          <div class="row"><span class="label">Location</span><span class="value">${pg.location}</span></div>
          <div class="row"><span class="label">Tenant Name</span><span class="value">${regName || currentUser?.name || "N/A"}</span></div>
          <div class="row"><span class="label">Room Number</span><span class="value">${selectedRoom}</span></div>
          <div class="row"><span class="label">Room Type</span><span class="value">${selectedRoomType === "all" ? pg.room_type : selectedRoomType}</span></div>
          <div class="row"><span class="label">Preference</span><span class="value">${sleepPreference === "early" ? "Early Sleeper" : "Night Owl"}</span></div>
          <div class="row"><span class="label">Booking Date</span><span class="value">${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
          <div class="total"><span>Security Deposit</span><span>Rs. ${pg.rent.toLocaleString()}</span></div>
          <div class="status">✓ Booking Confirmed</div>
          <div class="footer">
            <p>Thank you for choosing SmartPG!</p>
            <p>Please show this receipt at the time of check-in.</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const pgGallery = useMemo(() => {
    const name = pg.pg_name.toLowerCase()
    
    // Mapping of PG names to their specific image slugs in /public/rooms
    const slugMap: Record<string, string> = {
      "heritage house pg": "heritage-house-pg",
      "sunshine luxury pg": "sunshine-luxury-pg",
      "city comfort pg": "city-comfort-stay",
      "green valley pg": "green-valley-residency",
      "metro living pg": "metro-stay-home",
      "elite living pg": "elite-living-studio",
      "student nest pg": "student-nest-pg",
      "capital homes pg": "capital-executive-pg",
      "metro stay home": "metro-stay-home",
      "elite living studio": "elite-living-studio",
      "city comfort stay": "city-comfort-stay",
      "green valley residency": "green-valley-residency"
    }

    let slug = slugMap[name] || name.split(' ')[0].toLowerCase()
    
    return [
      { url: pg.image, caption: "Building Exterior" },
      { url: `/rooms/study-table-custom.png`, caption: "Premium Study Table" },
      { url: `/rooms/bed-custom.png`, caption: "Comfortable Bed" },
      { url: `/rooms/${slug}-washroom.jpg`, caption: "Clean Washroom" },
    ]
  }, [pg.pg_name, pg.image])

  const [detailsPhotoIndex, setDetailsPhotoIndex] = useState(0)

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {step === "details" && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">{pg.pg_name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {pg.location}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="font-semibold">{pg.rating}</span>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({pgReviews.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="relative group h-64 rounded-xl overflow-hidden bg-muted shadow-inner border border-border/50">
                  {pgGallery[detailsPhotoIndex]?.url ? (
                    <img 
                      src={pgGallery[detailsPhotoIndex].url}
                      alt={pgGallery[detailsPhotoIndex].caption}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/rooms/building-1.png"; // Fallback
                      }}
                    />
                  ) : null}
                  
                  {/* Navigation Arrows */}
                  <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailsPhotoIndex(prev => (prev - 1 + pgGallery.length) % pgGallery.length);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailsPhotoIndex(prev => (prev + 1) % pgGallery.length);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white text-sm font-medium drop-shadow-md">{pgGallery[detailsPhotoIndex].caption}</p>
                    <div className="flex gap-1 mt-2">
                      {pgGallery.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i === detailsPhotoIndex ? 'bg-primary w-4' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {pgGallery.map((photo, i) => (
                    <div 
                      key={i}
                      onClick={() => setDetailsPhotoIndex(i)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        detailsPhotoIndex === i ? 'border-primary scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                      {detailsPhotoIndex === i && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">Price</h4>
                    <p className="text-2xl font-bold text-primary">
                      Rs. {pg.rent.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Availability</h4>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {pg.available_rooms} rooms available
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Room Type</h4>
                  <div className="flex gap-2">
                    <Badge variant={(pg.room_type || "Shared") === "Single" ? "default" : "secondary"}>
                      {pg.room_type || "Shared"}
                    </Badge>
                    {pg.ac_type?.toLowerCase().includes("ac") && <Badge variant="outline">AC</Badge>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities" className="mt-4">
                <h4 className="font-semibold mb-3">Included Utilities</h4>
                <div className="grid grid-cols-2 gap-3">
                  {pg.amenities?.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2"
                    >
                      {getAmenityIcon(amenity)}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {pgReviews.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p>No reviews yet for this PG.</p>
                    </div>
                  ) : (
                    pgReviews.map((review) => (
                      <Card key={review.review_id} className="p-4 bg-muted/30">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {review.tenants?.users?.name?.charAt(0) || "T"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{review.tenants?.users?.name || "Verified Tenant"}</p>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm italic text-foreground/80">&quot;{review.review_text}&quot;</p>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep("preferences")}
                disabled={pg.available_rooms === 0}
              >
                {pg.available_rooms > 0 ? "Book Now" : "No Rooms Available"}
              </Button>
            </div>
          </>
        )}

        {step === "rooms" && (
          <>
            <DialogHeader>
              <DialogTitle>Select a Room</DialogTitle>
              <DialogDescription>
                Choose your preferred room at {pg.pg_name}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {filteredRooms.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-muted-foreground">No rooms available for your selected room type.</p>
                  <p className="text-sm text-muted-foreground mt-2">Try selecting a different room type.</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <Card
                    key={room.roomNumber}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedRoom === room.roomNumber
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedRoom(room.roomNumber)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Room {room.roomNumber}</p>
                      <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      {room.suggested && (
                        <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/20">
                          Recommended - {room.compositionText}
                        </Badge>
                      )}
                      {!room.suggested && room.compositionText && (
                        <Badge variant="outline" className="text-muted-foreground/80 border-muted">
                          {room.compositionText}
                        </Badge>
                      )}
                      <Badge variant="outline">{room.type}</Badge>
                      {room.beds > 1 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {room.occupants}/{room.maxOccupants} occupants
                        </p>
                      )}

                    </div>
                  </div>
                </Card>
              )))}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("preferences")}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleBook}
                disabled={!selectedRoom}
              >
                Continue to Payment
              </Button>
            </div>
          </>
        )}

        {step === "preferences" && (
          <>
            <DialogHeader>
              <DialogTitle>Smart Matching</DialogTitle>
              <DialogDescription>
                Help us find you the best roommate match
              </DialogDescription>
            </DialogHeader>



            <div className="mt-6">
              <Label className="text-base">What&apos;s your sleep schedule?</Label>
              <p className="text-sm text-muted-foreground mb-4">
                We&apos;ll try to match you with compatible roommates
              </p>

              <RadioGroup value={sleepPreference} onValueChange={setSleepPreference}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      sleepPreference === "early"
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSleepPreference("early")}
                  >
                    <RadioGroupItem value="early" id="early" className="sr-only" />
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3 rounded-full bg-secondary/20 p-3">
                        <Sun className="h-6 w-6 text-secondary" />
                      </div>
                      <Label htmlFor="early" className="font-semibold cursor-pointer">
                        Early Sleeper
                      </Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        I prefer sleeping early (before 10 PM)
                      </p>
                    </div>
                  </Card>

                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      sleepPreference === "night"
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSleepPreference("night")}
                  >
                    <RadioGroupItem value="night" id="night" className="sr-only" />
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-3 rounded-full bg-primary/20 p-3">
                        <Moon className="h-6 w-6 text-primary" />
                      </div>
                      <Label htmlFor="night" className="font-semibold cursor-pointer">
                        Night Owl
                      </Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        I prefer staying up late (after 11 PM)
                      </p>
                    </div>
                  </Card>
                </div>
              </RadioGroup>
            </div>

            <div className="mt-8">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold">Booking Summary</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>PG: {pg.pg_name}</p>
                  <p>Room: {selectedRoom}</p>
                  <p>Monthly Rent: Rs. {pg.rent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => setStep("rooms")}
                disabled={!sleepPreference}
              >
                Find Best Match
              </Button>
            </div>
          </>
        )}

        {step === "registration" && (
          <div className="pt-10 pb-6 px-4 text-center">
            <h2 className="text-[32px] font-bold tracking-tight text-[#1a2b4b]">
              Welcome
            </h2>
            <p className="mt-2 text-[#7b89a8] text-lg font-medium">
              Complete your profile to book
            </p>

            <div className="mt-10 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-2 text-left">
                <label className="text-lg font-bold text-[#1a2b4b] ml-1">Email Address</label>
                <Input 
                  id="reg-email" 
                  value={guestEmail || ""} 
                  disabled 
                  className="h-14 rounded-2xl border-2 border-[#4b7b80]/20 bg-[#f0f4f4]/50 text-lg px-5 shadow-none" 
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-lg font-bold text-[#1a2b4b] ml-1">Full Name</label>
                <Input 
                  id="reg-name" 
                  placeholder="Enter your full name" 
                  value={regName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegName(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-[#4b7b80]/20 bg-[#f0f4f4]/50 focus:bg-white focus:border-[#4b7b80]/50 transition-all text-lg px-5 shadow-none"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-lg font-bold text-[#1a2b4b] ml-1">Phone Number</label>
                <Input 
                  id="reg-phone" 
                  placeholder="+91 XXXXX XXXXX" 
                  value={regPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPhone(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-[#4b7b80]/20 bg-[#f0f4f4]/50 focus:bg-white focus:border-[#4b7b80]/50 transition-all text-lg px-5 shadow-none"
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-lg font-bold text-[#1a2b4b] ml-1">Create Password</label>
                <Input 
                  id="reg-pass" 
                  type="password"
                  placeholder="Minimum 6 characters" 
                  value={regPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRegPassword(e.target.value)}
                  className="h-14 rounded-2xl border-2 border-[#4b7b80]/20 bg-[#f0f4f4]/50 focus:bg-white focus:border-[#4b7b80]/50 transition-all text-lg px-5 shadow-none"
                />
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 h-16 rounded-[32px] text-lg font-bold border-2 border-[#4b7b80]/20 text-[#7b89a8]" 
                onClick={() => setStep("rooms")}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-16 rounded-[32px] text-lg font-bold bg-[#4b7b80] hover:bg-[#3d6266] text-white transition-all shadow-none"
                onClick={handleRegistration}
                disabled={!regName || !regPhone || regPassword.length < 6}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Payment Method</DialogTitle>
              <DialogDescription>
                Select your preferred way to pay
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="grid gap-4">
                  {[
                    { id: "upi", label: "UPI (PhonePe, Google Pay)", icon: Smartphone },
                    { id: "card", label: "Credit / Debit Card", icon: CreditCard },
                    { id: "netbanking", label: "Net Banking", icon: Banknote },
                    { id: "cash", label: "Pay at PG", icon: Wallet },
                  ].map((method) => (
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
                        <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                        <div className={`rounded-full p-2 ${paymentMethod === method.id ? "bg-primary/20" : "bg-muted"}`}>
                          <method.icon className={`h-5 w-5 ${paymentMethod === method.id ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <Label htmlFor={method.id} className="flex-1 font-semibold cursor-pointer">
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

            <div className="mt-8">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-semibold">Payment Summary</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Monthly Rent</span>
                    <span>Rs. {pg.rent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit</span>
                    <span>Rs. {pg.rent.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                    <span>Total Amount</span>
                    <span>Rs. {(pg.rent * 2).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-[16px] border border-red-100/50">
                {error}
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1 h-14 rounded-[28px] text-base font-bold border-2 border-[#4b7b80]/20 text-[#7b89a8]" 
                onClick={() => setStep("rooms")}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-14 rounded-[28px] text-base font-bold bg-[#4b7b80] hover:bg-[#3d6266] text-white transition-all shadow-none"
                onClick={handlePayment}
                disabled={!paymentMethod || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    Processing Payment...
                  </div>
                ) : (
                  "Pay & Confirm"
                )}
              </Button>
            </div>
          </>
        )}
        {step === "success" && (
          <>
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                <Check className="h-8 w-8 text-secondary" />
              </div>
              <DialogTitle className="text-2xl">Booking Successful!</DialogTitle>
              <DialogDescription className="mt-2">
                Your room has been booked at {pg.pg_name}
              </DialogDescription>

              <div className="mt-6 rounded-lg bg-muted p-4 text-left">
                <h4 className="font-semibold">Booking Details</h4>
                <div className="mt-2 space-y-1 text-sm">
                  <p>PG: {pg.pg_name}</p>
                  <p>Location: {pg.location}</p>
                  <p>Room: {selectedRoom}</p>
                  <p>Monthly Rent: Rs. {pg.rent.toLocaleString()}</p>
                  <p>
                    Preference:{" "}
                    {sleepPreference === "early" ? "Early Sleeper" : "Night Owl"}
                  </p>
                  <p>
                    Payment:{" "}
                    {paymentMethod === "upi" ? "UPI" : 
                     paymentMethod === "card" ? "Credit/Debit Card" : 
                     paymentMethod === "netbanking" ? "Net Banking" : "Pay at PG"}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Payment successful! Your receipt has been sent to your email.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {isRedirecting ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 py-2 text-primary animate-pulse">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="font-medium text-sm">Redirecting to your portal in a few seconds...</span>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 gap-2" onClick={handlePrintReceipt}>
                        <Printer className="h-4 w-4" />
                        Print Receipt
                      </Button>
                      <Button className="flex-1" onClick={() => {
                        router.push("/find-pgs")
                        handleClose()
                      }}>
                        Continue Exploring
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleClose}>
                      Close
                    </Button>
                    <Button className="flex-1" onClick={() => {
                      router.push("/login")
                      handleClose()
                    }}>
                      Go to Login
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* Room Photo Gallery Dialog */}
    <Dialog open={showRoomPhotos} onOpenChange={handleCloseRoomPhotos}>
      <DialogContent className="max-h-[90vh] max-w-4xl p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="text-white">
              <DialogTitle className="font-semibold text-lg">
                Room {selectedRoomForPhotos}
              </DialogTitle>
              <DialogDescription className="text-sm text-white/80">
                {selectedRoomForPhotos && pgRooms.find((r: any) => r.roomNumber === selectedRoomForPhotos)?.type}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseRoomPhotos}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Photo Display */}
          <div className="relative bg-muted">
            {selectedRoomForPhotos && currentRoomPhotos.length > 0 && (
              <div className="aspect-video relative overflow-hidden bg-muted">
                {currentRoomPhotos[currentPhotoIndex]?.url ? (
                  <img 
                    src={currentRoomPhotos[currentPhotoIndex].url}
                    alt={currentRoomPhotos[currentPhotoIndex].caption}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/20 to-secondary/20 ${currentRoomPhotos[currentPhotoIndex]?.url ? 'hidden' : ''}`}>
                  <Camera className="h-12 w-12 text-primary/40" />
                  <p className="text-sm font-medium text-primary/70">Room photos removed</p>
                </div>
                {/* Photo counter */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                  {currentPhotoIndex + 1} / {currentRoomPhotos.length}
                </div>
                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
                  onClick={handlePrevPhoto}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60"
                  onClick={handleNextPhoto}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>

          {/* Photo Thumbnails Grid */}
          <div className="p-4 bg-background">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              Room Photos
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {currentRoomPhotos.map((photo: any, index: number) => (
                <div
                  key={photo.id}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                    currentPhotoIndex === index
                      ? "border-primary scale-105 shadow-md"
                      : "border-transparent hover:border-primary/50"
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {currentRoomPhotos[currentPhotoIndex]?.caption}
            </p>
          </div>

          {/* Room Details */}
          <div className="p-4 border-t bg-muted/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {selectedRoomForPhotos &&
                    pgRooms.find((r: any) => r.roomNumber === selectedRoomForPhotos)?.beds}
                </p>
                <p className="text-xs text-muted-foreground">Bed(s)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {selectedRoomForPhotos &&
                    pgRooms.find((r: any) => r.roomNumber === selectedRoomForPhotos)?.floor}
                </p>
                <p className="text-xs text-muted-foreground">Floor</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {selectedRoomForPhotos &&
                    (pgRooms.find((r: any) => r.roomNumber === selectedRoomForPhotos)?.maxOccupants || 1)}
                </p>
                <p className="text-xs text-muted-foreground">Max Occupants</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
