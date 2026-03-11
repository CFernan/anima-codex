import { z } from "zod";
import { PDAttributeSchema, PDCostSchema } from "./attribute_type";
import { CharacteristicEnum } from "./characteristic";
import { schemaFromEnum } from "./helpers/utils";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const BasicCombatEnum = z.enum([
  "habilidad_ataque",
  "habilidad_parada",
  "habilidad_esquiva",
  "llevar_armadura",
]);

// ---------------------------------------------------------------------------
// Combat skills investment — character data
// Tracks PD investment per skill. This is what gets written to the .acx file.
// ---------------------------------------------------------------------------
export const CombatInvestmentSchema = schemaFromEnum(
  BasicCombatEnum, PDAttributeSchema);

// ---------------------------------------------------------------------------
// Combat skill cost — category data
// PD cost of a single basic combat skill for a given category.
// ---------------------------------------------------------------------------
export const CombatPDCostSchema = schemaFromEnum(
  BasicCombatEnum, PDCostSchema);

// ---------------------------------------------------------------------------
// Combat rules definition — catalog data
// Static game rules for each combat skill (name, associated characteristic).
// ---------------------------------------------------------------------------
export const CombatRuleDefinitionSchema = z.object({
  /** Display name of the skill. */
  nombre: z.string(),
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CharacteristicEnum,
});

// ---------------------------------------------------------------------------
// Combat rule catalog schema
// Describes the static rules for all base combat skills.
// ---------------------------------------------------------------------------
export const CombatRuleCatalogSchema = schemaFromEnum(
  BasicCombatEnum, CombatRuleDefinitionSchema)
export type CombatRuleCatalog = z.infer<typeof CombatRuleCatalogSchema>;
