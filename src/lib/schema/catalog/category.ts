import { z } from "zod";
import { NonNegativeInt, PositiveFraction, PositiveInt } from "../common/basic_types";
import { CombateCostePDSchema } from "./combat";
import { SecundariasCostePDSchema } from "./secondaryAbilities";


export const BonificadoresInnatosSchema = z.record(z.string(), NonNegativeInt);

export const CategoriaDefinicionSchema = z.object({
  /** Archetype tags used to compute multiclass costs. Empty array = no archetype. */
  arquetipos:        z.array(z.string()),
  /** PD cost to buy additional HP multiples. */
  coste_multiplo_pv: PositiveInt,
  /** Bonus HP gained on every level up. */
  pv:                NonNegativeInt,
  /** Bonus added to turno on every level up. */
  turno:             NonNegativeInt,
  /** Max fraction of PD spendable on combat skills (0.0 – 1.0). */
  limite_combate:    PositiveFraction,
  /** Max fraction of PD spendable on magic skills (0.0 – 1.0). */
  limite_magia:      PositiveFraction,
  /** Max fraction of PD spendable on psychic skills (0.0 – 1.0). */
  limite_psi:        PositiveFraction,
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
