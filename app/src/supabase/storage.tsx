import { supabase } from "./config.tsx"

// function to upload images 
export async function uploadFile(file: File, folder = "clothes"): Promise<string | null> {
  const filePath = `${folder}/${file.name}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("Closet")
    .upload(filePath, file, { cacheControl: "3600", upsert: true })

  if (uploadError) {
    console.error("Upload failed:", uploadError.message)
    return null
  }

  const { data: publicData } = supabase.storage.from("Closet").getPublicUrl(filePath)
  return publicData.publicUrl
}

// function to list images
export async function listFiles(folder: string = "clothes"): Promise<string[]> {
  const { data, error } = await supabase.storage.from("Closet").list(folder)

  if (error || !data) {
    console.error("Error listing files:", error?.message)
    return []
  }

  const urls = data.map((item) => {
    const { data: publicData } = supabase.storage.from("Closet").getPublicUrl(`${folder}/${item.name}`)
    return publicData.publicUrl
  })

  return urls
}

// function to delete files
export async function deleteFile(fileName: string, folder = "clothes"): Promise<boolean> {
  const { error } = await supabase.storage.from("Closet").remove([`${folder}/${fileName}`])
  if (error) {
    console.error("Delete failed:", error.message)
    return false
  }
  return true
}
