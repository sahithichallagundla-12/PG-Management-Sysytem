-- Smart PG Management System Database Schema
-- PostgreSQL Migration Script

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS food_ratings CASCADE;
DROP TABLE IF EXISTS food_menu CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS pg CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'tenant', 'service_provider')),
  phone VARCHAR(15),
  place VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PG Table
CREATE TABLE pg (
  pg_id SERIAL PRIMARY KEY,
  pg_name VARCHAR(200) NOT NULL,
  location VARCHAR(255) NOT NULL,
  total_rooms INTEGER NOT NULL DEFAULT 0,
  available_rooms INTEGER NOT NULL DEFAULT 0,
  rent DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  owner_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  amenities TEXT[],
  room_type VARCHAR(20) CHECK (room_type IN ('Single', 'Shared', 'Both')),
  ac_type VARCHAR(20) CHECK (ac_type IN ('AC', 'Non-AC', 'Both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tenants Table
CREATE TABLE tenants (
  tenant_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  pg_id INTEGER NOT NULL REFERENCES pg(pg_id) ON DELETE CASCADE,
  room_number INTEGER NOT NULL,
  room_type VARCHAR(20) CHECK (room_type IN ('Single', 'Shared')),
  payment_status VARCHAR(20) DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Unpaid', 'Pending')),
  sleep_preference VARCHAR(20) CHECK (sleep_preference IN ('Early Sleeper', 'Night Owl')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Complaints Table
CREATE TABLE complaints (
  complaint_id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Electrical', 'Plumbing', 'Cleaning', 'Food', 'Other')),
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Approved', 'Completed', 'Rejected')),
  worker_name VARCHAR(100),
  worker_phone VARCHAR(15),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payments Table
CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Room', 'Food')),
  room_type VARCHAR(20) CHECK (room_type IN ('Single', 'Shared')),
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed')),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Food Menu Table
CREATE TABLE food_menu (
  menu_id SERIAL PRIMARY KEY,
  pg_id INTEGER REFERENCES pg(pg_id) ON DELETE CASCADE,
  day VARCHAR(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  breakfast VARCHAR(255),
  lunch VARCHAR(255),
  dinner VARCHAR(255),
  UNIQUE(pg_id, day)
);

-- 7. Food Ratings Table
CREATE TABLE food_ratings (
  rating_id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  pg_id INTEGER REFERENCES pg(pg_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Service Workers Table
CREATE TABLE service_workers (
  worker_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  category VARCHAR(50) NOT NULL CHECK (category IN ('Plumbing', 'Electricity', 'Carpenter', 'AC Technician', 'Internet', 'Cleaning', 'Food', 'Other')),
  rating DECIMAL(2, 1) DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Busy', 'On Leave', 'Offline')),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_pg_location ON pg(location);
CREATE INDEX idx_pg_owner ON pg(owner_id);
CREATE INDEX idx_tenants_user ON tenants(user_id);
CREATE INDEX idx_tenants_pg ON tenants(pg_id);
CREATE INDEX idx_complaints_tenant ON complaints(tenant_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_food_menu_pg ON food_menu(pg_id);
CREATE INDEX idx_food_ratings_tenant ON food_ratings(tenant_id);
CREATE INDEX idx_service_workers_category ON service_workers(category);
CREATE INDEX idx_service_workers_status ON service_workers(status);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_workers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- RLS Policies for PG table
CREATE POLICY "Anyone can view PGs" ON pg FOR SELECT USING (true);
CREATE POLICY "Owners can manage their PGs" ON pg FOR ALL USING (true);

-- RLS Policies for Tenants table
CREATE POLICY "View tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Manage tenants" ON tenants FOR ALL USING (true);

-- RLS Policies for Complaints table
CREATE POLICY "View complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Manage complaints" ON complaints FOR ALL USING (true);

-- RLS Policies for Payments table
CREATE POLICY "View payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Manage payments" ON payments FOR ALL USING (true);

-- RLS Policies for Food Menu table
CREATE POLICY "View food menu" ON food_menu FOR SELECT USING (true);
CREATE POLICY "Manage food menu" ON food_menu FOR ALL USING (true);

-- RLS Policies for Food Ratings table
CREATE POLICY "View food ratings" ON food_ratings FOR SELECT USING (true);
CREATE POLICY "Manage food ratings" ON food_ratings FOR ALL USING (true);

-- RLS Policies for Service Workers table
CREATE POLICY "View service workers" ON service_workers FOR SELECT USING (true);
CREATE POLICY "Manage service workers" ON service_workers FOR ALL USING (true);
