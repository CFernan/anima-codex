import { z } from "zod";
import { CaracteristicaEnum, HabilidadCombateBasicaEnum } from "../common/enums";
import { schemaFromEnum } from "../common/utils";
import { positiveInt } from "../common/basic_types";


// DP cost schema
export const CombateCostePDSchema = schemaFromEnum(HabilidadCombateBasicaEnum, positiveInt);

// ---------------------------------------------------------------------------
// Combat skill definition — catalog data
// Static game rules for each combat skill.
// ---------------------------------------------------------------------------
export const CombateDefinicionSchema = z.object({
  /** Display name of the skill. */
  nombre: z.string(),
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CaracteristicaEnum,
});

// ---------------------------------------------------------------------------
// Combat catalog schema
// ---------------------------------------------------------------------------
export const CombateCatalogSchema = schemaFromEnum(HabilidadCombateBasicaEnum, CombateDefinicionSchema);
export type CombateCatalog = z.infer<typeof CombateCatalogSchema>;
export type CombateCatalogInput = z.input<typeof CombateCatalogSchema>;
