import { z } from "zod";
import { CaracteristicaEnum } from "./enums";
import { PDCharacteristicSkillSchema } from "./attribute";

// ---------------------------------------------------------------------------
// Combat skills — character data
// Fixed set, always present. Each skill always has at least the
// characteristic bonus as an automatic base modifier.
// ---------------------------------------------------------------------------

export const CombatSkillsSchema = z.object({
  habilidad_ataque:  PDCharacteristicSkillSchema,
  habilidad_parada:  PDCharacteristicSkillSchema,
  habilidad_esquiva: PDCharacteristicSkillSchema,
  llevar_armadura:   PDCharacteristicSkillSchema,
});

export type CombatSkills = z.infer<typeof CombatSkillsSchema>;

// ---------------------------------------------------------------------------
// Combat skill definition — catalog data
// Static game rules for each combat skill.
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
// Extensible: new combat skills can be added without breaking existing data.
// ---------------------------------------------------------------------------

export const CombatCatalogSchema = z.object({
  habilidad_ataque:  CombatSkillDefinitionSchema,
  habilidad_parada:  CombatSkillDefinitionSchema,
  habilidad_esquiva: CombatSkillDefinitionSchema,
  llevar_armadura:   CombatSkillDefinitionSchema,
  custom:            z.record(z.string(), CombatSkillDefinitionSchema).optional(),
});

export type CombatCatalog = z.infer<typeof CombatCatalogSchema>;
export type CombatCatalogInput = z.input<typeof CombatCatalogSchema>;
