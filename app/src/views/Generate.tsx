import React, { useState } from "react";
import { auth } from "../firebase/config";
import { generateOutfit } from "../lib/geminicall";
import { listTops, listBottoms, listDresses } from "../supabase/storage";

type OutfitResp =
  | { kind: "topBottom"; shirt: { image_url: string }; bottom: { image_url: string }; weather: { tempC: number; isRaining: boolean } }
  | { kind: "dress"; dress: { image_url: string }; weather: { tempC: number; isRaining: boolean } }
  | { kind: "none"; reason: string; weather: { tempC: number; isRaining: boolean } };

export default function Generate() {
  const [data, setData] = useState<OutfitResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function getPosition(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: -33.8688, lon: 151.2093 });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve({ lat: -33.8688, lon: 151.2093 })
      );
    });
  }

  async function fetchWeather(lat: number, lon: number) {
    // Replace with your real weather API
    return { tempC: 22, isRaining: false };
  }

  async function onGenerate() {
    setLoading(true);
    setErr(null);
    setData(null);

    try {
      const { lat, lon } = await getPosition();
      const weather = await fetchWeather(lat, lon);

      const tops = await listTops();
      const bottoms = await listBottoms();
      const dresses = await listDresses();
      const allImages = [...tops, ...bottoms, ...dresses];

      if (allImages.length === 0) {
        setData({ kind: "none", reason: "No images in closet", weather });
        return;
      }

      const outfit = await generateOutfit(allImages, weather);

      if (!outfit || !outfit.outfit) {
        setData({ kind: "none", reason: "Gemini did not return an outfit", weather });
        return;
      }

      const outfitText = outfit.outfit.toLowerCase();

      let mapped: OutfitResp;
      const dress = dresses.find(d => outfitText.includes("dress"));
      if (dress) mapped = { kind: "dress", dress: { image_url: dress }, weather };
      else mapped = { kind: "topBottom", shirt: { image_url: tops[0] }, bottom: { image_url: bottoms[0] }, weather };

      setData(mapped);
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

      {data && data.kind === "topBottom" && (
        <div style={{ marginTop: 16 }}>
          <h3>Shirt + Bottom</h3>
          <div style={{ display: "flex", gap: 12 }}>
            <img src={data.shirt.image_url} alt="Shirt" width={160} height={160} style={{ objectFit: "cover", borderRadius: 8 }} />
            <img src={data.bottom.image_url} alt="Bottom" width={160} height={160} style={{ objectFit: "cover", borderRadius: 8 }} />
          </div>
          <Weather tempC={data.weather.tempC} isRaining={data.weather.isRaining} />
        </div>
      )}

      {data && data.kind === "dress" && (
        <div style={{ marginTop: 16 }}>
          <h3>Dress</h3>
          <img src={data.dress.image_url} alt="Dress" width={220} height={220} style={{ objectFit: "cover", borderRadius: 8 }} />
          <Weather tempC={data.weather.tempC} isRaining={data.weather.isRaining} />
        </div>
      )}

      {data && data.kind === "none" && (
        <p style={{ color: "crimson", marginTop: 16 }}>{data.reason}</p>
      )}
    </div>
  );
}
