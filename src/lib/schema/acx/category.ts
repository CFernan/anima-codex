import { z } from "zod";
import { CambioCategoriaEnum } from "../common/enums";
import { AtributoPDSchema, NonNegativeInt, PD, PositiveInt } from "../common/basic_types";
import { HabilidadesDeCombateSchema } from "./combat_abilities";
import { HabilidadesSobrenaturalesSchema } from "./supernatural_abilities";
import { HabilidadesPsiquicasSchema } from "./psychic_abilities";
import { HabilidadesSecundariasCategoriaSchema } from "./secondary_abilities";


// ---------------------------------------------------------------------------
// Category change cost — PD paid on class transition (multiclass)
// previa:   PD paid by the outgoing class
// posterior: PD paid by the incoming class
// ---------------------------------------------------------------------------
const pdCambioDeCategoriaSchema = z.object({
  previa:    PD.optional(),
  posterior: PD.optional(),
} satisfies Record<z.infer<typeof CambioCategoriaEnum>, z.ZodTypeAny>);

// ---------------------------------------------------------------------------
// Single category investment entry
// ---------------------------------------------------------------------------
export const CategoriaInversionSchema = z.object({
  /**
   * Category name. Validated against categories catalog at runtime.
   * e.g. "Guerrero", "Hechicero"
   */
  categoria:        z.string(),

  /** Character level within this category. At least 0. */
  nivel:            NonNegativeInt,

  //** Computed by engine values */
  __pds_invertidos: NonNegativeInt.optional(),
  __pds_totales:    PositiveInt.optional(),

  /** Life points PD investment for this category. */
  puntos_de_vida:   AtributoPDSchema.optional(),

  /** Combat skills investment. arma_desarrollada required if present. */
  habilidades_de_combate:     HabilidadesDeCombateSchema.optional(),

  /** Supernatural skills investment. */
  habilidades_sobrenaturales: HabilidadesSobrenaturalesSchema.optional(),

  /** Psychic skills investment. */
  habilidades_psiquicas:      HabilidadesPsiquicasSchema.optional(),

  /** Secondary skills investment. */
  habilidades_secundarias:    HabilidadesSecundariasCategoriaSchema.optional(),

  /** PD cost of class transition (multiclass). */
  pd_cambio_de_categoria:     pdCambioDeCategoriaSchema.optional(),
});

export const InversionPdsSchema = z.object({
  __pds_invertidos: NonNegativeInt.optional(),
  __pds_totales:    NonNegativeInt.optional(),
  categorias:       z.array(CategoriaInversionSchema),
})
