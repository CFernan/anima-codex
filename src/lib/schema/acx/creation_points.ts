import { z } from "zod";
import { NombreConOpcionesSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Creation points
// ---------------------------------------------------------------------------
export const PuntosDeCreacionSchema = z.object({
  /** Advantages chosen during character creation. */
  ventajas:    z.array(NombreConOpcionesSchema),
  /** Disadvantages chosen during character creation. */
  desventajas: z.array(NombreConOpcionesSchema).optional(),
  /** Liberalized creation points — disadvantages bought off. */
  pcs_liberalizados: z.array(z.object({
      ...NombreConOpcionesSchema.shape,
      /** Whether this entry removes an existing disadvantage. */
      eliminar_desventaja: z.boolean().optional(),
    }),
  ).optional(),
});
export type PuntosDeCreacion = z.infer<typeof PuntosDeCreacionSchema>;
