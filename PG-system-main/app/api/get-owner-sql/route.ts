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

    // Get unique owner_ids from PGs
    const uniqueOwners = [...new Map((pgs || [])
      .filter(pg => pg.owner_id !== null)
      .map(pg => [pg.owner_id, pg]))
      .values()]

    // Generate SQL queries
    const sqlQueries = uniqueOwners.map(owner => 
      `INSERT INTO users (user_id, name, email, role, password_hash) VALUES (${owner.owner_id}, 'Owner ${owner.owner_id}', 'owner${owner.owner_id}@pgsystem.com', 'owner', '$2a$10$placeholder');`
    )

    return NextResponse.json({
      uniqueOwners,
      sqlQueries,
      count: uniqueOwners.length
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
