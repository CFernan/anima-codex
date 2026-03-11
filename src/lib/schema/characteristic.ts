import { z } from "zod";
import { DerivedAttributeSchema, DirectAttributeSchema } from "./attribute_type";
import { schemaFromEnum } from "./helpers/utils";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const CharacteristicEnum = z.enum([
  "agi",
  "con",
  "des",
  "fue",
  "int",
  "per",
  "pod",
  "vol",
]);

export const PhysicalCapacityEnum = z.enum([
  "tipo_de_movimiento",
  "indice_de_peso",
  "cansancio",
]);

export const SecondaryCharacteristicEnum = z.enum([
  "apariencia",
  "tamaño",
]);

export const ResistencesEnum = z.enum([
  "presencia",
  "rf",
  "re",
  "rv",
  "rm",
  "rp",
]);

// ---------------------------------------------------------------------------
// PrimaryCharacteristic investment — character data
// ---------------------------------------------------------------------------
export const CharacteristicInvestmentSchema = schemaFromEnum(
  CharacteristicEnum, DirectAttributeSchema).refine(
    obj => Object.values(obj).every(attr => attr.base > 0),
    { message: "all characteristic bases must be greater than 0" },
);

// ---------------------------------------------------------------------------
// PhysicalCapacities investment — character data
// ---------------------------------------------------------------------------
export const PhysicalCapacitiesInvestmentSchema = schemaFromEnum(
  PhysicalCapacityEnum, DerivedAttributeSchema);

// ---------------------------------------------------------------------------
// SecondaryCharacteristic investment — character data
// ---------------------------------------------------------------------------
export const SecondaryCharacteristicInvestmentSchema = z.object({
  apariencia: DirectAttributeSchema,
  tamaño:     DerivedAttributeSchema,
} satisfies Record<z.infer<typeof SecondaryCharacteristicEnum>, z.ZodTypeAny>);

// ---------------------------------------------------------------------------
// Resistances and presence investment — character data
// ---------------------------------------------------------------------------
export const ResistencesInvestmentSchema = schemaFromEnum(
  ResistencesEnum, DerivedAttributeSchema);
