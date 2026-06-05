import * as z from "zod";

export const UploadSchema = z.object({
  name: z.string().min(1),
  size: z.number().positive(),
  mimeType: z.string().regex(/^(image\/(png|jpg|jpeg|gif|webp|svg(\+xml)?))$/),
});

export type Upload = z.infer<typeof UploadSchema>;
