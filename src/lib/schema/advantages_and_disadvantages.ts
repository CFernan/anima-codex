import { z } from "zod";

// ---------------------------------------------------------------------------
// Creation points
// ---------------------------------------------------------------------------
export const AdvantagesAndDisadvantagesSchema = z.object({
  total:    z.number().int().nonnegative(),
  gastados: z.number().int().nonnegative(),
});
