// Mock Data Store for Smart PG Management System
// This simulates a database with all tables and relationships

export type UserRole = "owner" | "tenant" | "newuser" | "service_provider"

export interface User {
  user_id: number
  name: string
  email: string
  password?: string
  password_hash?: string
  role: UserRole
  phone: string
  place: string
  is_active?: boolean
}

export interface Staff {
  staff_id: number
  name: string
  phone: string
  category: ComplaintCategory
  status: "Available" | "Busy" | "On Leave"
}

export interface PG {
  pg_id: number
  owner_id: number | string // Linked to users.user_id
  pg_name: string
  location: string
  total_rooms: number
  available_rooms: number
  rent: number
  rating: number
  amenities?: string[]
  room_type?: "Single" | "2 Sharing" | "3 Sharing" | "4 Sharing" | "5 Sharing" | "Shared" | "Both"
  ac_type?: "AC" | "Non-AC" | "Both"
  image?: string
}

export interface Tenant {
  tenant_id: number
  user_id: number
  pg_id: number
  room_number: number | string
  room_type: "Single" | "2 Sharing" | "3 Sharing" | "4 Sharing" | "5 Sharing" | "Shared"
  payment_status: "Paid" | "Unpaid"
  sleep_preference?: "Early Sleeper" | "Night Owl"
}

export type ComplaintCategory = "Food" | "Cleaning" | "Plumbing" | "Electricity" | "Carpenter" | "AC Technician" | "Internet" | "Other"
export type ComplaintStatus = "Pending" | "In Progress" | "Approved" | "Checked" | "Not Completed" | "Reraised" | "Completed"

export interface Complaint {
  complaint_id: number
  tenant_id: number
  title: string
  description: string
  category: ComplaintCategory
  status: ComplaintStatus
  worker_name: string | null
  worker_phone: string | null
  created_at: string
}

export interface Payment {
  payment_id: number
  tenant_id: number
  amount: number
  type: "Room" | "Food"
  room_type?: "Single" | "2 Sharing" | "3 Sharing" | "4 Sharing" | "5 Sharing" | "Shared"
  status: "Paid" | "Pending"
  payment_date: string
}

export interface FoodMenu {
  menu_id: number
  pg_id?: number
  day_of_week: string
  meal_type: string // "Breakfast", "Lunch", "Dinner"
  items: string
  timing?: string
  special_notes?: string
}

export interface FoodRating {
  rating_id: number
  tenant_id: number
  rating: number
  comment: string
  created_at: string
}

