import { describe, it, expect } from "vitest";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { makeDiskName, listFiles, getUploadsDir } from "./uploads.server";

describe("makeDiskName", () => {
  it("prefixes original name with a uuid", () => {
    const result = makeDiskName("photo.jpg");
    expect(result).toMatch(/^[0-9a-f-]{36}__photo\.jpg$/);
  });

  it("produces a unique name each call", () => {
    expect(makeDiskName("a.txt")).not.toBe(makeDiskName("a.txt"));
  });
});

describe("listFiles", () => {
  it("returns an empty array for an empty directory", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const result = await listFiles(dir);
    await fs.rm(dir, { recursive: true });
    expect(result).toEqual([]);
  });

  it("returns the original name stripped of the uuid prefix", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    await fs.writeFile(path.join(dir, "550e8400-e29b-41d4-a716-446655440000__hello.txt"), "x");
    const [file] = await listFiles(dir);
    await fs.rm(dir, { recursive: true });
    expect(file!.name).toBe("hello.txt");
  });

  it("returns the correct file size in bytes", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    await fs.writeFile(path.join(dir, "550e8400-e29b-41d4-a716-446655440000__hello.txt"), "hello");
    const [file] = await listFiles(dir);
    await fs.rm(dir, { recursive: true });
    expect(file!.size).toBe(5);
  });

  it("returns an empty array when directory does not exist", async () => {
    const result = await listFiles("/tmp/nonexistent-upload-dir-xyz");
    expect(result).toEqual([]);
  });
});

describe("getUploadsDir", () => {
  it("falls back to ./uploads when cookie is absent", async () => {
    const request = new Request("http://localhost/");
    const dir = await getUploadsDir(request);
    expect(dir).toBe("./uploads");
  });

  it("reads the uploads dir from the unique-uploads-dir cookie", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
    const request = new Request("http://localhost/", {
      headers: { Cookie: `unique-uploads-dir=${encodeURIComponent(tmp)}` },
    });
    const dir = await getUploadsDir(request);
    await fs.rm(tmp, { recursive: true });
    expect(dir).toBe(tmp);
  });
});
