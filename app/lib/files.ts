const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export function stripUuidPrefix(diskName: string): string {
  return diskName.replace(/^[0-9a-f-]{36}__/, "");
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function inferMime(name: string): string | undefined {
  const ext = name.split(".").pop()!.toLowerCase();
  return MIME_MAP[ext];
}

export function isImage(name: string): boolean {
  return inferMime(name) !== undefined;
}
