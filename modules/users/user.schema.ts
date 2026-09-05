import z from "zod";

export const profileUpdateSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(30, "Name must be at most 30 characters"),
    image: z.url("Invalid image URL").nullable(),
  })
  .partial();

export const userQuerySchema = z.object({
  q: z.string().trim().min(3),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
