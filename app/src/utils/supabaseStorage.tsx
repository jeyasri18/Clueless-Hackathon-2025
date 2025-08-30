import { supabase } from "../supabase/config"

export async function getImages(): Promise<void> {
  const { data, error } = await supabase.storage.from("Closet").list("clothes")

  if (error) console.error("Error fetching files:", error)
  else console.log("Files:", data)
}
