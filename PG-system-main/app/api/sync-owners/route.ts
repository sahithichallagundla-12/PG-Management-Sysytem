import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  try {
    // Get all PGs with their owner_id
    const { data: pgs, error: pgError } = await supabase
      .from("pgs")
      .select("pg_id, pg_name, owner_id")
      .order("pg_id")
    
    if (pgError) {
      return NextResponse.json({ error: pgError.message }, { status: 500 })
    }

    // Get all existing users
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("user_id, name, email, role")
      .eq("role", "owner")
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Find unique owner_ids from PGs
    const ownerIds = [...new Set(pgs?.map(pg => pg.owner_id).filter(id => id !== null) || [])]
    
    const existingUserIds = users?.map(u => u.user_id) || []
    const missingOwnerIds = ownerIds.filter(id => !existingUserIds.includes(id))

    return NextResponse.json({
      totalPGs: pgs?.length || 0,
      uniqueOwnersInPGs: ownerIds,
      existingOwners: existingUserIds,
      missingOwnerIds,
      pgs: pgs,
      users: users
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  const supabase = await createClient()
  
  try {
    // Get all PGs with their owner_id
    const { data: pgs, error: pgError } = await supabase
      .from("pgs")
      .select("pg_id, pg_name, owner_id")
    
    if (pgError) {
      return NextResponse.json({ error: pgError.message }, { status: 500 })
    }

    // Get all existing users
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("role", "owner")
    
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const existingUserIds = users?.map(u => u.user_id) || []
    const results = []

    // Create missing owner accounts
    for (const pg of pgs || []) {
      if (pg.owner_id && !existingUserIds.includes(pg.owner_id)) {
        const { data: newOwner, error: insertError } = await supabase
          .from("users")
          .insert({
            user_id: pg.owner_id,
            name: `Owner ${pg.owner_id}`,
            email: `owner${pg.owner_id}@pgsystem.com`,
            role: "owner",
            password_hash: "password123"
          })
          .select()
        
        results.push({
          owner_id: pg.owner_id,
          pg_name: pg.pg_name,
          success: !insertError,
          error: insertError?.message
        })
      }
    }

    return NextResponse.json({
      message: "Owner sync completed",
      results
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
