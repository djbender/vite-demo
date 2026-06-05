import fs from "node:fs/promises";
import path from "node:path";
import type { Route } from "./+types/api.upload.$filename";
import { getUploadsDir } from "../lib/uploads.server";
import { inferMime } from "../lib/files";

export async function loader({ request, params }: Route.LoaderArgs) {
  const dir = await getUploadsDir(request);
  const filePath = path.join(dir, params.filename!);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(buffer, {
    headers: {
      "Content-Type": inferMime(params.filename!) ?? "application/octet-stream",
    },
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "DELETE") return new Response(null, { status: 405 });
  const dir = await getUploadsDir(request);
  const filePath = path.join(dir, params.filename!);
  try {
    await fs.unlink(filePath);
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
  return { ok: true };
}
