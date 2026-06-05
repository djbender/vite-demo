import fs from "node:fs/promises";
import path from "node:path";
import { stripUuidPrefix } from "./files";

const DEFAULT_UPLOADS_DIR = "./uploads";

export async function getUploadsDir(request: Request): Promise<string> {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)unique-uploads-dir=([^;]+)/);
  const dir = match ? decodeURIComponent(match[1]!) : DEFAULT_UPLOADS_DIR;
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function makeDiskName(originalName: string): string {
  return `${crypto.randomUUID()}__${originalName}`;
}

export async function listFiles(
  dir: string
): Promise<{ diskName: string; name: string; size: number }[]> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const results = await Promise.all(
    entries.map(async (diskName) => {
      const stat = await fs.stat(path.join(dir, diskName));
      return { diskName, name: stripUuidPrefix(diskName), size: stat.size };
    })
  );
  return results;
}
