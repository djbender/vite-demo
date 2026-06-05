import { describe, it, expect } from "vitest";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

async function postFile(dir: string, file: File) {
  const { action } = await import("./api.upload");
  const formData = new FormData();
  formData.append("file", file);
  const request = new Request("http://localhost/api/v1/upload", {
    method: "POST",
    body: formData,
    headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(dir)}` },
  });
  return action({ request, context: {} } as never);
}

async function wrongMethod(dir: string) {
  const { action } = await import("./api.upload");
  const request = new Request("http://localhost/api/v1/upload", {
    method: "GET",
    headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(dir)}` },
  });
  return action({ request, context: {} } as never);
}

async function postField(dir: string, fieldName: string, data: ArrayBuffer) {
  const { action } = await import("./api.upload");
  const formData = new FormData();
  formData.append(fieldName, new Blob([data]));
  const request = new Request("http://localhost/api/v1/upload", {
    method: "POST",
    body: formData,
    headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(dir)}` },
  });
  return action({ request, context: {} } as never);
}

describe("POST /api/v1/upload", () => {
  it("returns 405 for non-POST methods", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const response = await wrongMethod(dir);
    await fs.rm(dir, { recursive: true });
    expect(response.status).toBe(405);
  });

  it("ignores fields that are not the 'file' field", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const response = await postField(dir, "other", new ArrayBuffer(0));
    await fs.rm(dir, { recursive: true });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe("");
  });

  it("returns 413 when file exceeds 20 MB", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const bigFile = new File([Buffer.alloc(21 * 1024 * 1024)], "big.bin", { type: "application/octet-stream" });
    const response = await postFile(dir, bigFile);
    await fs.rm(dir, { recursive: true });
    expect(response.status).toBe(413);
    const data = await response.json();
    expect(data.error).toBe("File exceeds 20 MB limit");
  });

  it("saves the file to the uploads directory", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const response = await postFile(dir, new File(["hello"], "test.png", { type: "image/png" }));
    const data = await response.json();
    const exists = await fs.stat(path.join(dir, data.diskName)).then(() => true).catch(() => false);
    await fs.rm(dir, { recursive: true });
    expect(exists).toBe(true);
  });

  it("returns the original filename in the response", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const response = await postFile(dir, new File(["hello"], "test.png", { type: "image/png" }));
    const data = await response.json();
    await fs.rm(dir, { recursive: true });
    expect(data.name).toBe("test.png");
  });
});
