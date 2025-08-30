import React, { useState, useEffect } from "react"
import { uploadFile, listFiles } from "../supabase/storage"

const ClosetView: React.FC = () => {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // load all uploaded files
  useEffect(() => {
    loadFiles()
  }, [])

  async function loadFiles() {
    setLoading(true)
    const urls = await listFiles()
    setFiles(urls)
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    setLoading(true)
    const url = await uploadFile(file)
    if (url) {
      console.log("Uploaded file at:", url)
      await loadFiles() 
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Closet</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {loading && <p>Loading...</p>}

      <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {files.length === 0 ? (
          <p>No items in closet yet.</p>
        ) : (
          files.map((url) => (
            <img
              key={url}
              src={url}
              alt="Clothing item"
              style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "10px" }}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ClosetView
