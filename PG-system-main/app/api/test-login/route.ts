import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()
    
    // Check users table
    const { data: users, error } = await supabase
      .from("users")
      .select("user_id, email, name, role, password_hash, phone, place")
      .eq("email", email)
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        error: "Database error: " + error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 })
    }
    
    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: "User not found in users table",
        checkedEmail: email
      }, { status: 404 })
    }
    
    const user = users[0]
    
    // Check password (compare with bcrypt hash OR direct match for sample data)
    let isValidPassword = false
    try {
      isValidPassword = await bcrypt.compare(password, user.password_hash)
    } catch (e) {
      // Fallback for non-bcrypt strings in sample data
      isValidPassword = false
    }

    if (!isValidPassword && password === user.password_hash) {
      isValidPassword = true
    }
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: "Wrong password",
        providedPassword: password,
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
    
  } catch (err: any) {
    return NextResponse.json({ 
      error: "Server error: " + err.message 
    }, { status: 500 })
  }
}
