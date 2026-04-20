"use client"

import { useState } from "react"
import { Utensils, Star, Coffee, Sun, Moon, Edit2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAppState } from "@/lib/app-context"
import { getAverageFoodRating, getUserByTenantId, type FoodMenu } from "@/lib/data-store"

export default function FoodMenuPage() {
  const { foodMenu, foodRatings, tenants, users, updateFoodMenu } = useAppState()
  const [editingMenu, setEditingMenu] = useState<any>(null)
  const [formData, setFormData] = useState({ breakfast: "", lunch: "", dinner: "" })

  const avgRating = getAverageFoodRating(foodRatings)

  // Group foodMenu by day for easier display
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const groupedMenu = days.map(day => {
    const dayMeals = foodMenu.filter(m => m.day_of_week === day)
    return {
      day,
      breakfast: dayMeals.find(m => m.meal_type === "Breakfast"),
      lunch: dayMeals.find(m => m.meal_type === "Lunch"),
      dinner: dayMeals.find(m => m.meal_type === "Dinner")
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

  const handleEdit = (dayMenu: any) => {
    setEditingMenu(dayMenu)
    setFormData({
      breakfast: dayMenu.breakfast?.items || "",
      lunch: dayMenu.lunch?.items || "",
      dinner: dayMenu.dinner?.items || "",
    })
  }

  const handleSave = async () => {
    if (editingMenu) {
      const dayMenu = editingMenu as any;
      
      // Update each meal type
      const updates = [];
      if (dayMenu.breakfast) updates.push(updateFoodMenu(dayMenu.breakfast.menu_id, { items: formData.breakfast }));
      if (dayMenu.lunch) updates.push(updateFoodMenu(dayMenu.lunch.menu_id, { items: formData.lunch }));
      if (dayMenu.dinner) updates.push(updateFoodMenu(dayMenu.dinner.menu_id, { items: formData.dinner }));
      
      await Promise.all(updates);

      toast.success(`${dayMenu.day} menu updated successfully`)
      setEditingMenu(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Food Menu</h1>
        <p className="mt-2 text-muted-foreground">
          Weekly food schedule and ratings
        </p>
      </div>

      {/* Today's Menu & Rating */}
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
                <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
                  <Coffee className="mt-0.5 h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Breakfast</p>
                    <p className="text-sm text-muted-foreground">{todayMenu.breakfast}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
                  <Sun className="mt-0.5 h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Lunch</p>
                    <p className="text-sm text-muted-foreground">{todayMenu.lunch}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-muted p-3">
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
              Food Rating
            </CardTitle>
            <CardDescription>Average rating from tenants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-4">
              <div className="flex items-center gap-2">
                <span className="text-5xl font-bold">{avgRating}</span>
                <span className="text-2xl text-muted-foreground">/ 5</span>
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
                Based on {foodRatings.length} ratings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Menu */}
      <Card className="mb-8">
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
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>{menu.breakfast?.items || "No menu"}</TableCell>
                    <TableCell>{menu.lunch?.items || "No menu"}</TableCell>
                    <TableCell>{menu.dinner?.items || "No menu"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(menu)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Ratings</CardTitle>
          <CardDescription>Latest feedback from tenants</CardDescription>
        </CardHeader>
        <CardContent>
          {foodRatings.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No ratings yet
            </p>
          ) : (
            <div className="space-y-4">
              {foodRatings
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((rating) => {
                  const user = getUserByTenantId(tenants, users, rating.tenant_id)
                  return (
                    <div
                      key={rating.rating_id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user?.name || "Anonymous"}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= rating.rating
                                    ? "fill-secondary text-secondary"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {rating.comment}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMenu} onOpenChange={(open) => !open && setEditingMenu(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Menu - {editingMenu?.day}</DialogTitle>
            <DialogDescription>
              Make changes to the food menu for this day.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="breakfast">Breakfast</Label>
              <Input
                id="breakfast"
                value={formData.breakfast}
                onChange={(e) => setFormData({ ...formData, breakfast: e.target.value })}
                placeholder="Enter breakfast items"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lunch">Lunch</Label>
              <Input
                id="lunch"
                value={formData.lunch}
                onChange={(e) => setFormData({ ...formData, lunch: e.target.value })}
                placeholder="Enter lunch items"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dinner">Dinner</Label>
              <Input
                id="dinner"
                value={formData.dinner}
                onChange={(e) => setFormData({ ...formData, dinner: e.target.value })}
                placeholder="Enter dinner items"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMenu(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

