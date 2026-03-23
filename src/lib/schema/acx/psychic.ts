import { z } from "zod";
import { NonNegativeInt, AtributoCalculadoSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Psiquicos section
// ---------------------------------------------------------------------------
export const atributoCVSchema = z.object({
  ...AtributoCalculadoSchema.shape,
  cvs_invertidos: NonNegativeInt,
});

export const PsiquicosSchema = z.object({
  potencial_psiquico: z.object({
    ...atributoCVSchema.shape,
    cristales_psi:  NonNegativeInt,
  }),
  innatos:     atributoCVSchema,
  disciplinas: z.array(z.object({
    /** Discipline name. Validated against psychic catalog at runtime. */
    disciplina: z.string(),
    poderes:    z.array(z.object({
      nombre:          z.string(),
      fortalecimiento: atributoCVSchema.optional(),
    })),
  })),
});
export type Psiquicos = z.infer<typeof PsiquicosSchema>;
