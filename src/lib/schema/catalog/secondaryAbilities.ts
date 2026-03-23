import { z, } from "zod";
import { TipoAtributoSchema, PositiveInt } from "../common/basic_types";
import { CaracteristicaEnum } from "../common/enums";


// ---------------------------------------------------------------------------
// DP cost schemas
// ---------------------------------------------------------------------------
//** Schema to set the general DP cost of a group with single particular secondary skills costs*/
export const SecundariaGrupoCostePDsSchema = z.object({
  general: PositiveInt,
  particular: z.record(z.string(), PositiveInt).optional()
});

//* Final schema, union of both */
export const SecundariasCostePDSchema = z.record(z.string(), SecundariaGrupoCostePDsSchema);

// ---------------------------------------------------------------------------
// Armor penalty enum
// Describes how a skill is affected by worn armor and whether the
// penalty can be reduced via the llevar_armadura skill.
//
//   ninguno               — no penalty
//   reducible             — penalty can be fully eliminated via llevar_armadura
//   reducible_hasta_mitad — penalty can be reduced by at most half
//   no_reducible          — penalty cannot be reduced in any way
//   percepcion            — non-reducible penalty applied only to perceptive
//                           skills (advertir, buscar, rastrear)
// ---------------------------------------------------------------------------
export const PenalizadorArmaduraEnum = z.enum([
  "ninguno",
  "reducible",
  "reducible_hasta_mitad",
  "no_reducible",
  "percepcion",
]);

// ---------------------------------------------------------------------------
// Secondary skill definition — catalog data
// Static game rules for each secondary skill.
// ---------------------------------------------------------------------------
export const SecundariaDefinicionSchema = z.object({
  /** Display name of the skill. */
  nombre: z.string(),
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CaracteristicaEnum.nullable(),
  /** If true, the skill cannot be used without PD investment (value = NaN).
   *  If false, uninvested skills apply a -30 base modifier automatically. */
  conocimiento: z.boolean().default(false),
  /** Armor penalty applied when using this skill. */
  penalizador_armadura: PenalizadorArmaduraEnum.default("ninguno"),
  /** Type of attribute (Direct, PD, Derived or Flexible) */
  tipo_schema: TipoAtributoSchema.default("pd")
});

export const SecundariasCatalogSchema = z.record(
  z.string(),
  z.record(z.string(), SecundariaDefinicionSchema)
)
export type SecundariasCatalog = z.infer<typeof SecundariasCatalogSchema>
export type SecundariasCatalogInput = z.input<typeof SecundariasCatalogSchema>
