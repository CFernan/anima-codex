import { z } from "zod";
import { schemaFromEnum } from "../common/utils";
import {
  HabilidadSobrenaturalBasicaEnum, ConvocatoriaEnum,
} from "../common/enums";
import { PDAttributeSchema, TablaEntrySchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Supernatural skills section inside a category
// ---------------------------------------------------------------------------
export const HabilidadesSobrenaturalesSchema = z.object({
  /** The four basic supernatural skills — all required when section is present. */
  ...schemaFromEnum(HabilidadSobrenaturalBasicaEnum, PDAttributeSchema).shape,

  /** Nivel de magia — optional even when section is present. */
  nivel_de_magia: PDAttributeSchema.optional(),

  /** Summoning subsystem — all four required if convocatoria is present. */
  convocatoria: schemaFromEnum(ConvocatoriaEnum, PDAttributeSchema).optional(),

  /** Mystic tables purchased. */
  tablas_misticas: z.array(TablaEntrySchema).optional(),
});
export type HabilidadesSobrenaturales = z.infer<typeof HabilidadesSobrenaturalesSchema>;
