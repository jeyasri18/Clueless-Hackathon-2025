import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function generateOutfit(imageUrls: string[], weather: { tempC: number; isRaining: boolean }) {
  const prompt = `
You are a sustainable fashion assistant.
Here are clothing items (image URLs):
${imageUrls.join("\n")}
Today's weather: ${weather.tempC.toFixed(1)}°C, ${weather.isRaining ? "raining" : "clear"}.
Suggest 1 outfit suitable for this weather.

⚠️ IMPORTANT: Respond ONLY with valid JSON, no explanations, no markdown, no extra text.
Format:
[{"outfit": "Top A + Bottom B or Dress X", "description": "why it works"}]
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });

    let text = result.response?.text() || "";
    const match = text.match(/\[.*\]/s);
    if (match) text = match[0];

    const parsed = JSON.parse(text);
    return parsed[0]; // return only the first outfit
  } catch (err) {
    console.error("Failed to generate outfit:", err);
    return null;
  }
}