// Initial Mock Data - Synced with Supabase DB (2026-04-14)
export const initialUsers: User[] = [
  // Owner Accounts (8 owners)
  { user_id: 50, name: "Rahul Singh", email: "owner.sunshine@pgowner.com", password_hash: "", role: "owner", phone: "9876543201", place: "Hyderabad" },
  { user_id: 51, name: "Sneha Reddy", email: "owner.greenvalley@pgowner.com", password_hash: "", role: "owner", phone: "9876543202", place: "Bangalore" },
  { user_id: 52, name: "Amit Patel", email: "owner.citycomfort@pgowner.com", password_hash: "", role: "owner", phone: "9876543203", place: "Mumbai" },
  { user_id: 53, name: "Neha Sharma", email: "owner.eliteliving@pgowner.com", password_hash: "", role: "owner", phone: "9876543204", place: "Delhi" },
  { user_id: 5, name: "Vikram Singh", email: "vikram.singh@pgowner.com", password_hash: "", role: "owner", phone: "9876543214", place: "Chennai" },
  { user_id: 55, name: "Pooja Desai", email: "owner.metrostay@pgowner.com", password_hash: "", role: "owner", phone: "9876543206", place: "Pune" },
  { user_id: 56, name: "Suresh Menon", email: "owner.capital@pgowner.com", password_hash: "", role: "owner", phone: "9876543207", place: "Gurgaon" },
  { user_id: 57, name: "Kavya Iyer", email: "owner.studentnest@pgowner.com", password_hash: "", role: "owner", phone: "9876543208", place: "Hyderabad" },
  // Service Provider Account
  {
    user_id: 32,
    name: "Shyam",
    email: "services.all@email.com",
    password_hash: "",
    role: "service_provider",
    phone: "9900110002",
    place: "Bangalore",
  },
  // Tenant Accounts (25 tenants, user_id 6-30)
  { user_id: 6, name: "Rahul Verma", email: "rahul.verma@email.com", password_hash: "", role: "tenant", phone: "9988776601", place: "Bangalore" },
  { user_id: 7, name: "Sneha Iyer", email: "sneha.iyer@email.com", password_hash: "", role: "tenant", phone: "9988776602", place: "Chennai" },
  { user_id: 8, name: "Arjun Nair", email: "arjun.nair@email.com", password_hash: "", role: "tenant", phone: "9988776603", place: "Kerala" },
  { user_id: 9, name: "Kavitha Menon", email: "kavitha.menon@email.com", password_hash: "", role: "tenant", phone: "9988776604", place: "Bangalore" },
  { user_id: 10, name: "Deepak Joshi", email: "deepak.joshi@email.com", password_hash: "", role: "tenant", phone: "9988776605", place: "Pune" },
  { user_id: 11, name: "Ananya Das", email: "ananya.das@email.com", password_hash: "", role: "tenant", phone: "9988776606", place: "Kolkata" },
  { user_id: 12, name: "Rohit Saxena", email: "rohit.saxena@email.com", password_hash: "", role: "tenant", phone: "9988776607", place: "Delhi" },
  { user_id: 13, name: "Meera Krishnan", email: "meera.krishnan@email.com", password_hash: "", role: "tenant", phone: "9988776608", place: "Mumbai" },
  { user_id: 14, name: "Sanjay Gupta", email: "sanjay.gupta@email.com", password_hash: "", role: "tenant", phone: "9988776609", place: "Bangalore" },
  { user_id: 15, name: "Pooja Agarwal", email: "pooja.agarwal@email.com", password_hash: "", role: "tenant", phone: "9988776610", place: "Hyderabad" },
  { user_id: 16, name: "Karthik Raman", email: "karthik.raman@email.com", password_hash: "", role: "tenant", phone: "9988776611", place: "Chennai" },
  { user_id: 17, name: "Divya Pillai", email: "divya.pillai@email.com", password_hash: "", role: "tenant", phone: "9988776612", place: "Kerala" },
  { user_id: 18, name: "Nikhil Bhatt", email: "nikhil.bhatt@email.com", password_hash: "", role: "tenant", phone: "9988776613", place: "Ahmedabad" },
  { user_id: 19, name: "Swati Mishra", email: "swati.mishra@email.com", password_hash: "", role: "tenant", phone: "9988776614", place: "Lucknow" },
  { user_id: 20, name: "Arun Prakash", email: "arun.prakash@email.com", password_hash: "", role: "tenant", phone: "9988776615", place: "Bangalore" },
  { user_id: 21, name: "Priyanka Shah", email: "priyanka.shah@email.com", password_hash: "", role: "tenant", phone: "9988776616", place: "Mumbai" },
  { user_id: 22, name: "Varun Malhotra", email: "varun.malhotra@email.com", password_hash: "", role: "tenant", phone: "9988776617", place: "Delhi" },
  { user_id: 23, name: "Lakshmi Rao", email: "lakshmi.rao@email.com", password_hash: "", role: "tenant", phone: "9988776618", place: "Hyderabad" },
  { user_id: 24, name: "Suresh Kumar", email: "suresh.kumar@email.com", password_hash: "", role: "tenant", phone: "9988776619", place: "Chennai" },
  { user_id: 25, name: "Anjali Chopra", email: "anjali.chopra@email.com", password_hash: "", role: "tenant", phone: "9988776620", place: "Bangalore" },
  { user_id: 26, name: "Manish Tiwari", email: "manish.tiwari@email.com", password_hash: "", role: "tenant", phone: "9988776621", place: "Pune" },
  { user_id: 27, name: "Rekha Nayak", email: "rekha.nayak@email.com", password_hash: "", role: "tenant", phone: "9988776622", place: "Mumbai" },
  { user_id: 28, name: "Ajay Sinha", email: "ajay.sinha@email.com", password_hash: "", role: "tenant", phone: "9988776623", place: "Kolkata" },
  { user_id: 29, name: "Neha Kapoor", email: "neha.kapoor@email.com", password_hash: "", role: "tenant", phone: "9988776624", place: "Delhi" },
  { user_id: 30, name: "Vijay Krishna", email: "vijay.krishna@email.com", password_hash: "", role: "tenant", phone: "9988776625", place: "Hyderabad" },
]

