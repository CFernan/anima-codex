import { z } from "zod";
import { nonNegativeInt, DerivedAttributeSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Psiquicos section
// ---------------------------------------------------------------------------
export const CVInversionSchema = z.object({
  cvs_invertidos: nonNegativeInt,
  ...DerivedAttributeSchema.shape,
});

export const PsiquicosSchema = z.object({
  potencial_psiquico: z.object({
    ...CVInversionSchema.shape,
    cristales_psi:  nonNegativeInt,
  }),
  innatos: CVInversionSchema,
  disciplinas: z.array(z.object({
    /** Discipline name. Validated against psychic catalog at runtime. */
    disciplina: z.string(),
    poderes_dominados: z.array(z.object({
      nombre:          z.string(),
      fortalecimiento: CVInversionSchema,
    })),
  })),
});
export type Psiquicos = z.infer<typeof PsiquicosSchema>;
