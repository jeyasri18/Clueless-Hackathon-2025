import { Router, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";

export const outfitRouter = Router();
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

outfitRouter.get("/outfit", async (req: Request, res: Response) => {
  try {
    const uid = String(req.query.uid || "");
    const lat = Number(req.query.lat ?? -33.8688);
    const lon = Number(req.query.lon ?? 151.2093);
    if (!uid) return res.status(400).json({ error: "uid required" });

    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&forecast_days=1`
    );
    const w = await wRes.json();
    const tempC = w?.current?.temperature_2m ?? 22;
    const isRaining = (w?.current?.precipitation ?? 0) > 0.1;

    const { data: items, error } = await supabase.from("clothes").select("*").eq("user_id", uid).limit(200);
    if (error) throw error;

    const dresses = (items ?? []).filter(i => i.type === "dress");
    const shirts  = (items ?? []).filter(i => i.type === "shirt");
    const shorts  = (items ?? []).filter(i => i.type === "shorts");

    const warm = tempC >= 23, mild = tempC >= 16 && tempC < 23;
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

    let result: { kind: "topBottom"; shirt: any; bottom: any } | { kind: "dress"; dress: any } | null = null;

    if (warm) {
      result = shirts.length && shorts.length
        ? { kind: "topBottom", shirt: pick(shirts), bottom: pick(shorts) }
        : (dresses.length ? { kind: "dress", dress: pick(dresses) } : null);
    } else if (mild) {
      result = (dresses.length && Math.random() < 0.5)
        ? { kind: "dress", dress: pick(dresses) }
        : (shirts.length && shorts.length ? { kind: "topBottom", shirt: pick(shirts), bottom: pick(shorts) } : (dresses.length ? { kind: "dress", dress: pick(dresses) } : null));
    } else {
      result = dresses.length
        ? { kind: "dress", dress: pick(dresses) }
        : (shirts.length && shorts.length ? { kind: "topBottom", shirt: pick(shirts), bottom: pick(shorts) } : null);
    }

    if (!result) return res.json({ kind: "none", reason: "No suitable items", weather: { tempC, isRaining } });
    res.json({ ...result, weather: { tempC, isRaining } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
const HF_TOKEN = process.env.HF_TOKEN!;
const MODEL = "rcfg/FashionBLIP-1";

export async function tagImage(imageUrl: string) {
  // HF Inference API expects raw bytes or a URL; we can just pass URL in "inputs"
  const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: imageUrl })
  });

  if (!res.ok) throw new Error(`HF error: ${res.status} ${await res.text()}`);
  const data = await res.json(); // usually [{generated_text: "..."}]
  const caption = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : String(data);

  // very simple parse → improve later
  const parsed = parseCaptionToTags(caption);
  return { caption, ...parsed };
}

// naive extractor; refine over time
function parseCaptionToTags(caption: string) {
  const lower = caption.toLowerCase();

  const type =
    /dress/.test(lower) ? "dress" :
    /(shirt|top|tee|t-shirt|blouse)/.test(lower) ? "shirt" :
    /(shorts|pants|trousers|jeans|skirt)/.test(lower) ? ( /shorts/.test(lower) ? "shorts" : "pants" ) :
    undefined;

  const colorMatch = lower.match(/\b(black|white|navy|blue|red|green|beige|brown|grey|gray|pink|yellow|purple|orange)\b/);
  const color = colorMatch?.[1];

  const cutMatch = lower.match(/\b(oversized|boxy|slim|regular|high-waisted|a-line|fit-and-flare|wide-leg)\b/);
  const cut = cutMatch?.[1];

  const materialMatch = lower.match(/\b(cotton|linen|denim|polyester|wool|silk|rayon|nylon|leather|satin|knit)\b/);
  const material = materialMatch?.[1];

  return { type, color, cut, material, tags: { color, cut, material } };
}

export default outfitRouter;
