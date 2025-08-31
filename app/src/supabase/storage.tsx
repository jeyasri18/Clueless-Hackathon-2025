import { supabase } from "./config"

// function to upload images (by type)
export async function uploadTop(file: File, folder = "clothes/tops"): Promise<string | null> {
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

export async function uploadDress(file: File, folder = "clothes/dresses"): Promise<string | null> {
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

export async function uploadBottom(file: File, folder = "clothes/bottoms"): Promise<string | null> {
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

// function to list images (by type)
export async function listDresses(folder: string = "clothes/dresses"): Promise<string[]> {
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

export async function listTops(folder: string = "clothes/tops"): Promise<string[]> {
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

export async function listBottoms(folder: string = "clothes/bottoms"): Promise<string[]> {
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
