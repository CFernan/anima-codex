import { z } from "zod";

// ---------------------------------------------------------------------------
// Attribute modifier
// Field names are in Spanish — they appear verbatim in .acx save files.
// ---------------------------------------------------------------------------

export const AttributeModifierSchema = z.object({
  /** Numeric modifier value. May be negative. */
  valor: z.number(),
  /** Origin of the modifier (e.g. "Bono arma", "Bono elan"). */
  fuente: z.string(),
  /** Optional free-text description. */
  descriptor: z.string().optional(),
});

export type AttributeModifier = z.infer<typeof AttributeModifierSchema>;

// ---------------------------------------------------------------------------
// Attribute types
//
//   DirectAttributeSchema   — base + modifiers
//   PDAttributeSchema       — pd investment + modifiers
//   DerivedAttributeSchema  — only modifiers
// ---------------------------------------------------------------------------

// Direct attribute — base value assigned explicitly by the user.
// Used for: primary characteristics, apariencia.
export const DirectAttributeSchema = z.object({
  /** Directly assigned base value. Must be non-negative. */
  base: z.number().int().nonnegative(),
  /** Permanent modifiers. Count toward requirements. */
  modificadores_base: z.array(AttributeModifierSchema).default([]),
  /** Temporary modifiers. Do not count toward requirements. */
  modificadores_temporales: z.array(AttributeModifierSchema).default([]),
});

export type DirectAttribute = z.infer<typeof DirectAttributeSchema>;

// PD-based attribute — base computed at runtime from pd investment.
export const PDAttributeSchema = z.object({
  /** PD investment for this skill. Cost defined in the category costs catalog. */
  pd: z.number().int().nonnegative(),
  modificadores_base: z.array(AttributeModifierSchema).default([]),
  modificadores_temporales: z.array(AttributeModifierSchema).default([]),
});

export type PDAttribute = z.infer<typeof PDAttributeSchema>;

// DerivedAttributeSchema — have a derived base value and can only set modifiers.
// Used for: derived stats that can be only modified via modifiers, (e.g tamaño,
//           presencia, resistencias, turno)
export const DerivedAttributeSchema = z.object({
  modificadores_base: z.array(AttributeModifierSchema).default([]),
  modificadores_temporales: z.array(AttributeModifierSchema).default([]),
});

export type DerivedAttribute = z.infer<typeof DerivedAttributeSchema>;

// ---------------------------------------------------------------------------
// PDCostSchema
// ---------------------------------------------------------------------------
export const PDCostSchema = z.number().int().positive();
