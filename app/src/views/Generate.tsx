import React, { useState } from "react";
// If you have Firebase auth, keep this import; otherwise you can delete it.
import { auth } from "../firebase/config"; 

type OutfitResp =
  | { kind: "topBottom"; shirt: { image_url: string }; bottom: { image_url: string }; weather: { tempC: number; isRaining: boolean } }
  | { kind: "dress";     dress: { image_url: string };  weather: { tempC: number; isRaining: boolean } }
  | { kind: "none";      reason: string;                 weather: { tempC: number; isRaining: boolean } }
  | { error: string; detail?: string; status?: number; body?: string };

export default function Generate() {
  const [data, setData] = useState<OutfitResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

 // const API = import.meta.env.VITE_API_BASE ?? ""; // if you added VITE_API_BASE, it uses it; else proxy /api

  async function getPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: -33.8688, lon: 151.2093 }); // Sydney fallback
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        ()    => resolve({ lat: -33.8688, lon: 151.2093 })
      );
    });
  }

  async function onGenerate() {
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const { lat, lon } = await getPosition();
      const uid = auth?.currentUser?.uid; // may be undefined (guest)
      //const qs  = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      const qs  = new URLSearchParams({ lat: String(lat), lon: String(lon), skipWeather: "1" });
      // change thi when we fix the weather api 
      if (uid) qs.set("uid", uid);

      //const res = await fetch(`${API}/api/outfit?${qs.toString()}`);
      // Vite proxy → http://localhost:8787
      //const res = await fetch(`/api/outfit?${qs.toString()}`);
      const res = await fetch(`/api/outfit?${qs.toString()}`);
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Expected JSON, got ${ct}. First bytes: ${text.slice(0,120)}…`);
      }
      const json = (await res.json()) as OutfitResp;
      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const Weather = ({ tempC, isRaining }: { tempC: number; isRaining: boolean }) => (
    <div style={{ marginTop: 8, opacity: 0.8 }}>
      <span>{tempC.toFixed(1)}°C</span>{" "}
      <span>{isRaining ? "🌧️ rain" : "☀️ clear"}</span>
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Outfit Generator</h1>

      <button onClick={onGenerate} disabled={loading} style={{ padding: "8px 12px" }}>
        {loading ? "Thinking…" : "Generate based on your weather"}
      </button>

      {!auth?.currentUser && (
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          You’re using the demo closet. <a href="/sign-in">Sign in</a> to use your own wardrobe.
        </p>
      )}

      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}

      {/* Render results */}
      {data && "kind" in data && data.kind === "topBottom" && (
        <div style={{ marginTop: 16 }}>
          <h3>Shirt + Shorts</h3>
          <div style={{ display: "flex", gap: 12 }}>
            <img src={data.shirt.image_url} alt="Shirt" width={160} height={160} style={{ objectFit: "cover", borderRadius: 8 }} />
            <img src={data.bottom.image_url} alt="Shorts" width={160} height={160} style={{ objectFit: "cover", borderRadius: 8 }} />
          </div>
          <Weather tempC={data.weather.tempC} isRaining={data.weather.isRaining} />
        </div>
      )}

      {data && "kind" in data && data.kind === "dress" && (
        <div style={{ marginTop: 16 }}>
          <h3>Dress</h3>
          <img src={data.dress.image_url} alt="Dress" width={220} height={220} style={{ objectFit: "cover", borderRadius: 8 }} />
          <Weather tempC={data.weather.tempC} isRaining={data.weather.isRaining} />
        </div>
      )}

      {data && "kind" in data && data.kind === "none" && (
        <p style={{ color: "crimson", marginTop: 16 }}>
          {data.reason} — add a dress, or a shirt + shorts to the closet.
        </p>
      )}

      {/* Debug any backend error payload */}
      {data && "error" in data && (
        <pre style={{ background: "#111", color: "#eee", padding: 12, marginTop: 16, borderRadius: 8 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