export const initialPGs: PG[] = [
  {
    pg_id: 1,
    owner_id: 50,
    pg_name: "Sunshine PG",
    location: "Madhapur, Hyderabad",
    total_rooms: 20,
    available_rooms: 5,
    rent: 8000,
    rating: 4.5,
    amenities: ["WiFi", "Laundry", "Parking", "Gym"],
    room_type: "Both",
    ac_type: "Both",
    image: "/pg-images/pg1-sunshine.jpg"
  },
  {
    pg_id: 2,
    owner_id: 51,
    pg_name: "Green Valley PG",
    location: "Koramangala, Bangalore",
    total_rooms: 15,
    available_rooms: 3,
    rent: 10000,
    rating: 4.2,
    amenities: ["WiFi", "Food", "Security"],
    room_type: "Single",
    ac_type: "AC",
    image: "/pg-images/pg3-citycomfort.jpg"
  },
  {
    pg_id: 3,
    owner_id: 52,
    pg_name: "City Comfort PG",
    location: "Andheri, Mumbai",
    total_rooms: 25,
    available_rooms: 8,
    rent: 12000,
    rating: 4.0,
    amenities: ["WiFi", "Food", "Laundry", "CCTV"],
    room_type: "Shared",
    ac_type: "Both",
    image: "/pg-images/pg4-royalstay.jpg"
  },
  {
    pg_id: 4,
    owner_id: 53,
    pg_name: "Royal Stay PG",
    location: "Hinjewadi, Pune",
    total_rooms: 18,
    available_rooms: 6,
    rent: 7500,
    rating: 4.3,
    amenities: ["WiFi", "Parking", "Food", "Power Backup"],
    room_type: "Both",
    ac_type: "AC",
    image: "/pg-images/pg5-metroliving.jpg"
  },
  {
    pg_id: 5,
    owner_id: 5,
    pg_name: "Metro Living PG",
    location: "Velachery, Chennai",
    total_rooms: 22,
    available_rooms: 4,
    rent: 9000,
    rating: 4.1,
    amenities: ["WiFi", "Gym", "Security"],
    room_type: "Shared",
    ac_type: "AC",
    image: "/pg-images/pg6-capitalhomes.jpg"
  },
  {
    pg_id: 6,
    owner_id: 55,
    pg_name: "Capital Homes PG",
    location: "Gurgaon, Delhi",
    total_rooms: 30,
    available_rooms: 10,
    rent: 11000,
    rating: 4.4,
    amenities: ["WiFi", "Food", "Laundry", "Parking"],
    room_type: "Single",
    ac_type: "AC",
    image: "/pg-images/pg6-capitalhomes.jpg"
  },
  {
    pg_id: 7,
    owner_id: 56,
    pg_name: "Budget Stay PG",
    location: "Ameerpet, Hyderabad",
    total_rooms: 30,
    available_rooms: 12,
    rent: 4500,
    rating: 3.8,
    amenities: ["WiFi", "Food"],
    room_type: "Shared",
    ac_type: "Non-AC",
    image: "/pg-images/pg8-eliteliving.jpg"
  },
  {
    pg_id: 8,
    owner_id: 57,
    pg_name: "Elite Living PG",
    location: "Whitefield, Bangalore",
    total_rooms: 10,
    available_rooms: 2,
    rent: 14000,
    rating: 4.8,
    amenities: ["WiFi", "Food", "Laundry", "Gym", "Swimming Pool"],
    room_type: "Single",
    ac_type: "AC",
    image: "/rooms/building-1.png"
  },
  {
    pg_id: 9,
    owner_id: 3,
    pg_name: "Student Nest PG",
    location: "Kothrud, Pune",
    total_rooms: 35,
    available_rooms: 15,
    rent: 5000,
    rating: 4.0,
    amenities: ["WiFi", "Food", "Study Room"],
    room_type: "Shared",
    ac_type: "Non-AC",
    image: "/rooms/building-1.png"
  },
  {
    pg_id: 10,
    owner_id: 4,
    pg_name: "Urban Nest PG",
    location: "Banjara Hills, Hyderabad",
    total_rooms: 12,
    available_rooms: 3,
    rent: 9500,
    rating: 4.6,
    amenities: ["WiFi", "Food", "Parking", "CCTV"],
    room_type: "Shared",
    ac_type: "Non-AC",
    image: "/rooms/building-1.png"
  },
]

