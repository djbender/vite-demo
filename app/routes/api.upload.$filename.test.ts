import { describe, it, expect } from "vitest";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";

async function makeRequest(dir: string, filename: string) {
  const { loader } = await import("./api.upload.$filename");
  const request = new Request(`http://localhost/api/v1/upload/${filename}`, {
    headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(dir)}` },
  });
  return loader({ request, params: { filename }, context: {} } as never);
}

describe("GET /api/v1/upload/:filename", () => {
  it("returns 200 with the correct Content-Type for an existing image", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    await fs.writeFile(path.join(dir, "sample.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const response = await makeRequest(dir, "sample.png");
    await fs.rm(dir, { recursive: true });
    expect(response.headers.get("Content-Type")).toBe("image/png");
  });

  it("DELETE returns ok when file exists", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    await fs.writeFile(path.join(dir, "test.txt"), "content");
    const { action } = await import("./api.upload.$filename");
    const request = new Request(`http://localhost/api/v1/upload/test.txt`, {
      method: "DELETE",
      headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(dir)}` },
    });
    const result = await action({ request, params: { filename: "test.txt" }, context: {} } as never);
    await fs.rm(dir, { recursive: true });
    if (result instanceof Response) {
      const data = await result.json();
      expect(data.ok).toBe(true);
    } else {
      expect(result).toEqual({ ok: true });
    }
  });

  it("DELETE returns json error body when file does not exist", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const { action } = await import("./api.upload.$filename");
    const request = new Request(`http://localhost/api/v1/upload/missing.txt`, {
      method: "DELETE",
      headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(dir)}` },
    });
    const response = await action({ request, params: { filename: "missing.txt" }, context: {} } as never);
    const data = await response.json();
    await fs.rm(dir, { recursive: true });
    expect(data.error).toBeTruthy();
  });

  it("returns 404 when file does not exist", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const response = await makeRequest(dir, "nonexistent.png");
    await fs.rm(dir, { recursive: true });
    expect(response.status).toBe(404);
  });

  it("returns application/octet-stream for unrecognized extension", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    await fs.writeFile(path.join(dir, "unknown.xyz"), Buffer.from([0x00, 0x01]));
    const response = await makeRequest(dir, "unknown.xyz");
    await fs.rm(dir, { recursive: true });
    expect(response.headers.get("Content-Type")).toBe("application/octet-stream");
  });

  it("DELETE returns 400 for path traversal in filename", async () => {
    const { action } = await import("./api.upload.$filename");
    const request = new Request(`http://localhost/api/v1/upload/../../etc/passwd`, {
      method: "DELETE",
      headers: { Cookie: `unique-uploads-dir=./uploads` },
    });
    const response = await action({ request, params: { filename: "../../etc/passwd" }, context: {} } as never);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("File validation failed");
    expect(data.issues).toBeDefined();
  });

  it("DELETE returns 405 for non-DELETE methods", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const { action } = await import("./api.upload.$filename");
    const request = new Request(`http://localhost/api/v1/upload/test.txt`, {
      method: "GET",
      headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(dir)}` },
    });
    const response = await action({ request, params: { filename: "test.txt" }, context: {} } as never);
    await fs.rm(dir, { recursive: true });
    expect(response.status).toBe(405);
  });
});
