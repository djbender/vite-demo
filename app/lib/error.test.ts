import { describe, it, expect } from "vitest";
import { formatZodError } from "./error";
import * as z from "zod";

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().positive(),
});

describe("formatZodError", () => {
  it("returns a 400 Response with error and issues", async () => {
    const result = testSchema.safeParse({ name: "", age: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const response = formatZodError("User", result.error);
      expect(response.status).toBe(400);
      const data = (await response.json()) as { error: string; issues: Array<{ field: string; message: string }> };
      expect(data.error).toBe("User validation failed");
      expect(data.issues).toHaveLength(2);
      expect(data.issues[0].field).toBe("name");
      expect(data.issues[1].field).toBe("age");
    }
  });

  it("uses _root for issues without a path", async () => {
    const schema = z.string();
    const result = schema.safeParse(123);
    expect(result.success).toBe(false);
    if (!result.success) {
      const response = formatZodError("Input", result.error);
      expect(response.status).toBe(400);
      const data = (await response.json()) as { error: string; issues: Array<{ field: string; message: string }> };
      expect(data.issues[0].field).toBe("_root");
    }
  });
});
