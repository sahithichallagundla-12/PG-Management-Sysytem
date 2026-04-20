import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const updates = [
    { pg_id: 1, image: '/pg-images/pg1-sunshine.jpg' },
    { pg_id: 2, image: '/pg-images/pg2-greenvalley.jpg' },
    { pg_id: 3, image: '/pg-images/pg3-citycomfort.jpg' },
    { pg_id: 4, image: '/pg-images/pg4-royalstay.jpg' },
    { pg_id: 5, image: '/pg-images/pg5-metroliving.jpg' },
    { pg_id: 6, image: '/pg-images/pg6-capitalhomes.jpg' },
    { pg_id: 7, image: '/pg-images/pg7-budgetstay.jpg' },
    { pg_id: 8, image: '/pg-images/pg8-eliteliving.jpg' },
    { pg_id: 9, image: '/pg-images/pg9-luxury.jpg' },
  ]
  
  const results = []
  
  for (const update of updates) {
    const { data, error } = await supabase
      .from("pgs")
      .update({ image: update.image })
      .eq("pg_id", update.pg_id)
      .select()
    
    results.push({
      pg_id: update.pg_id,
      success: !error,
      error: error?.message,
      updated_image: update.image
    })
  }
  
  return NextResponse.json({
    message: "Images updated in database",
    results
  })
}
