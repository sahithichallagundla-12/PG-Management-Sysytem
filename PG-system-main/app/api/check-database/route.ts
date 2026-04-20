import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const tables = ["users", "pgs", "tenants", "complaints"]
  const results: any = {}
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .limit(1)
      
      if (error) {
        results[table] = { error: error.message }
      } else if (data && data.length > 0) {
        results[table] = {
          columns: Object.keys(data[0]),
          sample: data[0]
        }
      } else {
        results[table] = { columns: [], sample: null, message: "Table is empty" }
      }
    } catch (e: any) {
      results[table] = { error: e.message }
    }
  }
  
  return NextResponse.json(results)
}
