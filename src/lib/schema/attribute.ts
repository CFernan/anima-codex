import { z } from "zod";
import { CaracteristicaEnum } from "./enums";

// ---------------------------------------------------------------------------
// Attribute modifier
// Field names are in Spanish — they appear verbatim in .acx save files.
// ---------------------------------------------------------------------------

export const AttributeModifierSchema = z.object({
  /** Numeric modifier value. May be negative. */
  valor: z.number(),
  /** Origin of the modifier (e.g. "Raza", "Bono de nivel Guerrero"). */
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
//   AttributeSchema                         — shared modifier arrays (never standalone)
//   ├── DirectAttributeSchema               — base (direct) + modifiers
//   |   └── DirectCharacteristicSkillSchema — base (direct) + characteristic + modifiers
//   └── PDAttributeSchema                   — pd investment + modifiers
//       ├── HybridAttributeSchema           — base (direct) + pd + modifiers
//       └── PDCharacteristicSkillSchema     — pd + characteristic + modifiers
// ---------------------------------------------------------------------------

// Base — shared modifier arrays. Never used directly in the character schema.
export const AttributeSchema = z.object({
  /** Permanent modifiers. Count toward requirements. */
  modificadores_base: z.array(AttributeModifierSchema),
  /** Temporary modifiers. Do not count toward requirements. */
  modificadores_temporales: z.array(AttributeModifierSchema),
});

export type Attribute = z.infer<typeof AttributeSchema>;

// Direct attribute — base value assigned explicitly by the user.
// Used for: primary characteristics, apariencia, tamaño, presencia,
//           resistencias, turno.
export const DirectAttributeSchema = AttributeSchema.extend({
  /** Directly assigned base value. Must be non-negative. */
  base: z.number().int().nonnegative(),
});

export type DirectAttribute = z.infer<typeof DirectAttributeSchema>;

// Characteristic skill — Direct-based skill tied to a primary characteristic.
// The characteristic bonus is computed at runtime via the engine.
export const DirectCharacteristicSkillSchema = DirectAttributeSchema.extend({
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CaracteristicaEnum,
});

export type DirectCharacteristicSkill = z.infer<typeof DirectCharacteristicSkillSchema>;

// PD-based attribute — base computed at runtime from pd investment.
export const PDAttributeSchema = AttributeSchema.extend({
  /** PD investment for this skill. Cost defined in the category costs catalog. */
  pd: z.number().int().nonnegative(),
});

export type PDAttribute = z.infer<typeof PDAttributeSchema>;

// Hybrid attribute — fixed base value plus PD investment.
// Used exclusively for puntos_de_vida:
//   base → derived from CON
//   pd   → additional HP bought with PD, cost defined in category costs catalog
export const HybridAttributeSchema = PDAttributeSchema.extend({
  /** Fixed base value (e.g. derived from CON). Must be non-negative. */
  base: z.number().int().nonnegative(),
});

export type HybridAttribute = z.infer<typeof HybridAttributeSchema>;

// Characteristic skill — PD-based skill tied to a primary characteristic.
// The characteristic bonus is computed at runtime via the engine.
export const PDCharacteristicSkillSchema = PDAttributeSchema.extend({
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CaracteristicaEnum,
});

export type PDCharacteristicSkill = z.infer<typeof PDCharacteristicSkillSchema>;
