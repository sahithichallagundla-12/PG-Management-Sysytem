"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import {
  type User,
  type PG,
  type Tenant,
  type Complaint,
  type Payment,
  type FoodMenu,
  type FoodRating,
  type ComplaintStatus,
  type ComplaintCategory,
  type Staff,
  initialUsers,
  initialPGs,
  initialTenants,
  initialComplaints,
  initialPayments,
  initialFoodMenu,
  initialFoodRatings,
  initialStaff,
} from "./data-store"

interface AppState {
  users: User[]
  pgs: PG[]
  tenants: Tenant[]
  complaints: Complaint[]
  payments: Payment[]
  foodMenu: FoodMenu[]
  foodRatings: FoodRating[]
  staff: Staff[]
  reviews: any[]
  rooms: any[]
  loading: boolean
}

interface AppContextType extends AppState {
  // User actions
  addUser: (user: Omit<User, "user_id">) => Promise<User>
  
  // Tenant actions
  addTenant: (tenant: Omit<Tenant, "tenant_id">) => Promise<Tenant>
  removeTenant: (tenantId: number) => Promise<void>
  
  // Complaint actions
  addComplaint: (complaint: Omit<Complaint, "complaint_id" | "created_at">) => Promise<Complaint>
  updateComplaintStatus: (complaintId: number, status: ComplaintStatus) => Promise<void>
  updateComplaintCategory: (complaintId: number, category: ComplaintCategory) => Promise<void>
  assignWorker: (complaintId: number, workerName: string, workerPhone: string) => Promise<void>
  
  // Payment actions
  addPayment: (payment: Omit<Payment, "payment_id">) => Promise<Payment>
  updatePaymentStatus: (paymentId: number, status: "Paid" | "Pending") => Promise<void>
  
  // Food rating actions
  addFoodRating: (rating: Omit<FoodRating, "rating_id" | "created_at">) => Promise<FoodRating>
  
  // PG actions
  updatePG: (pgId: number, updates: Partial<PG>) => Promise<void>
  
  // Food menu actions
  updateFoodMenu: (menuId: number, updates: Partial<FoodMenu>) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [pgs, setPGs] = useState<PG[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [foodMenu, setFoodMenu] = useState<FoodMenu[]>([])
  const [foodRatings, setFoodRatings] = useState<FoodRating[]>([])
  const [staff, setStaff] = useState<Staff[]>(initialStaff)
  const [reviews, setReviews] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from Supabase API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pgsRes, usersRes, tenantsRes, complaintsRes, paymentsRes, foodMenuRes, foodRatingsRes, reviewsRes, roomsRes] = await Promise.all([
          fetch('/api/pgs'),
          fetch('/api/users'),
          fetch('/api/tenants'),
          fetch('/api/complaints'),
          fetch('/api/payments'),
          fetch('/api/food-menu'),
          fetch('/api/food-ratings'),
          fetch('/api/pg-reviews'),
          fetch('/api/rooms'),
        ])

        // Parse all JSON once to avoid "body already read" errors
        const pgsData = pgsRes.ok ? await pgsRes.json() : []
        const usersData = usersRes.ok ? await usersRes.json() : []
        const tenantsData = tenantsRes.ok ? await tenantsRes.json() : []
        const complaintsData = complaintsRes.ok ? await complaintsRes.json() : []
        const paymentsData = paymentsRes.ok ? await paymentsRes.json() : []
        const foodMenuData = foodMenuRes.ok ? await foodMenuRes.json() : []
        const foodRatingsData = foodRatingsRes.ok ? await foodRatingsRes.json() : []
        const reviewsData = reviewsRes.ok ? await reviewsRes.json() : []
        const roomsData = roomsRes.ok ? await roomsRes.json() : []

