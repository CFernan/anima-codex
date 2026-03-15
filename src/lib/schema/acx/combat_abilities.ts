import { z } from "zod";
import { schemaFromEnum } from "../common/utils";
import {
  HabilidadCombateBasicaEnum, KiCaracteristicaEnum,
} from "../common/enums";
import { PDAttributeSchema, TablaEntrySchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Ki skills inside habilidades_de_combate
// ---------------------------------------------------------------------------
export const HabilidadesDelKiSchema = z.object({
  /** PD invested in each ki point pool per characteristic. */
  puntos_de_ki: schemaFromEnum(KiCaracteristicaEnum, PDAttributeSchema)
    .partial()
    .optional(),
  /** PD invested in ki accumulations per characteristic. */
  acumulaciones_de_ki: schemaFromEnum(KiCaracteristicaEnum, PDAttributeSchema)
    .partial()
    .optional(),
  /** PD invested in martial knowledge. */
  conocimiento_marcial: PDAttributeSchema.optional(),
});
export type HabilidadesDelKi = z.infer<typeof HabilidadesDelKiSchema>;

// ---------------------------------------------------------------------------
// Combat skills section inside a category
// ---------------------------------------------------------------------------
export const HabilidadesDeCombateSchema = z.object({
  /** The four basic combat skills — all required when section is present. */
  ...schemaFromEnum(HabilidadCombateBasicaEnum, PDAttributeSchema).shape,

  /**
   * Weapon developed for this category.
   * Validated against weapon catalog at runtime.
   */
  arma_desarrollada: z.string(),

  /** Ki subsystem investments. */
  habilidades_del_ki: HabilidadesDelKiSchema.optional(),

  /** Weapon tables purchased. */
  tablas_de_armas: z.array(TablaEntrySchema).optional(),

  /** Style tables purchased. */
  tablas_de_estilos: z.array(TablaEntrySchema).optional(),

  /**
   * Martial arts and martial art tables purchased.
   * Each element has exactly one catalog key (arte_marcial or tabla_de_arte_marcial).
   * The two enum sets are disjoint — key identity determines type.
   */
  artes_marciales: z.array(TablaEntrySchema).optional(),

  /**
   * Ars magnus entries (menor, mayor, armas_imposibles).
   * Each element has exactly one catalog key from the merged ars_magnus enum.
   */
  ars_magnus: z.array(TablaEntrySchema).optional(),

  /** Supernatural combat tables purchased. */
  tablas_de_combate_sobrenatural: z.array(TablaEntrySchema).optional(),
});
export type HabilidadesDeCombate = z.infer<typeof HabilidadesDeCombateSchema>;
