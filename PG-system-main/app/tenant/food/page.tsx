"use client"

import { useState } from "react"
import { Utensils, Star, Coffee, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { useAppState } from "@/lib/app-context"
import { getAverageFoodRating } from "@/lib/data-store"

export default function TenantFoodPage() {
  const { currentUser } = useAuth()
  const { foodMenu, foodRatings, tenants, users, addFoodRating } = useAppState()
  const [selectedRating, setSelectedRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get current tenant
  const tenant = tenants.find((t) => {
    const user = users.find((u) => u.user_id === t.user_id)
    return user?.email === currentUser?.email
  })

  const avgRating = getAverageFoodRating(foodRatings)

  // Group foodMenu by day for easier display
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const groupedMenu = days.map(day => {
    const dayMeals = foodMenu.filter(m => m.day_of_week === day)
    return {
      day,
      breakfast: dayMeals.find(m => m.meal_type === "Breakfast")?.items || "No menu",
      lunch: dayMeals.find(m => m.meal_type === "Lunch")?.items || "No menu",
      dinner: dayMeals.find(m => m.meal_type === "Dinner")?.items || "No menu"
    }
  })

  // Get today's day
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const todayMeals = foodMenu.filter((m) => m.day_of_week === today)
  const todayMenu = {
    breakfast: todayMeals.find(m => m.meal_type === "Breakfast")?.items,
    lunch: todayMeals.find(m => m.meal_type === "Lunch")?.items,
    dinner: todayMeals.find(m => m.meal_type === "Dinner")?.items,
  }

  const handleSubmitRating = () => {
    if (!tenant || selectedRating === 0) return

    addFoodRating({
      tenant_id: tenant.tenant_id,
      rating: selectedRating,
      comment: comment,
    })

    setSelectedRating(0)
    setComment("")
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Food Menu</h1>
        <p className="mt-2 text-muted-foreground">
          View weekly menu and rate your meals
        </p>
      </div>

      {/* Today's Menu & Rating Action */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Today&apos;s Menu
              </CardTitle>
              <Badge variant="secondary">{today}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {todayMenu ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
                  <Coffee className="mt-0.5 h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Breakfast</p>
                    <p className="text-sm text-muted-foreground">{todayMenu.breakfast}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
                  <Sun className="mt-0.5 h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Lunch</p>
                    <p className="text-sm text-muted-foreground">{todayMenu.lunch}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
                  <Moon className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Dinner</p>
                    <p className="text-sm text-muted-foreground">{todayMenu.dinner}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No menu available for today
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Rate Food
            </CardTitle>
            <CardDescription>Share your feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold">{avgRating}</span>
                <span className="text-xl text-muted-foreground">/ 5</span>
              </div>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(avgRating)
                        ? "fill-secondary text-secondary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Average rating from {foodRatings.length} reviews
              </p>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    <Star className="mr-2 h-4 w-4" />
                    Rate Today&apos;s Food
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rate Today&apos;s Food</DialogTitle>
                    <DialogDescription>
                      Share your feedback about today&apos;s meals
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Your Rating</Label>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= selectedRating
                                  ? "fill-secondary text-secondary"
                                  : "text-muted hover:text-secondary/50"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment">Comment (Optional)</Label>
                      <Textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about the food..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitRating} disabled={selectedRating === 0}>
                      Submit Rating
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Menu */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Menu</CardTitle>
          <CardDescription>Full week food schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Breakfast</TableHead>
                  <TableHead>Lunch</TableHead>
                  <TableHead>Dinner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedMenu.map((menu) => (
                  <TableRow
                    key={menu.day}
                    className={menu.day === today ? "bg-secondary/10" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {menu.day}
                        {menu.day === today && (
                          <Badge variant="secondary" className="text-xs">
                            Today
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{menu.breakfast}</TableCell>
                    <TableCell>{menu.lunch}</TableCell>
                    <TableCell>{menu.dinner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
