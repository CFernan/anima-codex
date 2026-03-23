import { z } from "zod";
import { schemaFromEnum } from "../common/utils";
import {
  HabilidadSobrenaturalBasicaEnum, ConvocatoriaEnum,
} from "../common/enums";
import { AtributoPDSchema, PdConOpcionesSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Supernatural skills section inside a category
// ---------------------------------------------------------------------------
export const HabilidadesSobrenaturalesSchema = z.object({
  /** The four basic supernatural skills — all required when section is present. */
  ...schemaFromEnum(HabilidadSobrenaturalBasicaEnum, AtributoPDSchema).shape,

  /** Nivel de magia — optional even when section is present. */
  nivel_de_magia: AtributoPDSchema.optional(),

  /** Mystic tables purchased. */
  tablas_misticas: z.array(PdConOpcionesSchema).optional(),

  /** Summoning subsystem — all four required if convocatoria is present. */
  convocatoria: schemaFromEnum(ConvocatoriaEnum, AtributoPDSchema).optional(),
});
export type HabilidadesSobrenaturales = z.infer<typeof HabilidadesSobrenaturalesSchema>;