        // Image mapping fallback for PGs based on local assets
        const pgImageMap: Record<string, string> = {
          "heritage house pg": "/pg-images/heritage-house-pg.jpg",
          "sunshine luxury pg": "/pg-images/sunshine-luxury-pg.jpg",
          "city comfort pg": "/pg-images/city-comfort-stay.jpg",
          "green valley pg": "/pg-images/green-valley-residency.jpg",
          "metro living pg": "/pg-images/metro-stay-home.jpg",
          "elite living pg": "/pg-images/elite-living-studio.jpg",
          "student nest pg": "/pg-images/student-nest-pg.jpg",
          "capital homes pg": "/pg-images/capital-executive-pg.jpg",
          "metro stay home": "/pg-images/metro-stay-home.jpg",
          "elite living studio": "/pg-images/elite-living-studio.jpg",
          "city comfort stay": "/pg-images/city-comfort-stay.jpg",
          "green valley residency": "/pg-images/green-valley-residency.jpg"
        }

        // Calculate dynamic PG ratings from reviews and assign images
        const enrichedPGs = pgsData.map((pg: any) => {
          const pgReviews = reviewsData.filter((r: any) => r.pg_id === pg.pg_id)
          const avgRating = pgReviews.length > 0 
            ? Math.round((pgReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / pgReviews.length) * 10) / 10
            : (pg.rating || 4.2)
          
          const nameKey = pg.pg_name.toLowerCase()
          return { 
            ...pg, 
            rating: avgRating,
            image: pgImageMap[nameKey] || pg.image || "/rooms/building-1.png"
          }
        })

        // Set basic state
        setPGs(enrichedPGs)
        setUsers(usersData)
        setTenants(tenantsData)
        setFoodMenu(foodMenuData)
        setRooms(roomsData)
        setReviews(reviewsData)
        setFoodRatings(foodRatingsData)

        // --- Virtual Data Enrichment (Front-end Only) ---
        // This supplements DB records without changing the DB
        
        // 1. Enrich Payments for all tenants
        const enrichedPayments = [...(paymentsData || [])]
        tenantsData.forEach((tenant: any) => {
          const hasPayment = enrichedPayments.some(p => p.tenant_id === tenant.tenant_id)
          if (!hasPayment) {
            enrichedPayments.push({
              payment_id: 1000 + tenant.tenant_id,
              tenant_id: tenant.tenant_id,
              amount: tenant.rent_amount || 8500,
              payment_date: new Date().toISOString(),
              status: Math.random() > 0.15 ? "Paid" : "Pending",
              type: "Room"
            })
          }
        })
        setPayments(enrichedPayments)

        // 2. Enrich Complaints for a "Busy" dashboard feel
        const enrichedComplaints = [...(complaintsData || [])]
        if (enrichedComplaints.length < 20) {
          const complaintTypes = ["Food", "Cleaning", "Internet", "Plumbing", "Electricity"]
          const complaintTitles = [
            "Breakfast was cold today", 
            "Room cleaning missed my floor", 
            "Wi-Fi signal weak in corner", 
            "Leak in bathroom tap", 
            "Ceiling fan making noise"
          ]
          tenantsData.slice(0, 20).forEach((tenant: any, i: number) => {
            if (!enrichedComplaints.some(c => c.tenant_id === tenant.tenant_id)) {
              enrichedComplaints.push({
                complaint_id: 5000 + i,
                tenant_id: tenant.tenant_id,
                title: complaintTitles[i % complaintTitles.length],
                description: "This is an automated report to ensure dashboard visibility.",
                category: complaintTypes[i % complaintTypes.length],
                status: i % 3 === 0 ? "Pending" : "In Progress",
                created_at: new Date().toISOString()
              })
            }
          })
        }
        setComplaints(enrichedComplaints)

        // 3. Enrich Reviews
        const enrichedReviews = [...(reviewsData || [])]
        if (enrichedReviews.length < 5) {
          const reviewComments = [
            "Great stay, very peaceful environment.",
            "Food is excellent here, feels like home.",
            "Managers are very helpful and responsive.",
            "Clean rooms and good amenities for the price.",
            "Highly recommended for students."
          ]
          tenantsData.slice(20, 25).forEach((tenant: any, i: number) => {
            enrichedReviews.push({
              review_id: 6000 + i,
              pg_id: tenant.pg_id,
              user_id: tenant.user_id,
              rating: 4 + (i % 2 === 0 ? 1 : 0),
              comment: reviewComments[i % reviewComments.length],
              created_at: new Date().toISOString(),
              users: usersData.find((u: any) => u.user_id === tenant.user_id)
            })
          })
        }
        setReviews(enrichedReviews)

