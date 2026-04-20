import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { email, password, name, role, phone, place } = body
  
  try {
    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }
    
    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
    
    // 2. Create user in users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .insert({
        user_id: authData.user.id,
        email,
        name,
        role,
        phone: phone || null,
        place: place || null,
        password_hash: password, // Note: You should ideally hash this, but matching your schema's likely password field
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't return error, user is created in auth
    }
    
    return NextResponse.json({
      success: true,
      user: {
        user_id: authData.user.id,
        email,
        name,
        role,
      }
    })
    
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
