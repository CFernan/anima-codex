import { z } from "zod";
import { schemaFromEnum } from "../common/utils";
import { HabilidadPsiquicaBasicaEnum } from "../common/enums";
import { AtributoPDSchema, PdConOpcionesSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Psychic skills section inside a category
// ---------------------------------------------------------------------------
export const HabilidadesPsiquicasSchema = z.object({
  /** The two basic psychic skills — both required when section is present. */
  ...schemaFromEnum(HabilidadPsiquicaBasicaEnum, AtributoPDSchema).shape,

  /** Psychic tables purchased. */
  tablas_psiquicas:  z.array(PdConOpcionesSchema).optional(),

  /** Mental patterns purchased. */
  patrones_mentales: z.array(PdConOpcionesSchema).optional(),
});
