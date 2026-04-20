import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test connection
    const { data: users, error } = await supabase
      .from("users")
      .select("user_id, email, name, role, password_hash")
      .limit(5)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        hint: "Check if 'users' table exists in Supabase"
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      count: users?.length || 0,
      users: users,
      message: "Database connected successfully!"
    })
    
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      hint: "Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    }, { status: 500 })
  }
}
