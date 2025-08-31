import { supabase } from "./config";

export type ClothingRow = {
  user_id: string;
  image_url: string;
  type?: string;
  color?: string;
  cut?: string;
  material?: string;
  raw_caption?: string;
  tags?: Record<string, any>;
};

export async function insertClothingRow(row: ClothingRow) {
  const { error } = await supabase.from("clothes").insert(row);
  if (error) throw error;
}
