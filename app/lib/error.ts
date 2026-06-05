import type { z } from "zod";

export function formatZodError(schemaName: string, error: z.ZodError): Response {
  const issues = error.issues.map((issue) => ({
    field: issue.path.join(".") || "_root",
    message: issue.message,
  }));
  return Response.json(
    { error: `${schemaName} validation failed`, issues },
    { status: 400 }
  );
}
