import { useRef, useState, useEffect } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/home";
import { listFiles, getUploadsDir } from "../lib/uploads.server";
import { formatSize, isImage } from "../lib/files";
import { FileSchema } from "../lib/file.schema";

export async function loader({ request }: Route.LoaderArgs) {
  const dir = await getUploadsDir(request);
  const files = await listFiles(dir);
  const validFiles: Array<{ diskName: string; name: string; size: number }> = [];
  for (const file of files) {
    const result = FileSchema.safeParse(file);
    if (result.success) {
      validFiles.push(result.data);
    }
  }
  return { files: validFiles };
}

type UploadResult = { name: string; size: number; path: string; diskName: string };
type DeleteResult = { ok: boolean };
type ErrorResult = { error: string };

export default function Home({ loaderData }: Route.ComponentProps) {
  const { files } = loaderData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFetcher = useFetcher<UploadResult | ErrorResult>();
  const deleteFetcher = useFetcher<DeleteResult | ErrorResult>();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const dir = (window as unknown as { __UNIQUE_UPLOADS_DIR?: string }).__UNIQUE_UPLOADS_DIR;
    if (dir) {
      document.cookie = `unique-uploads-dir=${encodeURIComponent(dir)}; path=/`;
    }
    setHydrated(true);
  }, []);

  const deleteData = deleteFetcher.data as DeleteResult | ErrorResult | undefined;
  const deleteError = deleteData && "error" in deleteData ? deleteData.error : null;

  const uploading = uploadFetcher.state !== "idle";
  const uploadData = uploadFetcher.data as UploadResult | ErrorResult | undefined;
  const uploadError = uploadData && "error" in uploadData ? uploadData.error : null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    uploadFetcher.submit(fd, {
      action: "/api/v1/upload",
      method: "POST",
      encType: "multipart/form-data",
    });
  }

  function handleDelete(diskName: string) {
    if (!confirm("Delete this file?")) return;
    deleteFetcher.submit(null, {
      action: `/api/v1/upload/${diskName}`,
      method: "DELETE",
    });
  }

  return (
    <div className="upload-manager" data-hydrated={hydrated ? "true" : undefined}>
      <h1>File Upload Manager</h1>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !hydrated}
        >
          {uploading ? "Uploading…" : "Choose File"}
        </button>
        {uploadError && <p className="error">{uploadError}</p>}
        {deleteError && <p className="error">{deleteError}</p>}
      </div>

      <ul>
        {files.map((f) => (
          <li key={f.diskName}>
            <span>{f.name}</span>
            {" "}
            <span>{formatSize(f.size)}</span>
            {isImage(f.name) && (
              <img className="preview" src={`/api/v1/upload/${f.diskName}`} alt={f.name} />
            )}
            {" "}
            <button onClick={() => handleDelete(f.diskName)} disabled={!hydrated}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
