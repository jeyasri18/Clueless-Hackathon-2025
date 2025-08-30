import React, { useState, useEffect } from "react"
import { uploadTop, uploadBottom, uploadDress, listTops, listBottoms, listDresses } from "../supabase/storage"

const ClosetView: React.FC = () => {
  const [topFiles, setTopFiles] = useState<string[]>([])
  const [bottomFiles, setBottomFiles] = useState<string[]>([])
  const [dressFiles, setDressFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAllFiles()
  }, [])

  async function loadAllFiles() {
    setLoading(true)
    setTopFiles(await listTops())
    setBottomFiles(await listBottoms())
    setDressFiles(await listDresses())
    setLoading(false)
  }

  // function for uploading images
  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "top" | "bottom" | "dress"
  ) {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    setLoading(true)
    let url: string | null = null

    if (type === "top") url = await uploadTop(file)
    else if (type === "bottom") url = await uploadBottom(file)
    else if (type === "dress") url = await uploadDress(file)

    if (url) {
      console.log(`Uploaded ${type} at:`, url)
      await loadAllFiles()
    }

    setLoading(false)
  }

  // rendering images from database
  const renderImages = (files: string[]) =>
    files.length === 0 ? (
      <p>No items yet.</p>
    ) : (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
        {files.map((url) => (
          <img
            key={url}
            src={url}
            alt="Clothing item"
            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
          />
        ))}
      </div>
    )

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Closet</h2>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label>
            Upload Top
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "top")}
              style={{ display: "block", marginTop: "5px" }}
            />
          </label>
          {renderImages(topFiles)}
        </div>

        <div>
          <label>
            Upload Bottom
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "bottom")}
              style={{ display: "block", marginTop: "5px" }}
            />
          </label>
          {renderImages(bottomFiles)}
        </div>

        <div>
          <label>
            Upload Dress
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "dress")}
              style={{ display: "block", marginTop: "5px" }}
            />
          </label>
          {renderImages(dressFiles)}
        </div>
      </div>

      {loading && <p>Loading...</p>}
    </div>
  )
}

export default ClosetView
