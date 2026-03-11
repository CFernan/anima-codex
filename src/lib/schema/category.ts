import { z } from "zod";
import { PDAttributeSchema } from "./attribute_type";
import { BasicCombatEnum, CombatInvestmentSchema, CombatPDCostSchema } from "./combat";
import { schemaFromEnum, uniqueValues } from "./helpers/utils";
import { SecondaryAthleticsEnum, SecondaryCreativeEnum, SecondaryIntellectualEnum, SecondaryInvestmentSchema, SecondaryPDCostSchema, SecondaryPerceptiveEnum, SecondarySocialEnum, SecondarySubterfugeEnum, SecondaryVigorEnum } from "./secondary";

// Shorthand validators
const positiveInt      = z.number().int().positive();
const nonNegativeInt   = z.number().int().nonnegative();
const positiveFraction = z.number().min(0).max(1);

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const ArchetypeEnum = z.enum([
  "Luchador",
  "Domine",
  "Acechador",
  "Místico",
  "Psíquico",
]);

// ---------------------------------------------------------------------------
// Character category (class)
// Each category owns its PD investments.
// ---------------------------------------------------------------------------
export const CategoryInvestmentSchema = z.object({
  /** Category name (e.g. "Guerrero", "Acróbata"). */
  nombre:         z.string(),
  /** Character level within this category. Must be at least 1. */
  nivel:          positiveInt,
  /** Primary combat skills with their PD investments. */
  combate:        CombatInvestmentSchema,
  /** Secondary skills with their PD investments, grouped by type. */
  secundarias:    SecondaryInvestmentSchema,
  /** Life points, have a base derived value + PD investment. */
  puntos_de_vida: PDAttributeSchema,
});

// ---------------------------------------------------------------------------
// Category definition schema
// ---------------------------------------------------------------------------
export const CategoryRuleDefinitionSchema = z.object({
  /** Archetype tags used to compute multiclass costs. Empty array = no archetype. No duplicates */
  arquetipos: z.array(ArchetypeEnum).refine(uniqueValues(),
    { message: "arquetipos must not contain duplicates" },
  ),
  /** PD cost to buy additional HP multiples. */
  coste_multiplo_pv: positiveInt,
  /** Bonus HP gained on every level up. */
  pv:                nonNegativeInt,
  /** Bonus added to turno on every level up. */
  turno:             nonNegativeInt,
  /** Max fraction of PD spendable on combat skills (0.0 – 1.0). */
  limite_combate:    positiveFraction,
  /** Max fraction of PD spendable on magic skills (0.0 – 1.0). */
  limite_magia:      positiveFraction,
  /** Max fraction of PD spendable on psychic skills (0.0 – 1.0). */
  limite_psi:        positiveFraction,
  /** PD costs for combat skills. */
  combate:           CombatPDCostSchema,
  /** PD costs for secondary skills. */
  secundarias:       SecondaryPDCostSchema,
  /** Skill points granted automatically on every level up, split by domain. */
  bonificadores_innatos: z.object({
    /** Combat skill bonuses (habilidad_ataque, habilidad_parada, etc.). */
    primarias: z.object({
      ...schemaFromEnum(BasicCombatEnum, nonNegativeInt).shape,
    }).partial().strict(),
    /** Secondary skill bonuses. */
    secundarias: z.object({
      ...schemaFromEnum(SecondaryAthleticsEnum,    nonNegativeInt).shape,
      ...schemaFromEnum(SecondarySocialEnum,       nonNegativeInt).shape,
      ...schemaFromEnum(SecondaryPerceptiveEnum,   nonNegativeInt).shape,
      ...schemaFromEnum(SecondaryIntellectualEnum, nonNegativeInt).shape,
      ...schemaFromEnum(SecondaryVigorEnum,        nonNegativeInt).shape,
      ...schemaFromEnum(SecondarySubterfugeEnum,   nonNegativeInt).shape,
      ...schemaFromEnum(SecondaryCreativeEnum,     nonNegativeInt).shape,
    }).partial().strict(),
  }),
});

export const AllCategoryDefinitionSchema = z.record(z.string(), CategoryRuleDefinitionSchema);
export type AllCategoryDefinitionInput = z.input<typeof AllCategoryDefinitionSchema>;
