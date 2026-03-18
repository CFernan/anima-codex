import { z } from "zod";
import { CambioCategoriaEnum } from "../common/enums";
import { AtributoPDSchema, nonNegativeInt, pd, positiveInt } from "../common/basic_types";
import { HabilidadesDeCombateSchema } from "./combat_abilities";
import { HabilidadesSobrenaturalesSchema } from "./supernatural_abilities";
import { HabilidadesPsiquicasSchema } from "./psychic_abilities";
import { HabilidadesSecundariasSchema } from "./secondary_abilities";


// ---------------------------------------------------------------------------
// Category change cost — PD paid on class transition (multiclass)
// previa:   PD paid by the outgoing class
// posterior: PD paid by the incoming class
// ---------------------------------------------------------------------------
const cambioDeCategoriaSchema = z.object({
  previa:    z.object({ pd: pd }).optional(),
  posterior: z.object({ pd: pd }).optional(),
} satisfies Record<z.infer<typeof CambioCategoriaEnum>, z.ZodTypeAny>);

// ---------------------------------------------------------------------------
// Single category investment entry
// ---------------------------------------------------------------------------
export const CategoriaInversionSchema = z.object({
  /**
   * Category name. Validated against categories catalog at runtime.
   * e.g. "Guerrero", "Hechicero"
   */
  categoria: z.string(),

  /** Character level within this category. At least 0. */
  nivel: nonNegativeInt,

  /** Life points PD investment for this category. */
  puntos_de_vida: AtributoPDSchema.optional(),

  /** Combat skills investment. arma_desarrollada required if present. */
  habilidades_de_combate: HabilidadesDeCombateSchema.optional(),

  /** Supernatural skills investment. */
  habilidades_sobrenaturales: HabilidadesSobrenaturalesSchema.optional(),

  /** Psychic skills investment. */
  habilidades_psiquicas: HabilidadesPsiquicasSchema.optional(),

  /** Secondary skills investment. */
  habilidades_secundarias: HabilidadesSecundariasSchema.optional(),

  /** PD cost of class transition (multiclass). */
  cambio_de_categoria: cambioDeCategoriaSchema.optional(),
});
export type CategoriaInversion = z.infer<typeof CategoriaInversionSchema>;
