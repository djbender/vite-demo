import { describe, it, expect } from "vitest";
import { FileSchema } from "./file.schema";

describe("FileSchema", () => {
  describe("valid inputs", () => {
    it("passes for a normal disk name", () => {
      const result = FileSchema.parse({
        diskName: "550e8400-e29b-41d4-a716-446655440000__photo.jpg",
        name: "photo.jpg",
        size: 1024,
      });
      expect(result).toEqual({
        diskName: "550e8400-e29b-41d4-a716-446655440000__photo.jpg",
        name: "photo.jpg",
        size: 1024,
      });
    });

    it("passes for a disk name without path traversal", () => {
      const result = FileSchema.parse({
        diskName: "abc123__document.pdf",
        name: "document.pdf",
        size: 2048,
      });
      expect(result.name).toBe("document.pdf");
    });

    it("passes for a disk name with hyphens and underscores", () => {
      const result = FileSchema.parse({
        diskName: "a1b2c3d4-e5f6-7890-abcd-ef1234567890__my-file_name.png",
        name: "my-file_name.png",
        size: 512,
      });
      expect(result).toBeTruthy();
    });
  });

  describe("invalid inputs", () => {
    it("rejects disk name with path traversal (..)", () => {
      const result = FileSchema.safeParse({
        diskName: "550e8400-e29b-41d4-a716-446655440000__../../etc/passwd",
        name: "passwd",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects disk name with forward slash", () => {
      const result = FileSchema.safeParse({
        diskName: "550e8400-e29b-41d4-a716-446655440000__../../etc/shadow",
        name: "shadow",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects disk name with backslash", () => {
      const result = FileSchema.safeParse({
        diskName: "550e8400-e29b-41d4-a716-446655440000__..\\windows\\system32",
        name: "system32",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty diskName", () => {
      const result = FileSchema.safeParse({
        diskName: "",
        name: "photo.png",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty name", () => {
      const result = FileSchema.safeParse({
        diskName: "abc123__photo.png",
        name: "",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero size", () => {
      const result = FileSchema.safeParse({
        diskName: "abc123__photo.png",
        name: "photo.png",
        size: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative size", () => {
      const result = FileSchema.safeParse({
        diskName: "abc123__photo.png",
        name: "photo.png",
        size: -1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing diskName", () => {
      const result = FileSchema.safeParse({
        name: "photo.png",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing name", () => {
      const result = FileSchema.safeParse({
        diskName: "abc123__photo.png",
        size: 100,
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing size", () => {
      const result = FileSchema.safeParse({
        diskName: "abc123__photo.png",
        name: "photo.png",
      });
      expect(result.success).toBe(false);
    });

    it("rejects all fields missing", () => {
      const result = FileSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
