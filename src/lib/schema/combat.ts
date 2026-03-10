import { z } from "zod";
import { CaracteristicaEnum, PDAttributeSchema } from "./attribute";

// ---------------------------------------------------------------------------
// Basic combat skill keys
// Single source of truth for the 4 base combat skill identifiers.
// Imported by category.ts to derive PD cost shapes without duplication.
// Future combat subsystems (martial arts, ki, etc.) define their own keys.
// ---------------------------------------------------------------------------

export const BasicCombatSkillKeyEnum = z.enum([
  "habilidad_ataque",
  "habilidad_parada",
  "habilidad_esquiva",
  "llevar_armadura",
]);

export type BasicCombatSkillKey = z.infer<typeof BasicCombatSkillKeyEnum>;

// ---------------------------------------------------------------------------
// Combat skills investment — character data
// Tracks PD investment per skill. This is what gets written to the .acx file.
// satisfies enforces that all BasicCombatSkillKey keys are present.
// ---------------------------------------------------------------------------

export const CombatSkillsInvestmentSchema = z.object({
  habilidad_ataque:  PDAttributeSchema,
  habilidad_parada:  PDAttributeSchema,
  habilidad_esquiva: PDAttributeSchema,
  llevar_armadura:   PDAttributeSchema,
} satisfies Record<BasicCombatSkillKey, z.ZodTypeAny>);

export type CombatSkillsInvestment = z.infer<typeof CombatSkillsInvestmentSchema>;

// ---------------------------------------------------------------------------
// Combat skill cost — category data
// PD cost of a single basic combat skill for a given category.
// Moved here from category.ts — costs are a property of the combat subsystem.
// ---------------------------------------------------------------------------

export const BasicCombatSkillCostSchema = z.number().int().positive();
export type BasicCombatSkillCost = z.infer<typeof BasicCombatSkillCostSchema>;

// ---------------------------------------------------------------------------
// Combat skill definition — catalog data
// Static game rules for each combat skill (name, associated characteristic).
// ---------------------------------------------------------------------------

export const CombatSkillDefinitionSchema = z.object({
  /** Display name of the skill. */
  nombre: z.string(),
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CaracteristicaEnum,
});

export type CombatSkillDefinition = z.infer<typeof CombatSkillDefinitionSchema>;

// ---------------------------------------------------------------------------
// Combat catalog schema
// Describes the static rules for all base combat skills.
// Extensible: custom combat skills can be added without breaking existing data.
// ---------------------------------------------------------------------------

export const CombatCatalogSchema = z.object({
  habilidad_ataque:  CombatSkillDefinitionSchema,
  habilidad_parada:  CombatSkillDefinitionSchema,
  habilidad_esquiva: CombatSkillDefinitionSchema,
  llevar_armadura:   CombatSkillDefinitionSchema,
  custom:            z.record(z.string(), CombatSkillDefinitionSchema).optional(),
} satisfies Record<BasicCombatSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>);

export type CombatCatalog = z.infer<typeof CombatCatalogSchema>;
export type CombatCatalogInput = z.input<typeof CombatCatalogSchema>;
