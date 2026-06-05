import fs from "node:fs/promises";
import path from "node:path";
import type { Route } from "./+types/api.bulk-delete";
import { getUploadsDir } from "../lib/uploads.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "DELETE") return new Response(null, { status: 405 });

  const dir = await getUploadsDir(request);
  const entries = await fs.readdir(dir);
  let deleted = 0;
  for (const entry of entries) {
    await fs.unlink(path.join(dir, entry));
    deleted++;
  }
  return { deleted };
}