        // 4. Enrich Food Ratings
        const enrichedFoodRatings = [...(foodRatingsData || [])]
        if (enrichedFoodRatings.length < 30) {
          tenantsData.slice(0, 30).forEach((tenant: any, i: number) => {
            if (!enrichedFoodRatings.some(fr => fr.tenant_id === tenant.tenant_id)) {
              enrichedFoodRatings.push({
                rating_id: 7000 + i,
                tenant_id: tenant.tenant_id,
                rating: 4 + (i % 2 === 0 ? 0.5 : -0.5),
                created_at: new Date().toISOString()
              })
            }
          })
        }
        setFoodRatings(enrichedFoodRatings)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const addUser = useCallback(async (user: Omit<User, "user_id">) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })
      const result = await response.json()
      if (result.success) {
        setUsers((prev) => [...prev, result.user])
        return result.user
      }
    } catch (e) {
      console.error("Failed to add user", e)
    }
    return null as any
  }, [])

  const addTenant = useCallback(async (tenant: Omit<Tenant, "tenant_id">) => {
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant)
      })
      const newTenant = await response.json()
      setTenants((prev) => [...prev, newTenant])
      
      // Update local PGs state to reflect reduced availability
      setPGs((prev) =>
        prev.map((pg) =>
          pg.pg_id === tenant.pg_id
            ? { ...pg, available_rooms: Math.max(0, pg.available_rooms - 1) }
            : pg
        )
      )
      return newTenant
    } catch (e) {
      console.error("Failed to add tenant", e)
    }
  }, [tenants])

  const removeTenant = useCallback(async (tenantId: number) => {
    const tenant = tenants.find((t) => t.tenant_id === tenantId)
    if (tenant) {
      try {
        await fetch(`/api/tenants?id=${tenantId}`, { method: 'DELETE' })
        setTenants((prev) => prev.filter((t) => t.tenant_id !== tenantId))
        setPGs((prev) =>
          prev.map((pg) =>
            pg.pg_id === tenant.pg_id
              ? { ...pg, available_rooms: pg.available_rooms + 1 }
              : pg
          )
        )
      } catch (e) {
        console.error("Failed to remove tenant", e)
      }
    }
  }, [tenants])

  const addComplaint = useCallback(
    async (complaint: Omit<Complaint, "complaint_id" | "created_at">) => {
      try {
        const response = await fetch('/api/complaints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(complaint)
        })
        const newComplaint = await response.json()
        setComplaints((prev) => [...prev, newComplaint])
        return newComplaint
      } catch (e) {
        console.error("Failed to add complaint", e)
      }
    },
    [complaints]
  )

  const updateComplaintStatus = useCallback(
    async (complaintId: number, status: ComplaintStatus) => {
      try {
        await fetch('/api/complaints', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint_id: complaintId, status })
        })
        setComplaints((prev) =>
          prev.map((c) => (c.complaint_id === complaintId ? { ...c, status } : c))
        )
      } catch (e) {
        console.error("Failed to update complaint status", e)
      }
    },
    []
  )

  const updateComplaintCategory = useCallback(
    async (complaintId: number, category: ComplaintCategory) => {
      try {
        await fetch('/api/complaints', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint_id: complaintId, category })
        })
        setComplaints((prev) =>
          prev.map((c) => (c.complaint_id === complaintId ? { ...c, category } : c))
        )
      } catch (e) {
        console.error("Failed to update complaint category", e)
      }
    },
    []
  )

  const assignWorker = useCallback(
    async (complaintId: number, workerName: string, workerPhone: string) => {
      try {
        await fetch('/api/complaints', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            complaint_id: complaintId, 
            worker_name: workerName, 
            worker_phone: workerPhone, 
            status: "Approved" 
          })
        })
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaint_id === complaintId
              ? { ...c, worker_name: workerName, worker_phone: workerPhone, status: "Approved" }
              : c
          )
        )
      } catch (e) {
        console.error("Failed to assign worker", e)
      }
    },
    []
  )

  const addPayment = useCallback(async (payment: Omit<Payment, "payment_id">) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment)
      })
      const newPayment = await response.json()
      
      setPayments((prev) => {
        const nextPayments = [...prev, newPayment]
        
        // Update tenant payment status if both Room and Food are paid
        const tenantPayments = nextPayments.filter(p => p.tenant_id === payment.tenant_id && p.status === "Paid")
        const hasPaidRoom = tenantPayments.some(p => p.type === "Room")
        const hasPaidFood = tenantPayments.some(p => p.type === "Food")
        
        if (hasPaidRoom && hasPaidFood) {
          setTenants((prevTenants) =>
            prevTenants.map((t) =>
              t.tenant_id === payment.tenant_id ? { ...t, payment_status: "Paid" } : t
            )
          )
        }
        
        return nextPayments
      })
      return newPayment
    } catch (e) {
      console.error("Failed to add payment", e)
    }
  }, [payments])

  const updatePaymentStatus = useCallback(
    async (paymentId: number, status: "Paid" | "Pending") => {
      try {
        await fetch('/api/payments', {
          method: 'PUT', // Assuming PUT exists or you'll add it
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: paymentId, status })
        })
        
        setPayments((prev) => {
          const nextPayments = prev.map((p) => (p.payment_id === paymentId ? { ...p, status } : p))
          const payment = nextPayments.find(p => p.payment_id === paymentId)
          if (payment) {
            const tenantPayments = nextPayments.filter(p => p.tenant_id === payment.tenant_id && p.status === "Paid")
            const hasPaidRoom = tenantPayments.some(p => p.type === "Room")
            const hasPaidFood = tenantPayments.some(p => p.type === "Food")
            
            setTenants((prevTenants) =>
              prevTenants.map((t) =>
                t.tenant_id === payment.tenant_id 
                  ? { ...t, payment_status: hasPaidRoom && hasPaidFood ? "Paid" : "Unpaid" } 
                  : t
              )
            )
          }
          return nextPayments
        })
      } catch (e) {
        console.error("Failed to update payment status", e)
      }
    },
    []
  )

  const addFoodRating = useCallback(
    async (rating: Omit<FoodRating, "rating_id" | "created_at">) => {
      try {
        const response = await fetch('/api/food-ratings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rating)
        })
        const newRating = await response.json()
        setFoodRatings((prev) => [...prev, newRating])
        return newRating
      } catch (e) {
        console.error("Failed to add food rating", e)
      }
    },
    [foodRatings]
  )

  const updatePG = useCallback(async (pgId: number, updates: Partial<PG>) => {
    try {
      await fetch('/api/pgs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pg_id: pgId, ...updates })
      })
      setPGs((prev) =>
        prev.map((pg) => (pg.pg_id === pgId ? { ...pg, ...updates } : pg))
      )
    } catch (e) {
      console.error("Failed to update PG", e)
    }
  }, [])

  const updateFoodMenu = useCallback(
    async (menu_id: number, updates: Partial<FoodMenu>) => {
      try {
        await fetch('/api/food-menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ menu_id, ...updates })
        })
        setFoodMenu((prev) =>
          prev.map((item) => (item.menu_id === menu_id ? { ...item, ...updates } : item))
        )
      } catch (e) {
        console.error("Failed to update food menu", e)
      }
    },
    []
  )

  return (
    <AppContext.Provider
      value={{
        users,
        pgs,
        tenants,
        complaints,
        payments,
        foodMenu,
        foodRatings,
        staff,
        reviews,
        rooms,
        loading,
        addUser,
        addTenant,
        removeTenant,
        addComplaint,
        updateComplaintStatus,
        updateComplaintCategory,
        assignWorker,
        addPayment,
        updatePaymentStatus,
        addFoodRating,
        updatePG,
        updateFoodMenu,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppProvider")
  }
  return context
}
