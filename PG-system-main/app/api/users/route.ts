import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  const supabase = await createClient()
  
  let query = supabase.from("users").select("*")
  
  if (email) {
    query = query.eq('email', email)
  }
  
  const { data, error } = await query.order("user_id", { ascending: true })
  
  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Transform data to match our User type
  const transformedData = data?.map((user: any) => ({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    password: user.password_hash,
    role: user.role,
    phone: user.phone,
    place: user.place,
  })) || []
  
  return NextResponse.json(transformedData)
}
