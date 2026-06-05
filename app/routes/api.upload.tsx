import fs from "node:fs/promises";
import path from "node:path";
import { parseFormData, MaxFileSizeExceededError } from "@remix-run/form-data-parser";
import type { Route } from "./+types/api.upload";
import { getUploadsDir, makeDiskName } from "../lib/uploads.server";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return new Response(null, { status: 405 });

  const dir = await getUploadsDir(request);
  let name = "";
  let size = 0;
  let diskName = "";

  try {
    await parseFormData(
      request,
      { maxFileSize: MAX_FILE_SIZE },
      async (fileUpload) => {
        if (fileUpload.fieldName !== "file") return null;
        name = fileUpload.name;
        size = fileUpload.size;
        diskName = makeDiskName(fileUpload.name);
        const buffer = await fileUpload.arrayBuffer();
        await fs.writeFile(path.join(dir, diskName), Buffer.from(buffer));
        return null;
      }
    );
  } catch (e) {
    if (e instanceof MaxFileSizeExceededError) {
      return Response.json({ error: "File exceeds 20 MB limit" }, { status: 413 });
    }
  }

  return Response.json({ name, size, path: `/api/v1/upload/${diskName}`, diskName });
}
