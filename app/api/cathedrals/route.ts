import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

async function walkDir(dir: string, base: string, mapping: Record<string, any> = {}) {
  const results: Array<{ hints: string[]; folder: string; image: string }> = [];
  const dirents = await fs.readdir(dir, { withFileTypes: true });

  for (const d of dirents) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) {
      // look for image files directly inside this directory
      const files = await fs.readdir(full).catch(() => []);
      const img = files.find((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
      if (img) {
        // determine hints relative to base
        const rel = path.relative(base, full);
        const parts = rel.split(path.sep).filter(Boolean);
        let folderName = d.name;
        let hints: string[] = [];
        if (parts.length >= 2) {
          // base/region/folder -> treat region as an initial hint
          const region = parts[0];
          folderName = parts.slice(1).join("/");
          hints = [region];
        } else {
          // base/folder
          folderName = parts[0] || d.name;
        }
        // consult mapping template: try folderName, d.name, and rel
        const tryKeys = [folderName, d.name, rel];
        for (const k of tryKeys) {
          if (k && mapping && Object.prototype.hasOwnProperty.call(mapping, k)) {
            const v = mapping[k];
            if (Array.isArray(v)) {
              const clean = v.map(String).map(s => s.trim()).filter(Boolean);
              if (clean.length) { hints = clean; break; }
            } else if (typeof v === 'string' && v.trim()) {
              hints = [v.trim()];
              break;
            }
          }
        }
        const imagePath = `/images/cathedrals/${encodeURIComponent(parts.join("/"))}/${encodeURIComponent(img)}`;
        results.push({ hints, folder: folderName, image: imagePath });
      } else {
        // recurse one level deeper to find region->folder structure
        const nested = await walkDir(full, base, mapping);
        results.push(...nested);
      }
    }
  }

  return results;
}

export async function GET() {
  const base = path.join(process.cwd(), "public", "images", "cathedrals");
  // try to load an optional mapping template so hints can work without moving files
  let mapping: Record<string, any> = {};
  try {
    const mappingPath = path.join(process.cwd(), 'data', 'hints-mapping.json');
    const raw = await fs.readFile(mappingPath, 'utf8').catch(() => '');
    if (raw) mapping = JSON.parse(raw);
  } catch (err) {
    // ignore mapping errors and continue
    mapping = {};
  }
  try {
    const data = await walkDir(base, base, mapping);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
