"use client"

import { Star, Filter, MessageSquare, ShieldCheck, ShieldX } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/animated-card"
import { motion } from "framer-motion"
import { staggerContainer } from "@/lib/motions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAppState } from "@/lib/app-context"
import { useState } from "react"

export default function OwnerReviewsPage() {
  const { reviews, pgs, tenants, users } = useAppState()
  const [pgFilter, setPgFilter] = useState<string>("all")

  const filteredReviews = reviews.filter(r => 
    pgFilter === "all" || String(r.pg_id) === pgFilter
  )

  const getTenantName = (tenantId: number) => {
    // Attempt join from API data
    const review = reviews.find(r => r.tenant_id === tenantId);
    if (review?.tenants?.users?.name) return review.tenants.users.name;
    
    // Fallback to local context searching
    const tenant = tenants.find(t => t.tenant_id === tenantId);
    const user = users.find(u => u.user_id === tenant?.user_id);
    return user?.name || `Tenant #${tenantId}`;
  }

  const getPgName = (pgId: number) => {
    const pg = pgs.find(p => p.pg_id === pgId);
    return pg?.pg_name || `PG #${pgId}`;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">PG Reviews</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor feedback and ratings from your tenants
        </p>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6 grid gap-4 sm:grid-cols-3">
        <AnimatedCard>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Reviews</h3>
            <div className="mt-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{reviews.length}</span>
            </div>
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Avg. Rating</h3>
            <div className="mt-2 flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)}
              </span>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>All Database Reviews</CardTitle>
          <CardDescription>
            Showing {filteredReviews.length} live reviews from the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>PG Property</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[400px]">Review Text</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reviews found in the database.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.review_id}>
                      <TableCell className="font-medium">
                        {getTenantName(review.tenant_id)}
                      </TableCell>
                      <TableCell>{getPgName(review.pg_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm italic">
                        &quot;{review.review_text}&quot;
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={review.is_approved ? "secondary" : "outline"} className="flex gap-1 items-center w-fit">
                          {review.is_approved ? <ShieldCheck className="h-3 w-3" /> : <ShieldX className="h-3 w-3" />}
                          {review.is_approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
