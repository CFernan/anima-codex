import { z } from "zod";
import { AtributoFlexibleSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Secondary skills section inside a category
//
// Official groups (atleticas|sociales|...) and custom groups all share the
// same value schema: a record of skill_id → PDAttribute.
// The `ki` key is reserved for the two ki secondary skills → DerivedAttribute.
// custom skills can also be → DirectAttribute
//
// z.record(z.string(), ...) covers both official and custom groups.
// Runtime validation against catalog ensures group and skill keys are valid.
// ---------------------------------------------------------------------------
export const HabilidadesSecundariasSchema = z.record(
  z.string(),                                    // group
  z.record(z.string(), AtributoFlexibleSchema), // records of skills
);
export type HabilidadesSecundarias = z.infer<typeof HabilidadesSecundariasSchema>;
