import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const BUCKET = process.env.BUCKET_NAME || "Closet";   // <-- change if your bucket name differs
const PUBLIC_UID = process.env.PUBLIC_UID || "demo";  // demo wardrobe owner
const CLEAN = process.env.CLEAN === "1";              // set CLEAN=1 to delete old demo rows first

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// map folder → type
const FOLDERS: Array<{ prefix: string; type: "shirt" | "shorts" | "dress" }> = [
  { prefix: "clothes/tops",     type: "shirt"  },
  { prefix: "clothes/bottoms",  type: "shorts" }, // <-- your example path
  { prefix: "clothes/dresses",  type: "dress"  },
];

function publicUrl(path: string) {
  // https://<project-ref>.supabase.co/storage/v1/object/public/<BUCKET>/<path>
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function listFiles(prefix: string): Promise<string[]> {
  // non-recursive: lists files directly under the prefix
  const { data, error } = await sb.storage.from(BUCKET).list(prefix, { limit: 100 });
  if (error) throw error;
  // build full path for each file
  return (data || [])
    .filter((x) => x.name && !x.id?.endsWith("/")) // ignore weird dirs
    .map((x) => `${prefix}/${x.name}`);
}

async function seed() {
  if (CLEAN) {
    console.log(`Cleaning existing rows for user_id='${PUBLIC_UID}'…`);
    const { error: delErr } = await sb.from("clothes").delete().eq("user_id", PUBLIC_UID);
    if (delErr) throw delErr;
  }

  for (const { prefix, type } of FOLDERS) {
    console.log(`Listing ${prefix}…`);
    const paths = await listFiles(prefix);
    if (paths.length === 0) {
      console.log(`(no files found in ${prefix})`);
      continue;
    }

    const rows = paths.map((p) => ({
      user_id: PUBLIC_UID,
      image_url: publicUrl(p),
      type,
      // optional defaults:
      color: null,
      material: null,
      cut: null,
      raw_caption: null,
      tags: null,
    }));

    console.log(`Inserting ${rows.length} rows for ${prefix} as type=${type}…`);
    const { error } = await sb.from("clothes").insert(rows);
    if (error) throw error;
    console.log(`✓ Inserted ${rows.length} from ${prefix}`);
  }

  console.log("All done ✅");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
