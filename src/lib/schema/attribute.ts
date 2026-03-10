import { z } from "zod";

// ---------------------------------------------------------------------------
// Primary characteristics enum
// Used across schemas, engine formulas, and UI components.
// ---------------------------------------------------------------------------

export const CaracteristicaEnum = z.enum([
  "agi",
  "con",
  "des",
  "fue",
  "int",
  "per",
  "pod",
  "vol",
]);

export type Caracteristica = z.infer<typeof CaracteristicaEnum>;

// ---------------------------------------------------------------------------
// Attribute modifier
// Field names are in Spanish — they appear verbatim in .acx save files.
// ---------------------------------------------------------------------------

export const AttributeModifierSchema = z.object({
  /** Numeric modifier value. May be negative. */
  valor: z.number(),
  /** Origin of the modifier (e.g. "Raza", "Bono característica", "Bono de nivel Guerrero"). */
  fuente: z.string(),
  /** Optional free-text description. */
  descriptor: z.string().optional(),
  /** If true, the modifier is always applied automatically. */
  automatico: z.boolean(),
});

export type AttributeModifier = z.infer<typeof AttributeModifierSchema>;

// ---------------------------------------------------------------------------
// Attribute hierarchy
//
//   AttributeSchema             — shared modifier arrays (never standalone)
//   ├── DirectAttributeSchema   — base (direct) + modifiers
//   ├── PDAttributeSchema       — pd investment + modifiers
//   └── HybridAttributeSchema   — base (direct) + pd + modifiers
// ---------------------------------------------------------------------------

// Base — shared modifier arrays. Never used directly in the character schema.
const AttributeSchema = z.object({
  /** Permanent modifiers. Count toward requirements. */
  modificadores_base: z.array(AttributeModifierSchema),
  /** Temporary modifiers. Do not count toward requirements. */
  modificadores_temporales: z.array(AttributeModifierSchema),
});

// Direct attribute — base value assigned explicitly by the user.
// Used for: primary characteristics, apariencia, tamaño, presencia,
//           resistencias, turno.
export const DirectAttributeSchema = AttributeSchema.extend({
  /** Directly assigned base value. Must be non-negative. */
  base: z.number().int().nonnegative(),
});

export type DirectAttribute = z.infer<typeof DirectAttributeSchema>;

// PD-based attribute — base computed at runtime from pd investment.
export const PDAttributeSchema = AttributeSchema.extend({
  /** PD investment for this skill. Cost defined in the category costs catalog. */
  pd: z.number().int().nonnegative(),
});

export type PDAttribute = z.infer<typeof PDAttributeSchema>;

// Hybrid attribute — fixed base value plus PD investment.
export const HybridAttributeSchema = AttributeSchema.extend({
  /** Directly assigned base value. Must be non-negative. */
  base: z.number().int().nonnegative(),
  /** PD investment for this skill. Cost defined in the category costs catalog. */
  pd: z.number().int().nonnegative(),
});

export type HybridAttribute = z.infer<typeof HybridAttributeSchema>;
