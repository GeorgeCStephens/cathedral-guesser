import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type PhotoAttribution = {
  originalFilePage: string;
  creator: string;
  license: string;
  licenseUrl: string;
  attributionText: string;
};

type PhotoAttributionManifest = {
  schemaVersion: number;
  photos: Record<string, PhotoAttribution>;
};

async function walkDir(
  dir: string,
  base: string,
  mapping: Record<string, any> = {},
  photoAttributions: Record<string, PhotoAttribution> = {},
) {
  const results: Array<{
    id: string;
    hints: string[];
    folder: string;
    images: string[];
    imageCredits: Array<PhotoAttribution | null>;
  }> = [];
  const dirents = await fs.readdir(dir, { withFileTypes: true });

  for (const d of dirents) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) {
      const files = await fs.readdir(full).catch(() => []);
      const imageFiles = files.filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
      if (imageFiles.length) {
        const rel = path.relative(base, full);
        const parts = rel.split(path.sep).filter(Boolean);
        let folderName = d.name;
        let hints: string[] = [];
        if (parts.length >= 2) {
          const region = parts[0];
          folderName = parts.slice(1).join("/");
          hints = [region];
        } else {
          folderName = parts[0] || d.name;
        }

        const tryKeys = [folderName, d.name, rel];
        for (const k of tryKeys) {
          if (k && mapping && Object.prototype.hasOwnProperty.call(mapping, k)) {
            const v = mapping[k];
            if (Array.isArray(v)) {
              const clean = v.map(String).map((s) => s.trim()).filter(Boolean);
              if (clean.length) {
                hints = clean;
                break;
              }
            } else if (typeof v === "string" && v.trim()) {
              hints = [v.trim()];
              break;
            }
          }
        }

        const imagePathBase = `/images/cathedrals/${encodeURIComponent(parts.join("/"))}`;
        const images = imageFiles
          .filter(Boolean)
          .sort()
          .map((img) => `${imagePathBase}/${encodeURIComponent(img)}`);
        const imageCredits = imageFiles
          .filter(Boolean)
          .sort()
          .map((img) => photoAttributions[`${parts.join("/")}/${img}`] ?? null);
        const id = rel;
        results.push({ id, hints, folder: folderName, images, imageCredits });
      } else {
        const nested = await walkDir(full, base, mapping, photoAttributions);
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
    const attributionPath = path.join(process.cwd(), "data", "photo-attributions.json");
    const attributionRaw = await fs.readFile(attributionPath, "utf8");
    const attributionManifest = JSON.parse(attributionRaw) as PhotoAttributionManifest;
    const data = await walkDir(base, base, mapping, attributionManifest.photos);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Failed to load cathedral data", err);
    return NextResponse.json({ error: "Failed to load cathedral data." }, { status: 500 });
  }
}
