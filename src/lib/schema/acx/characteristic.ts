import { z } from "zod";
import {
  CaracteristicaEnum, CapacidadFisicaEnum,
  ResistenciaEnum,
} from "../common/enums";
import {
  AtributoDirectoSchema,
  AtributoCalculadoSchema,
} from "../common/basic_types";
import { schemaFromEnum } from "../common/utils";


// ---------------------------------------------------------------------------
// Primary characteristics — all 8, all required, base > 0
// ---------------------------------------------------------------------------
export const CaracteristicasPrimariasSchema = schemaFromEnum(
  CaracteristicaEnum, AtributoDirectoSchema,
);
export type CaracteristicasPrimarias = z.infer<typeof CaracteristicasPrimariasSchema>;

// ---------------------------------------------------------------------------
// Secondary characteristics
//   apariencia — Direct attribute (user assigns base)
//   tamaño     — Computed attribute (base computed by engine from characteristics)
// ---------------------------------------------------------------------------
export const CaracteristicasSecundariasSchema = z.object({
  apariencia: AtributoDirectoSchema,
  tamaño:     AtributoCalculadoSchema.optional(),
});
export type CaracteristicasSecundarias = z.infer<typeof CaracteristicasSecundariasSchema>;

// ---------------------------------------------------------------------------
// Physical capacities — all 4, modifiers only
// ---------------------------------------------------------------------------
export const CapacidadesFisicasSchema = schemaFromEnum(
  CapacidadFisicaEnum, AtributoCalculadoSchema,
).partial();
export type CapacidadesFisicas = z.infer<typeof CapacidadesFisicasSchema>;

// ---------------------------------------------------------------------------
// Resistances and presence — all 6, modifiers only
// ---------------------------------------------------------------------------
export const ResistenciasSchema = schemaFromEnum(
  ResistenciaEnum, AtributoCalculadoSchema,
).partial();
export type Resistencias = z.infer<typeof ResistenciasSchema>;
