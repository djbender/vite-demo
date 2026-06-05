import { describe, it, expect } from "vitest";
import { UploadSchema } from "./upload.schema";

describe("UploadSchema", () => {
  describe("valid inputs", () => {
    it("passes for a valid PNG upload", () => {
      const result = UploadSchema.parse({
        name: "photo.png",
        size: 1024,
        mimeType: "image/png",
      });
      expect(result).toEqual({
        name: "photo.png",
        size: 1024,
        mimeType: "image/png",
      });
    });

    it("passes for a valid JPEG upload", () => {
      const result = UploadSchema.parse({
        name: "image.jpg",
        size: 2048,
        mimeType: "image/jpeg",
      });
      expect(result).toEqual({
        name: "image.jpg",
        size: 2048,
        mimeType: "image/jpeg",
      });
    });

    it("passes for a valid GIF upload", () => {
      const result = UploadSchema.parse({
        name: "anim.gif",
        size: 512,
        mimeType: "image/gif",
      });
      expect(result).toEqual({
        name: "anim.gif",
        size: 512,
        mimeType: "image/gif",
      });
    });

    it("passes for a valid WebP upload", () => {
      const result = UploadSchema.parse({
        name: "webp_image.webp",
        size: 4096,
        mimeType: "image/webp",
      });
      expect(result).toEqual({
        name: "webp_image.webp",
        size: 4096,
        mimeType: "image/webp",
      });
    });

    it("passes for a valid SVG upload", () => {
      const result = UploadSchema.parse({
        name: "logo.svg",
        size: 256,
        mimeType: "image/svg+xml",
      });
      expect(result).toEqual({
        name: "logo.svg",
        size: 256,
        mimeType: "image/svg+xml",
      });
    });

    it("passes for a very large file", () => {
      const result = UploadSchema.parse({
        name: "huge.png",
        size: 20 * 1024 * 1024,
        mimeType: "image/png",
      });
      expect(result.size).toBe(20 * 1024 * 1024);
    });
  });

  describe("invalid inputs", () => {
    it("rejects empty name", () => {
      const result = UploadSchema.safeParse({
        name: "",
        size: 100,
        mimeType: "image/png",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing name", () => {
      const result = UploadSchema.safeParse({
        size: 100,
        mimeType: "image/png",
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero size", () => {
      const result = UploadSchema.safeParse({
        name: "photo.png",
        size: 0,
        mimeType: "image/png",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative size", () => {
      const result = UploadSchema.safeParse({
        name: "photo.png",
        size: -1,
        mimeType: "image/png",
      });
      expect(result.success).toBe(false);
    });

    it("rejects unsupported MIME type", () => {
      const result = UploadSchema.safeParse({
        name: "doc.pdf",
        size: 100,
        mimeType: "application/pdf",
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-image MIME type", () => {
      const result = UploadSchema.safeParse({
        name: "script.js",
        size: 100,
        mimeType: "application/javascript",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing mimeType", () => {
      const result = UploadSchema.safeParse({
        name: "photo.png",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing size", () => {
      const result = UploadSchema.safeParse({
        name: "photo.png",
        mimeType: "image/png",
      });
      expect(result.success).toBe(false);
    });

    it("rejects all fields missing", () => {
      const result = UploadSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("provides meaningful error messages", () => {
      const result = UploadSchema.safeParse({
        name: "",
        size: -1,
        mimeType: "application/octet-stream",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
