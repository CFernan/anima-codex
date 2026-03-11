import { z } from "zod";
import { PDAttributeSchema, PDCostSchema } from "./attribute_type";
import { CharacteristicEnum } from "./characteristic";
import { schemaFromEnum } from "./helpers/utils";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const SecondaryGroupEnum = z.enum([
  "atleticas",
  "sociales",
  "perceptivas",
  "intelectuales",
  "vigor",
  "subterfugio",
  "creativas",
]);

export const SecondaryAthleticsEnum = z.enum([
  "acrobacias",
  "atletismo",
  "montar",
  "nadar",
  "trepar",
  "saltar",
  "pilotar",
]);

export const SecondarySocialEnum = z.enum([
  "estilo",
  "intimidar",
  "liderazgo",
  "persuasion",
  "comercio",
  "callejeo",
  "etiqueta",
]);

export const SecondaryPerceptiveEnum = z.enum([
  "advertir",
  "buscar",
  "rastrear",
]);

export const SecondaryIntellectualEnum = z.enum([
  "animales",
  "ciencia",
  "ley",
  "herbolaria",
  "historia",
  "tactica",
  "medicina",
  "memorizar",
  "navegacion",
  "ocultismo",
  "tasacion",
  "v_magica",
]);

export const SecondaryVigorEnum = z.enum([
  "frialdad",
  "p_fuerza",
  "res_dolor",
]);

export const SecondarySubterfugeEnum = z.enum([
  "cerrajeria",
  "disfraz",
  "ocultarse",
  "robo",
  "sigilo",
  "tramperia",
  "venenos",
]);

export const SecondaryCreativeEnum = z.enum([
  "arte",
  "baile",
  "forja",
  "runas",
  "alquimia",
  "animismo",
  "musica",
  "t_manos",
  "caligrafia_ritual",
  "orfebreria",
  "confeccion",
  "conf_marionetas",
]);

// ---

export const ArmorPenaltyEnum = z.enum([
  "ninguno",
  "reducible",
  "reducible_hasta_mitad",
  "no_reducible",
  "percepcion",
]);

// ---------------------------------------------------------------------------
// Helper function for creating secondary schemas
// satisfies all groups are defined in the schema
// ---------------------------------------------------------------------------
function secondaryGroups<TValue extends z.ZodTypeAny>(valueSchema: TValue) {
  return z.object({
    atleticas:     schemaFromEnum(SecondaryAthleticsEnum,    valueSchema),
    sociales:      schemaFromEnum(SecondarySocialEnum,       valueSchema),
    perceptivas:   schemaFromEnum(SecondaryPerceptiveEnum,   valueSchema),
    intelectuales: schemaFromEnum(SecondaryIntellectualEnum, valueSchema),
    vigor:         schemaFromEnum(SecondaryVigorEnum,        valueSchema),
    subterfugio:   schemaFromEnum(SecondarySubterfugeEnum,   valueSchema),
    creativas:     schemaFromEnum(SecondaryCreativeEnum,     valueSchema),
  } satisfies Record<z.infer<typeof SecondaryGroupEnum>, z.ZodTypeAny>);
}

// ---------------------------------------------------------------------------
// Secondary skills investment — character data
// Tracks PD investment per skill. This is what gets written to the .acx file.
// ---------------------------------------------------------------------------
export const SecondaryInvestmentSchema = secondaryGroups(PDAttributeSchema);

// ---------------------------------------------------------------------------
// Secondary skill cost — category data
// PD cost of secondary skills for a given category.
//
// coste:        default PD cost for all skills in the group.
// sobreescribe: individual skill costs that differ from the group default.
//               Override keys are validated against the group's own skill key enum.
//
// Example with groups vigor and perceptivas:
// {
//   vigor: {
//     coste:        PDCostSchema,
//     sobreescribe?: {
//       frialdad?:  PDCostSchema,
//       p_fuerza?:  PDCostSchema,
//       res_dolor?: PDCostSchema,
//     },
//   },
//   perceptivas: {
//     coste:        PDCostSchema,
//     sobreescribe?: {
//       advertir?: PDCostSchema,
//       buscar?:   PDCostSchema,
//       rastrear?: PDCostSchema,
//     },
//   },
// }
// ---------------------------------------------------------------------------
function groupCostSchema<T extends z.ZodEnum<any>>(keyEnum: T) {
  return z.object({
    coste:        PDCostSchema,
    sobreescribe: schemaFromEnum(keyEnum, PDCostSchema).partial().strict().optional(),
    // .partial()  — every skill key is optional (only overridden skills need to be listed)
    // .strict()   — unknown keys are rejected (prevents cross-group key leakage)
    // .optional() — sobreescribe key is not mandatory
  });
}

export const SecondaryPDCostSchema = z.object({
    atleticas:     groupCostSchema(SecondaryAthleticsEnum),
    sociales:      groupCostSchema(SecondarySocialEnum),
    perceptivas:   groupCostSchema(SecondaryPerceptiveEnum),
    intelectuales: groupCostSchema(SecondaryIntellectualEnum),
    vigor:         groupCostSchema(SecondaryVigorEnum),
    subterfugio:   groupCostSchema(SecondarySubterfugeEnum),
    creativas:     groupCostSchema(SecondaryCreativeEnum),
} satisfies Record<z.infer<typeof SecondaryGroupEnum>, z.ZodTypeAny>);

// ---------------------------------------------------------------------------
// Secondary skill definition — catalog data
// Static game rules for each secondary skill.
// ---------------------------------------------------------------------------
export const SecondaryRuleDefinitionSchema = z.object({
  /** Display name of the skill (official Spanish name). */
  nombre: z.string(),
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CharacteristicEnum,
  /** If true, the skill cannot be used without PD investment (value = NaN).
   *  If false, uninvested skills apply a -30 base modifier automatically. */
  conocimiento: z.boolean().default(false),
  /** Armor penalty applied when using this skill. */
  penalizador_armadura: ArmorPenaltyEnum.default("ninguno"),
});

// ---------------------------------------------------------------------------
// Secondary rule catalog schema
// Describes the static rules for all secondary skills, grouped by type.
// ---------------------------------------------------------------------------
export const SecondaryRuleCatalogSchema = secondaryGroups(SecondaryRuleDefinitionSchema);
export type SecondaryRuleCatalogInput = z.input<typeof SecondaryRuleCatalogSchema>;
