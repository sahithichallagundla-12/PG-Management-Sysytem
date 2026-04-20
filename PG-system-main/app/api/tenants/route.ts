import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("tenants")
    .select(`
      *,
      users:user_id (name, email, phone, place)
    `)
    .order("tenant_id", { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { user_id } = body

  // Check if user already has a booking
  const { data: existingBooking } = await supabase
    .from("tenants")
    .select("tenant_id")
    .eq("user_id", user_id)
    .maybeSingle()

  if (existingBooking) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from("tenants")
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
