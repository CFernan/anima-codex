import { z } from "zod";
import { nonNegativeInt } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Elan — divine favor from a deity
// ---------------------------------------------------------------------------
export const ElanSchema = z.object({
  /** Deity name. Validated against elan catalog at runtime. */
  nombre: z.string(),
  nivel:  nonNegativeInt,
  /** Boons granted at current elan level. */
  dones:  z.array(z.string()),
});
export type Elan = z.infer<typeof ElanSchema>;
