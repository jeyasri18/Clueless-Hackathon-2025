// app/server/routes/tag.ts
import { Router, type Request, type Response } from "express";

/**
 * Minimal image captioning/tagging via Hugging Face serverless inference.
 * Model: rcfg/FashionBLIP-1
 * IMPORTANT: set HF_TOKEN in app/.env (fine-grained token with "Inference → Make calls to Inference Providers")
 */
export const tagRouter = Router();

const HF_MODEL = "rcfg/FashionBLIP-1";

// tiny parser for common attributes
function parseCaption(caption: string) {
  const low = caption.toLowerCase();
  const grab = (re: RegExp) => low.match(re)?.[1];

  const type =
    /dress/.test(low) ? "dress" :
    /(shirt|t[-\s]?shirt|tee|blouse)/.test(low) ? "shirt" :
    /(shorts)/.test(low) ? "shorts" : undefined;

  const color = grab(/\b(black|white|navy|blue|red|green|beige|brown|grey|gray|pink|yellow|purple|orange)\b/);
  const cut = grab(/\b(oversized|boxy|slim|regular|high-waisted|a-line|fit-and-flare|wide-leg)\b/);
  const material = grab(/\b(cotton|linen|denim|polyester|wool|silk|rayon|nylon|leather|satin|knit)\b/);

  return { type, color, cut, material, tags: { color, cut, material } };
}

// POST /api/tag
tagRouter.post("/tag", async (req: Request, res: Response) => {
  try {
    const { image_url, model } = (req.body ?? {}) as { image_url?: string; model?: string };
    if (!image_url) return res.status(400).json({ error: "image_url required" });

    const token = process.env.HF_TOKEN || "";
    if (!token) {
      // Soft-fail so the app keeps working without HF
      return res.json({ caption: "", ...parseCaption(""), note: "tagging_unavailable_no_token" });
    }

    // Call HF serverless inference
    const r = await fetch(`https://api-inference.huggingface.co/models/${model || HF_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: image_url }),
    });

    if (!r.ok) {
      // Soft-fail but don’t break UX
      const body = await r.text();
      console.warn("HF error:", r.status, body.slice(0, 200));
      return res.json({ caption: "", ...parseCaption(""), note: "tagging_unavailable_hf_error" });
    }

    const data = await r.json(); // usually: [{ generated_text: "..." }]
    const caption = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : String(data);
    return res.json({ caption, ...parseCaption(caption) });
  } catch (e: any) {
    console.error("HF tagging crash:", e);
    // Soft-fail on unexpected crash too
    return res.json({ caption: "", ...parseCaption(""), note: "tagging_error" });
  }
});
