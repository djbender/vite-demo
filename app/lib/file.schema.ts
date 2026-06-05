import * as z from "zod";

export const FileSchema = z.object({
  diskName: z.string().min(1).regex(/^(?!.*\.\.).*[^/\\]$/),
  name: z.string().min(1),
  size: z.number().positive(),
});

export type File = z.infer<typeof FileSchema>;
