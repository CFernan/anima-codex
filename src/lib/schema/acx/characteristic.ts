import { z } from "zod";
import {
  CaracteristicaEnum, CapacidadFisicaEnum,
  ResistenciaEnum,
} from "../common/enums";
import {
  DirectAttributeSchema,
  DerivedAttributeSchema,
} from "../common/basic_types";
import { schemaFromEnum } from "../common/utils";


// ---------------------------------------------------------------------------
// Primary characteristics — all 8, all required, base > 0
// ---------------------------------------------------------------------------
export const CaracteristicasPrimariasSchema = schemaFromEnum(
  CaracteristicaEnum, DirectAttributeSchema,
);
export type CaracteristicasPrimarias = z.infer<typeof CaracteristicasPrimariasSchema>;

// ---------------------------------------------------------------------------
// Secondary characteristics
//   apariencia — DirectAttribute (user assigns base)
//   tamaño     — DerivedAttribute (base computed by engine from characteristics)
// ---------------------------------------------------------------------------
export const CaracteristicasSecundariasSchema = z.object({
  apariencia: DirectAttributeSchema,
  tamaño:     DerivedAttributeSchema,
});
export type CaracteristicasSecundarias = z.infer<typeof CaracteristicasSecundariasSchema>;

// ---------------------------------------------------------------------------
// Physical capacities — all 4, modifiers only
// ---------------------------------------------------------------------------
export const CapacidadesFisicasSchema = schemaFromEnum(
  CapacidadFisicaEnum, DerivedAttributeSchema,
);
export type CapacidadesFisicas = z.infer<typeof CapacidadesFisicasSchema>;

// ---------------------------------------------------------------------------
// Resistances and presence — all 6, modifiers only
// ---------------------------------------------------------------------------
export const ResistenciasSchema = schemaFromEnum(
  ResistenciaEnum, DerivedAttributeSchema,
);
export type Resistencias = z.infer<typeof ResistenciasSchema>;
