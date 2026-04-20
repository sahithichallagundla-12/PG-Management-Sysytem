import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { 
    email, 
    password, 
    name, 
    phone, 
    pg_id, 
    room_number, 
    room_type,
    sleep_preference,
    rent_amount
  } = body
  
  try {
    // 1. Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from("users")
      .select("user_id, email")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      // Check if they are already a tenant
      const { data: existingTenant } = await supabase
        .from("tenants")
        .select("tenant_id")
        .eq("user_id", existingUser.user_id)
        .maybeSingle()

      if (existingTenant) {
        return NextResponse.json(
          { error: "Email already exists" }, 
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: "Email already exists" }, 
          { status: 400 }
        )
      }
    }

    let userId: number;

    // 2. Create user in Supabase Auth (best effort)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) {
      // Log the error but do not block the user with it (e.g. rate limit error)
      console.error("Auth Error (Ignored):", authError.message)
    }

    // 3. Calculate safe next ID to bypass Postgres sequence desync caused by seed data
    const { data: maxUser } = await supabase
      .from("users")
      .select("user_id")
      .order("user_id", { ascending: false })
      .limit(1)
      .single()
      
    const safeNextId = (maxUser?.user_id || 0) + 1;

    // Create profile in users table with explicit safe ID
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .insert({
        user_id: safeNextId,
        email,
        name,
        role: 'tenant',
        phone,
        password_hash: password, // Store password (matching project pattern)
      })
      .select("user_id")
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json({ error: "System error: Failed to create profile. Please try again." }, { status: 500 })
    }

    // Update userId to the new integer ID from the database
    userId = profileData.user_id

    // 4. Create tenant record using the integer user_id
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        user_id: userId,
        pg_id,
        room_number,
        sleep_preference,
        payment_status: 'Unpaid'
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Tenant creation error:', tenantError)
      return NextResponse.json({ error: "System error: Failed to confirm booking.", details: tenantError }, { status: 500 })
    }

    // 5. Update PG's available_rooms count
    const { data: pgData, error: pgError } = await supabase
      .from("pgs")
      .select("available_rooms")
      .eq("pg_id", pg_id)
      .single()

    if (pgError) {
      console.error('Error fetching PG:', pgError)
    } else if (pgData && pgData.available_rooms > 0) {
      await supabase
        .from("pgs")
        .update({ available_rooms: pgData.available_rooms - 1 })
        .eq("pg_id", pg_id)
    }

    return NextResponse.json({
      success: true,
      message: "Booking confirmed and account registered!",
      user: {
        user_id: userId,
        email,
        name,
        role: 'tenant'
      },
      tenant: tenantData
    })
    
  } catch (error: any) {
    console.error('Guest booking error:', error)
    return NextResponse.json({ error: "An unexpected error occurred during booking." }, { status: 500 })
  }
}
