import { z } from "zod";
import { AtributoCalculadoSchema, AtributoFlexibleSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Secondary skills section inside a category
//
// Official groups (atleticas|sociales|...) and custom groups all share the
// same value schema: a record of skill_id → PDAttribute.
// The `ki` key is reserved for the two ki secondary skills → ComputedAttribute.
// custom skills can also be → DirectAttribute
//
// z.record(z.string(), ...) covers both official and custom groups.
// Runtime validation against catalog ensures group and skill keys are valid.
// ---------------------------------------------------------------------------
// Next schema is used for each category investment, thus it takes Flexible schema
export const HabilidadesSecundariasCategoriaSchema = z.record(
  z.string(),                                   // group
  z.record(z.string(), AtributoFlexibleSchema), // records of skills
);
export type HabilidadesSecundariasCategoria = z.infer<typeof HabilidadesSecundariasCategoriaSchema>;

// Next schema is used for global result (sum of all categories) thus it takes Computed Schema
export const HabilidadesSecundariasSchema = z.record(
  z.string(),
  z.record(z.string(), AtributoCalculadoSchema),
);
export type HabilidadesSecundarias = z.infer<typeof HabilidadesSecundariasSchema>;
