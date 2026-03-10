import { z } from "zod";
import { ArquetipoEnum } from "./enums";

// Shorthand validators
const nonnegInt = z.number().int().nonnegative(); // turno, pv, bonificadores
const posInt    = z.number().int().positive();    // all PD costs
const posFrac   = z.number().min(0).max(1);       // limite_* (0.0 – 1.0)

// ---------------------------------------------------------------------------
// Secondary skill group cost schema
// coste: default PD cost for all skills in the group
// overrides: individual skill costs that differ from the group default
// ---------------------------------------------------------------------------

const SecondaryGroupCostSchema = z.object({
  coste:     posInt,
  overrides: z.record(z.string(), posInt).optional(),
});

// ---------------------------------------------------------------------------
// Category costs schema
// ---------------------------------------------------------------------------

export const CategoryDefinitionSchema = z.object({
  /** Archetype tags used to compute multiclass costs. Empty array = no archetype. */
  arquetipos:        z.array(ArquetipoEnum),
  /** PD cost to buy additional HP multiples. */
  coste_multiplo_pv: posInt,
  /** Bonus HP gained on every level up. */
  pv:                nonnegInt,
  /** Bonus added to turno on every level up. */
  turno:             nonnegInt,
  /** Max fraction of PD spendable on combat skills (0.0 – 1.0). */
  limite_combate:    posFrac,
  /** Max fraction of PD spendable on magic skills (0.0 – 1.0). */
  limite_magia:      posFrac,
  /** Max fraction of PD spendable on psychic skills (0.0 – 1.0). */
  limite_psi:        posFrac,
  /** PD costs for primary combat skills. */
  combate: z.object({
    habilidad_ataque:  posInt,
    habilidad_parada:  posInt,
    habilidad_esquiva: posInt,
    llevar_armadura:   posInt,
  }),
  /** PD costs for secondary skills, grouped by type. */
  secundarias: z.object({
    atleticas:     SecondaryGroupCostSchema,
    sociales:      SecondaryGroupCostSchema,
    perceptivas:   SecondaryGroupCostSchema,
    intelectuales: SecondaryGroupCostSchema,
    vigor:         SecondaryGroupCostSchema,
    subterfugio:   SecondaryGroupCostSchema,
    creativas:     SecondaryGroupCostSchema,
  }),
  /** Skill points granted automatically on every level up, split by domain. */
  bonificadores_innatos: z.object({
    /** Combat skill bonuses (habilidad_ataque, habilidad_parada, etc.). */
    primarias:   z.record(z.string(), nonnegInt),
    /** Secondary skill bonuses. */
    secundarias: z.record(z.string(), nonnegInt),
  }),
});

export type CategoryDefinition = z.infer<typeof CategoryDefinitionSchema>;
export type CategoryDefinitionInput = z.input<typeof CategoryDefinitionSchema>;

export const AllCategoryDefinitionSchema = z.record(z.string(), CategoryDefinitionSchema);
export type AllCategoryDefinition = z.infer<typeof AllCategoryDefinitionSchema>;
export type AllCategoryDefinitionInput = z.input<typeof AllCategoryDefinitionSchema>;
