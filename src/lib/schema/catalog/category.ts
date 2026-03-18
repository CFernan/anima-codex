import { z } from "zod";
import { nonNegativeInt, positiveFrac, positiveInt } from "../common/basic_types";
import { CombateCostePDSchema } from "./combat";
import { SecundariasCostePDSchema } from "./secondaryAbilities";


export const BonificadoresInnatosSchema = z.record(z.string(), nonNegativeInt);

export const CategoriaDefinicionSchema = z.object({
  /** Archetype tags used to compute multiclass costs. Empty array = no archetype. */
  arquetipos:        z.array(z.string()),
  /** PD cost to buy additional HP multiples. */
  coste_multiplo_pv: positiveInt,
  /** Bonus HP gained on every level up. */
  pv:                nonNegativeInt,
  /** Bonus added to turno on every level up. */
  turno:             nonNegativeInt,
  /** Max fraction of PD spendable on combat skills (0.0 – 1.0). */
  limite_combate:    positiveFrac,
  /** Max fraction of PD spendable on magic skills (0.0 – 1.0). */
  limite_magia:      positiveFrac,
  /** Max fraction of PD spendable on psychic skills (0.0 – 1.0). */
  limite_psi:        positiveFrac,
  /** PD costs for primary combat skills. */
  combate:           CombateCostePDSchema,
  /** PD costs for secondary skills, grouped by type. */
  secundarias:       SecundariasCostePDSchema,
  /** Skill points granted automatically on every level up, split by domain. */
  bonificadores_innatos: z.object({
    /** Combat skill bonuses (habilidad_ataque, habilidad_parada, etc.). */
    primarias:       BonificadoresInnatosSchema,
    /** Secondary skill bonuses. */
    secundarias:     BonificadoresInnatosSchema,
  }),
  /** Special rules */
  reglas_especiales: z.unknown().optional(),
});

export const CategoriasCatalogSchema = z.record(z.string(), CategoriaDefinicionSchema)
export type CategoriasCatalog = z.infer<typeof CategoriasCatalogSchema>
export type CategoriasCatalogInput = z.input<typeof CategoriasCatalogSchema>
