import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  // Check profiles table structure
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
  
  // Check all tables
  const tables = ['profiles', 'pgs', 'tenants', 'complaints', 'payments', 'food_menu', 'food_ratings']
  const tableInfo: any = {}
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .limit(1)
    
    if (error) {
      tableInfo[table] = { error: error.message, exists: false }
    } else {
      tableInfo[table] = { 
        exists: true, 
        columns: data && data.length > 0 ? Object.keys(data[0]) : [],
        sample: data
      }
    }
  }
  
  return NextResponse.json({
    profiles: tableInfo.profiles,
    allTables: tableInfo
  })
}
