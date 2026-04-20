# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Give it a name: `pg-management-system`
4. Choose a region closest to your users
5. Wait for the project to be created

## 2. Get Your Credentials

Once project is ready:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 3. Create Environment File

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 4. Create Database Tables

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- Users Table (Handled by Supabase Auth, but we add extra fields)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    place TEXT,
    role TEXT CHECK (role IN ('owner', 'tenant', 'service')) DEFAULT 'tenant',
    created_at TIMESTAMP DEFAULT NOW()
);

-- PG Properties Table
CREATE TABLE pgs (
    pg_id SERIAL PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id),
    pg_name TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT,
    total_rooms INTEGER NOT NULL,
    available_rooms INTEGER NOT NULL,
    rent DECIMAL(10,2) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    amenities TEXT[], -- Array of strings
    pg_type TEXT CHECK (pg_type IN ('Male', 'Female', 'Co-ed')),
    description TEXT,
    rules TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    pg_id INTEGER REFERENCES pgs(pg_id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    room_type TEXT NOT NULL,
    beds INTEGER NOT NULL,
    ac_available BOOLEAN DEFAULT FALSE,
    is_occupied BOOLEAN DEFAULT FALSE,
    rent DECIMAL(10,2) NOT NULL,
    photos TEXT[], -- Array of image URLs
    description TEXT
);

-- Tenants Table
CREATE TABLE tenants (
    tenant_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    pg_id INTEGER REFERENCES pgs(pg_id),
    room_id INTEGER REFERENCES rooms(room_id),
    room_number TEXT,
    payment_status TEXT CHECK (payment_status IN ('Paid', 'Unpaid')) DEFAULT 'Unpaid',
    sleep_preference TEXT CHECK (sleep_preference IN ('Early Sleeper', 'Night Owl')),
    move_in_date DATE,
    move_out_date DATE,
    rent_amount DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    id_proof_type TEXT CHECK (id_proof_type IN ('Aadhar', 'PAN', 'Passport', 'Driving License', 'Voter ID')),
    id_proof_number TEXT,
    status TEXT CHECK (status IN ('Active', 'Inactive', 'Moved Out')) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Complaints Table
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(tenant_id),
    pg_id INTEGER REFERENCES pgs(pg_id),
    room_id INTEGER REFERENCES rooms(room_id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('Food', 'Cleaning', 'Plumbing', 'Electricity', 'Carpenter', 'AC Technician', 'Internet', 'Other')),
    priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
    status TEXT CHECK (status IN ('Pending', 'In Progress', 'Approved', 'Checked', 'Not Completed', 'Completed')) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Service Workers Table
CREATE TABLE service_workers (
    worker_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    category TEXT CHECK (category IN ('Plumbing', 'Electricity', 'Carpenter', 'AC Technician', 'Internet', 'Cleaning', 'Other')),
    rating DECIMAL(2,1) DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('Available', 'Busy', 'Offline')) DEFAULT 'Available'
);

-- Worker Assignments Table
CREATE TABLE worker_assignments (
    assignment_id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(complaint_id),
    worker_id INTEGER REFERENCES service_workers(worker_id),
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    feedback TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5)
);

-- Payments Table
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(tenant_id),
    pg_id INTEGER REFERENCES pgs(pg_id),
    amount DECIMAL(10,2) NOT NULL,
    type TEXT CHECK (type IN ('Room', 'Food', 'Electricity', 'Other')),
    status TEXT CHECK (status IN ('Paid', 'Unpaid', 'Pending', 'Overdue')) DEFAULT 'Unpaid',
    month_year TEXT NOT NULL,
    payment_date DATE,
    due_date DATE,
    transaction_id TEXT,
    payment_method TEXT CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer', 'Online'))
);

-- Food Menu Table
CREATE TABLE food_menu (
    menu_id SERIAL PRIMARY KEY,
    pg_id INTEGER REFERENCES pgs(pg_id),
    day_of_week TEXT CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    meal_type TEXT CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner')),
    items TEXT NOT NULL,
    timing TIME,
    special_notes TEXT
);

-- Food Ratings Table
CREATE TABLE food_ratings (
    rating_id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(tenant_id),
    menu_id INTEGER REFERENCES food_menu(menu_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    rated_at TIMESTAMP DEFAULT NOW()
);

-- PG Reviews Table
CREATE TABLE pg_reviews (
    review_id SERIAL PRIMARY KEY,
    pg_id INTEGER REFERENCES pgs(pg_id),
    tenant_id INTEGER REFERENCES tenants(tenant_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
    food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT TRUE
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    type TEXT CHECK (type IN ('Complaint', 'Payment', 'General', 'Alert')),
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INTEGER,
    related_type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (examples)
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

## 5. Enable Auth Providers (Optional)

Go to **Authentication** → **Providers** and enable:
- Email/Password (enabled by default)
- Google (optional)
- Phone OTP (optional)

## 6. Test Connection

After setting up, run your Next.js app:

```bash
npm run dev
```

The app should now connect to Supabase instead of PostgreSQL!

## Supabase Files Location

All Supabase client code is in:
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/supabase/middleware.ts` - Auth middleware

## API Routes

To use Supabase in API routes:

```typescript
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pgs')
    .select('*')
  
  return Response.json({ data, error })
}
```

## Client Components

To use Supabase in client components:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase
  .from('pgs')
  .select('*')
```

---

**You're all set!** The app is now configured to use Supabase instead of PostgreSQL.
