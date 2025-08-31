// app/server/index.ts
import express, { type Request, type Response } from "express";
import cors from "cors";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8787);
const PUBLIC_UID = process.env.PUBLIC_UID || "demo";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error("Missing Supabase env. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env (inside app/).");
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// --- Health ---
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    PUBLIC_UID,
    hasSupabaseUrl: !!SUPABASE_URL,
    hasSupabaseKey: !!SUPABASE_ANON,
  });
});

// --- Test weather alone ---
app.get("/api/test-weather", async (req: Request, res: Response) => {
  try {
    const lat = Number(req.query.lat ?? -33.8688);
    const lon = Number(req.query.lon ?? 151.2093);
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&forecast_days=1`
    );
    const ct = r.headers.get("content-type") || "";
    const body = await r.text();
    if (!r.ok) return res.status(502).json({ error: "weather_http_error", status: r.status, ct, body: body.slice(0,200) });
    res.json({ ok: true, ct, sample: body.slice(0, 200) });
  } catch (e: any) {
    res.status(502).json({ error: "weather_fetch_failed", detail: e?.message || String(e) });
  }
});

// --- Test supabase alone ---
app.get("/api/test-supabase", async (req: Request, res: Response) => {
  try {
    const uid = String(req.query.uid || PUBLIC_UID);
    const { data, error } = await supabase.from("clothes").select("*").eq("user_id", uid).limit(5);
    if (error) return res.status(502).json({ error: "supabase_query_error", detail: error.message });
    res.json({ ok: true, uid, count: data?.length ?? 0, sample: (data ?? []).slice(0, 2) });
  } catch (e: any) {
    res.status(502).json({ error: "supabase_fetch_failed", detail: e?.message || String(e) });
  }
});

// --- Outfit (supports ?skipWeather=1 to bypass weather while debugging) ---
app.get("/api/outfit", async (req: Request, res: Response) => {
  try {
    const uid = typeof req.query.uid === "string" ? req.query.uid : "";
    const lat = Number(req.query.lat ?? -33.8688);
    const lon = Number(req.query.lon ?? 151.2093);
    const skipWeather = req.query.skipWeather === "1";

    let tempC = 22, isRaining = false;

    // (1) Weather
    if (!skipWeather) {
      try {
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&forecast_days=1`
        );
        if (!wRes.ok) {
          const txt = await wRes.text();
          return res.status(502).json({ error: "weather_http_error", status: wRes.status, body: txt.slice(0,200) });
        }
        const w = await wRes.json();
        tempC = w?.current?.temperature_2m ?? 22;
        isRaining = (w?.current?.precipitation ?? 0) > 0.1;
      } catch (e: any) {
        return res.status(502).json({ error: "weather_fetch_failed", detail: e?.message || String(e) });
      }
    }

    // (2) Supabase
    const userIds = uid ? [uid, PUBLIC_UID] : [PUBLIC_UID];
    let items: any[] = [];
    try {
      const { data, error } = await supabase.from("clothes").select("*").in("user_id", userIds).limit(200);
      if (error) return res.status(502).json({ error: "supabase_query_error", detail: error.message });
      items = data || [];
    } catch (e: any) {
      return res.status(502).json({ error: "supabase_fetch_failed", detail: e?.message || String(e) });
    }

    // (3) Pick
    const dresses = items.filter(i => i.type === "dress");
    const shirts  = items.filter(i => i.type === "shirt");
    const shorts  = items.filter(i => i.type === "shorts");

    const warm = tempC >= 23;
    const mild = tempC >= 16 && tempC < 23;
    const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

    let result:
      | { kind: "topBottom"; shirt: any; bottom: any }
      | { kind: "dress"; dress: any }
      | null = null;

    if (warm) {
      result = shirts.length && shorts.length
        ? { kind: "topBottom", shirt: pick(shirts), bottom: pick(shorts) }
        : (dresses.length ? { kind: "dress", dress: pick(dresses) } : null);
    } else if (mild) {
      result = (dresses.length && Math.random() < 0.5)
        ? { kind: "dress", dress: pick(dresses) }
        : (shirts.length && shorts.length
            ? { kind: "topBottom", shirt: pick(shirts), bottom: pick(shorts) }
            : (dresses.length ? { kind: "dress", dress: pick(dresses) } : null));
    } else {
      result = dresses.length
        ? { kind: "dress", dress: pick(dresses) }
        : (shirts.length && shorts.length
            ? { kind: "topBottom", shirt: pick(shirts), bottom: pick(shorts) }
            : null);
    }

    if (!result) return res.json({ kind: "none", reason: "No suitable items", weather: { tempC, isRaining } });
    res.json({ ...result, weather: { tempC, isRaining } });
  } catch (e: any) {
    res.status(500).json({ error: "route_crash", detail: e?.message || String(e) });
  }
});

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