export const initialTenants: Tenant[] = [
  {
    tenant_id: 1,
    user_id: 8,
    pg_id: 1,
    room_number: 101,
    room_type: "Shared",
    payment_status: "Paid",
    sleep_preference: "Early Sleeper",
  },
  {
    tenant_id: 2,
    user_id: 9,
    pg_id: 1,
    room_number: 102,
    room_type: "Shared",
    payment_status: "Unpaid",
    sleep_preference: "Night Owl",
  },
  {
    tenant_id: 3,
    user_id: 10,
    pg_id: 1,
    room_number: 101,
    room_type: "Shared",
    payment_status: "Paid",
    sleep_preference: "Early Sleeper",
  },
]

export const initialComplaints: Complaint[] = [
  {
    complaint_id: 1,
    tenant_id: 1,
    title: "Light flickers in corridor",
    description: "The main corridor light has been flickering for two days. Needs immediate inspection.",
    category: "Electricity",
    status: "In Progress",
    worker_name: null,
    worker_phone: null,
    created_at: "2024-04-01T10:30:00Z",
  },
  {
    complaint_id: 2,
    tenant_id: 2,
    title: "Food quality issue",
    description: "The food served yesterday was cold and stale",
    category: "Food",
    status: "Checked",
    worker_name: null,
    worker_phone: null,
    created_at: "2024-04-14T08:15:00Z",
  },
  {
    complaint_id: 3,
    tenant_id: 1,
    title: "Water pressure low",
    description: "Very low water pressure in bathroom taps.",
    category: "Plumbing",
    status: "In Progress",
    worker_name: null,
    worker_phone: null,
    created_at: "2024-04-04T14:00:00Z",
  },
  {
    complaint_id: 4,
    tenant_id: 10,
    title: "AC not cooling",
    description: "The AC in room 102 is not cooling properly and making a strange noise.",
    category: "AC Technician",
    status: "Pending",
    worker_name: null,
    worker_phone: null,
    created_at: "2024-04-11T16:30:00Z",
  },
  {
    complaint_id: 5,
    tenant_id: 25,
    title: "Fan making noise",
    description: "Ceiling fan is making loud noise when switched on",
    category: "Electricity",
    status: "Completed",
    worker_name: "Suresh Rao",
    worker_phone: "9876543202",
    created_at: "2024-04-16T11:00:00Z",
  },
  {
    complaint_id: 6,
    tenant_id: 3,
    title: "Main Switch Tripping",
    description: "Power keeps cutting out when multiple appliances are on.",
    category: "Electricity",
    status: "Not Completed",
    worker_name: "Anil Kumar",
    worker_phone: "9876543207",
    created_at: "2024-04-10T13:45:00Z",
  },
]

