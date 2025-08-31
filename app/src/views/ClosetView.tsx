import React, { useState, useEffect } from "react";
import {
  uploadTop,
  uploadBottom,
  uploadDress,
  listTops,
  listBottoms,
  listDresses,
} from "../supabase/storage";
import { insertClothingRow } from "../supabase/clothes";
import { auth as fbAuth } from "../firebase/config";

const ClosetView: React.FC = () => {
  const [topFiles, setTopFiles] = useState<string[]>([]);
  const [bottomFiles, setBottomFiles] = useState<string[]>([]);
  const [dressFiles, setDressFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadAllFiles();
  }, []);

  async function loadAllFiles() {
    setLoading(true);
    setTopFiles(await listTops());
    setBottomFiles(await listBottoms());
    setDressFiles(await listDresses());
    setLoading(false);
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "top" | "bottom" | "dress"
  ) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setLoading(true);
    let url: string | null = null;

    if (type === "top") url = await uploadTop(file);
    else if (type === "bottom") url = await uploadBottom(file);
    else if (type === "dress") url = await uploadDress(file);

    if (url) {
      // Tag via backend (HF token must NOT live in the browser)
      const tagEndpoint = import.meta.env.VITE_TAG_ENDPOINT ?? "/api/tag";

      let tagged: {
        caption: string;
        type?: string;
        color?: string;
        cut?: string;
        material?: string;
        tags?: any;
      } = { caption: "" };

      try {
        const resp = await fetch(tagEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: url }),
        });
        tagged = await resp.json();
      } catch (err) {
        console.warn("Tagging failed, inserting without tags:", err);
      }

      const user = fbAuth.currentUser;
      const user_id = user?.uid ?? "anon";

      await insertClothingRow({
        user_id,
        image_url: url,
        // fall back to your UI "type" if the tagger misses it
        type:
          tagged.type ??
          (type === "top" ? "shirt" : type === "bottom" ? "shorts" : "dress"),
        color: tagged.color,
        cut: tagged.cut,
        material: tagged.material,
        raw_caption: tagged.caption,
        tags: tagged.tags,
      });

      console.log(`Uploaded ${type} at:`, url);
      await loadAllFiles();
    }

    setLoading(false);
  }

  const renderImages = (files: string[]) =>
    files.length === 0 ? (
      <p>No items yet.</p>
    ) : (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "10px",
        }}
      >
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
    );

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
  );
};

export default ClosetView;
