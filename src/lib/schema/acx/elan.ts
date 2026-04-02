import { z } from "zod";
import { PositiveInt } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Elan — divine favor from a deity
// ---------------------------------------------------------------------------
export const ElanSchema = z.object({
  /** Deity name. Validated against elan catalog at runtime. */
  nombre: z.string(),
  nivel:  PositiveInt,
  /** Boons granted at current elan level. */
  dones:  z.array(z.string()),
});