export const initialPayments: Payment[] = [
  {
    payment_id: 1,
    tenant_id: 1,
    amount: 6000,
    type: "Room",
    room_type: "Shared",
    status: "Paid",
    payment_date: "2024-01-01",
  },
  {
    payment_id: 2,
    tenant_id: 1,
    amount: 3000,
    type: "Food",
    status: "Paid",
    payment_date: "2024-01-01",
  },
  {
    payment_id: 3,
    tenant_id: 2,
    amount: 6000,
    type: "Room",
    room_type: "Shared",
    status: "Pending",
    payment_date: "2024-01-01",
  },
  {
    payment_id: 4,
    tenant_id: 3,
    amount: 6000,
    type: "Room",
    room_type: "Shared",
    status: "Paid",
    payment_date: "2024-01-01",
  },
]

export const initialFoodMenu: FoodMenu[] = [
  {
    menu_id: 1,
    day_of_week: "Monday",
    meal_type: "Breakfast",
    items: "Idli with Sambar",
  },
  {
    menu_id: 2,
    day_of_week: "Monday",
    meal_type: "Lunch",
    items: "Rice + Dal + Sabzi",
  },
  {
    menu_id: 3,
    day_of_week: "Monday",
    meal_type: "Dinner",
    items: "Chapati + Curry",
  },
  {
    menu_id: 4,
    day_of_week: "Tuesday",
    meal_type: "Breakfast",
    items: "Poha",
  },
  {
    menu_id: 5,
    day_of_week: "Tuesday",
    meal_type: "Lunch",
    items: "Rice + Rajma",
  },
  {
    menu_id: 6,
    day_of_week: "Tuesday",
    meal_type: "Dinner",
    items: "Roti + Paneer",
  },
]

export const initialFoodRatings: FoodRating[] = [
  {
    rating_id: 1,
    tenant_id: 1,
    rating: 4,
    comment: "Good food quality overall",
    created_at: "2024-01-15T12:00:00Z",
  },
  {
    rating_id: 2,
    tenant_id: 2,
    rating: 3,
    comment: "Could be better, sometimes food is cold",
    created_at: "2024-01-14T13:00:00Z",
  },
  {
    rating_id: 3,
    tenant_id: 3,
    rating: 5,
    comment: "Excellent food, love the variety",
    created_at: "2024-01-13T19:00:00Z",
  },
]

