import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("pgs")
    .select("*")
    .order("pg_id", { ascending: true })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Augment data with images using a slugified PG name for the image file
  const slugify = (str: string) =>
    str
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

  const augmentedData = data.map((pg: any) => {
    const slug = slugify(pg.pg_name);
    const image = `/pg-images/${slug}.jpg`;
    return { ...pg, image };
  });
  
  return NextResponse.json(augmentedData)
}
