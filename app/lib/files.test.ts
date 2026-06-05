import { describe, it, expect } from "vitest";
import { stripUuidPrefix, formatSize, inferMime, isImage } from "./files";

describe("stripUuidPrefix", () => {
  it("removes uuid prefix", () => {
    expect(
      stripUuidPrefix("550e8400-e29b-41d4-a716-446655440000__photo.jpg")
    ).toBe("photo.jpg");
  });

  it("leaves non-prefixed names alone", () => {
    expect(stripUuidPrefix("photo.jpg")).toBe("photo.jpg");
  });
});

describe("formatSize", () => {
  it("formats bytes under 1024 as B", () => {
    expect(formatSize(512)).toBe("512 B");
  });

  it("formats bytes in KB range", () => {
    expect(formatSize(2048)).toBe("2.0 KB");
  });

  it("formats bytes in MB range", () => {
    expect(formatSize(1048576)).toBe("1.0 MB");
  });
});

describe("inferMime", () => {
  it("returns image/png for .png", () => {
    expect(inferMime("photo.png")).toBe("image/png");
  });

  it("returns undefined for non-image extension", () => {
    expect(inferMime("document.pdf")).toBeUndefined();
  });

  it("returns undefined for a name with no extension", () => {
    expect(inferMime("Makefile")).toBeUndefined();
  });
});

describe("isImage", () => {
  it("returns true for .jpg", () => {
    expect(isImage("photo.jpg")).toBe(true);
  });

  it("returns false for .txt", () => {
    expect(isImage("notes.txt")).toBe(false);
  });
});