export const initialStaff: Staff[] = [
  // Electricity (5)
  { staff_id: 1, name: "Kiran Kumar", phone: "9876543201", category: "Electricity", status: "Available" },
  { staff_id: 2, name: "Suresh Rao", phone: "9876543202", category: "Electricity", status: "Busy" },
  { staff_id: 3, name: "Anil Kumar", phone: "9876543207", category: "Electricity", status: "Available" },
  { staff_id: 4, name: "Vijay Singh", phone: "9876543208", category: "Electricity", status: "On Leave" },
  { staff_id: 5, name: "Ramesh Singh", phone: "9876543203", category: "Electricity", status: "Available" },
  
  // Plumbing (5)
  { staff_id: 6, name: "Raju Plumber", phone: "9876543204", category: "Plumbing", status: "Available" },
  { staff_id: 7, name: "Sandeep Gupta", phone: "9876543209", category: "Plumbing", status: "Busy" },
  { staff_id: 8, name: "Mohit Sharma", phone: "9876543212", category: "Plumbing", status: "Available" },
  { staff_id: 9, name: "Vikas Verma", phone: "9876543213", category: "Plumbing", status: "Available" },
  { staff_id: 10, name: "Sunil Das", phone: "9876543214", category: "Plumbing", status: "On Leave" },

  // AC Technician (5)
  { staff_id: 11, name: "Mahesh AC", phone: "9876543205", category: "AC Technician", status: "Busy" },
  { staff_id: 12, name: "Rahul AC", phone: "9876543215", category: "AC Technician", status: "Available" },
  { staff_id: 13, name: "Pankaj AC", phone: "9876543216", category: "AC Technician", status: "Available" },
  { staff_id: 14, name: "Imran Khan", phone: "9876543217", category: "AC Technician", status: "Available" },
  { staff_id: 15, name: "Deepak AC", phone: "9876543218", category: "AC Technician", status: "Available" },

  // Carpenter (5)
  { staff_id: 16, name: "Vikram Carpenter", phone: "9876543206", category: "Carpenter", status: "Available" },
  { staff_id: 17, name: "Sohan Carpenter", phone: "9876543219", category: "Carpenter", status: "Available" },
  { staff_id: 18, name: "Bablu Carpenter", phone: "9876543220", category: "Carpenter", status: "Available" },
  { staff_id: 19, name: "Sanjay Carpenter", phone: "9876543221", category: "Carpenter", status: "Available" },
  { staff_id: 20, name: "Amit Carpenter", phone: "9876543222", category: "Carpenter", status: "Available" },

  // Internet (5)
  { staff_id: 21, name: "Arjun Reddy", phone: "9876543210", category: "Internet", status: "Available" },
  { staff_id: 22, name: "Varun Internet", phone: "9876543223", category: "Internet", status: "Available" },
  { staff_id: 23, name: "Sandeep Net", phone: "9876543224", category: "Internet", status: "Available" },
  { staff_id: 24, name: "Kunal Tech", phone: "9876543225", category: "Internet", status: "Available" },
  { staff_id: 25, name: "Rishi Tech", phone: "9876543226", category: "Internet", status: "Available" },

  // Cleaning (5) - Using category 'Other' as mapped earlier
  { staff_id: 26, name: "Sunita Devi", phone: "9876543211", category: "Other", status: "Available" },
  { staff_id: 27, name: "Geeta Bai", phone: "9876543227", category: "Other", status: "Available" },
  { staff_id: 28, name: "Rajesh Cleaning", phone: "9876543228", category: "Other", status: "Available" },
  { staff_id: 29, name: "Rekha Rani", phone: "9876543229", category: "Other", status: "Available" },
  { staff_id: 30, name: "Kamlesh Cleaning", phone: "9876543230", category: "Other", status: "Available" },

  // Food (5)
  { staff_id: 31, name: "Ramesh Cook", phone: "9876543231", category: "Food", status: "Available" },
  { staff_id: 32, name: "Suresh Chef", phone: "9876543232", category: "Food", status: "Available" },
  { staff_id: 33, name: "Anita Kitchen", phone: "9876543233", category: "Food", status: "Busy" },
  { staff_id: 34, name: "Bhavna Cook", phone: "9876543234", category: "Food", status: "Available" },
  { staff_id: 35, name: "Dinesh Chef", phone: "9876543235", category: "Food", status: "Available" },
]

// Helper function to calculate average food rating
export function getAverageFoodRating(ratings: FoodRating[]): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

// Helper function to get user by tenant id
export function getUserByTenantId(
  tenants: Tenant[],
  users: User[],
  tenantId: number
): User | undefined {
  const tenant = tenants.find((t) => t.tenant_id === tenantId)
  if (!tenant) return undefined
  return users.find((u) => u.user_id === tenant.user_id)
}

// Helper function to get roommates
export function getRoommates(
  tenants: Tenant[],
  users: User[],
  currentTenantId: number
): { tenant: Tenant; user: User }[] {
  const currentTenant = tenants.find((t) => t.tenant_id === currentTenantId)
  if (!currentTenant) return []

  return tenants
    .filter(
      (t) =>
        t.room_number === currentTenant.room_number &&
        t.tenant_id !== currentTenantId &&
        t.pg_id === currentTenant.pg_id
    )
    .map((t) => ({
      tenant: t,
      user: users.find((u) => u.user_id === t.user_id)!,
    }))
    .filter((r) => r.user !== undefined)
}
