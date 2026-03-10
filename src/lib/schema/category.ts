import { z } from "zod";
import type { BasicCombatSkillKey } from "./combat";
import { BasicCombatSkillCostSchema } from "./combat";
import {
  AtleticasGroupCostSchema,
  SocialesGroupCostSchema,
  PerceptivasGroupCostSchema,
  IntelectualesGroupCostSchema,
  VigorGroupCostSchema,
  SubterfugioGroupCostSchema,
  CreativasGroupCostSchema,
} from "./secondary";
import type { SecondaryGroupKey } from "./secondary";

// Shorthand validators
const nonnegInt = z.number().int().nonnegative(); // turno, pv, bonificadores
const posFrac   = z.number().min(0).max(1);       // limite_* (0.0 – 1.0)

// ---------------------------------------------------------------------------
// Archetype enum
// Used to determine PD costs when multiclassing.
// A category may belong to 0, 1, or 2 archetypes.
//
//   Luchador  — martial combat focused
//   Domine    — ki/martial arts focused
//   Acechador — stealth and subterfuge focused
//   Místico   — magic focused
//   Psíquico  — psychic focused
// ---------------------------------------------------------------------------

export const ArquetipoEnum = z.enum([
  "Luchador",
  "Domine",
  "Acechador",
  "Místico",
  "Psíquico",
]);

export type Arquetipo = z.infer<typeof ArquetipoEnum>;

// ---------------------------------------------------------------------------
// Category definition schema
// ---------------------------------------------------------------------------

export const CategoryDefinitionSchema = z.object({
  /** Archetype tags used to compute multiclass costs. Empty array = no archetype. */
  arquetipos:        z.array(ArquetipoEnum),
  /** PD cost to buy additional HP multiples. */
  coste_multiplo_pv: z.number().int().positive(),
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
  /** PD costs for basic combat skills. Keys validated against BasicCombatSkillKeyEnum. */
  combate: z.object({
    habilidad_ataque:  BasicCombatSkillCostSchema,
    habilidad_parada:  BasicCombatSkillCostSchema,
    habilidad_esquiva: BasicCombatSkillCostSchema,
    llevar_armadura:   BasicCombatSkillCostSchema,
  } satisfies Record<BasicCombatSkillKey, z.ZodTypeAny>),
  /** PD costs for secondary skills. Keys validated against SecondaryGroupKeyEnum.
   *  Override keys within each group are validated against that group's skill key enum. */
  secundarias: z.object({
    atleticas:     AtleticasGroupCostSchema,
    sociales:      SocialesGroupCostSchema,
    perceptivas:   PerceptivasGroupCostSchema,
    intelectuales: IntelectualesGroupCostSchema,
    vigor:         VigorGroupCostSchema,
    subterfugio:   SubterfugioGroupCostSchema,
    creativas:     CreativasGroupCostSchema,
  } satisfies Record<SecondaryGroupKey, z.ZodTypeAny>),
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
