import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Vehicle } from "@/lib/data";

const VALID_IMAGE = /\.(?:avif|webp|png|jpe?g)$/i;

/**
 * The public v4 demo includes one verified picture per car. Additional real
 * photos are discovered at build time from public/cars/gallery/<vehicle-slug>/.
 * No API or database is required, and we never repeat or invent photos.
 */
export function getVehiclePhotos(vehicle: Vehicle): string[] {
  const directory = join(process.cwd(), "public", "cars", "gallery", vehicle.slug);
  let extra: string[] = [];
  try {
    extra = readdirSync(directory)
      .filter((name) => VALID_IMAGE.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => `/cars/gallery/${vehicle.slug}/${encodeURIComponent(name)}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return [...new Set([...(vehicle.images?.length?vehicle.images:[vehicle.photo]), ...extra])];
}
