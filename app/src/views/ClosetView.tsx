import React, { useState, useEffect } from "react"
import {
  uploadTop,
  uploadBottom,
  uploadDress,
  listTops,
  listBottoms,
  listDresses,
} from "../supabase/storage"
import { generateOutfit } from "../lib/geminicall"

const ClosetView: React.FC = () => {
  const [topFiles, setTopFiles] = useState<string[]>([])
  const [bottomFiles, setBottomFiles] = useState<string[]>([])
  const [dressFiles, setDressFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [outfits, setOutfits] = useState<any[]>([]) 
  const [weather, setWeather] = useState("sunny 25°C") // hardcoded for now

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

  async function handleGenerate() {
    setLoading(true)
    const allUrls = [...topFiles, ...bottomFiles, ...dressFiles]
    if (allUrls.length === 0) {
      alert("Upload some clothes first!")
      setLoading(false)
      return
    }

    try {
      const response = await generateOutfit(allUrls, weather)
      // Try to parse JSON
      let parsed = []
      try {
        parsed = JSON.parse(response)
      } catch {
        parsed = [{ outfit: "Error parsing Gemini response", description: response }]
      }
      setOutfits(parsed)
    } catch (err) {
      console.error("Gemini error:", err)
    }
    setLoading(false)
  }

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
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
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

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Outfits"}
        </button>
      </div>

      {outfits.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Suggested Outfits</h3>
          <ul>
            {outfits.map((o, idx) => (
              <li key={idx}>
                <strong>{o.outfit}</strong>: {o.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && <p>Loading...</p>}
    </div>
  )
}

export default ClosetView
