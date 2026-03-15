import { z } from "zod";


// ---------------------------------------------------------------------------
// Shorthand validators (exported for reuse)
// ---------------------------------------------------------------------------
export const integer        = z.number().int();
export const nonNegativeInt = z.number().int().nonnegative();
export const positiveInt    = z.number().int().positive();
export const pd             = nonNegativeInt; // alias — appears as standalone field name in schemas

// ---------------------------------------------------------------------------
// Attribute modifier
// Field names in Spanish — appear verbatim in .acx save files.
// ---------------------------------------------------------------------------
export const AttributeModifierSchema = z.object({
  /** Origin of the modifier (e.g. "Hechizo", "Equipo"). */
  fuente:      z.string(),
  /** Numeric modifier value. May be negative. */
  valor:       integer,
  /** Optional free-text description. */
  descripcion: z.string().optional(),
}).strict();
export type AttributeModifier = z.infer<typeof AttributeModifierSchema>;

const modifierArrays = z.object({
  modificadores_base:       z.array(AttributeModifierSchema).optional(),
  modificadores_temporales: z.array(AttributeModifierSchema).optional(),
});

// ---------------------------------------------------------------------------
// Attribute types
//
//   DirectAttributeSchema  — base (user-assigned) + modifiers
//   PDAttributeSchema      — pd investment + modifiers
//   DerivedAttributeSchema — modifiers only (base computed by engine)
// ---------------------------------------------------------------------------

/** Directly assigned base value. Used for: primary characteristics, apariencia. */
export const DirectAttributeSchema = z.object({
  base: positiveInt,
  ...modifierArrays.shape,
});
export type DirectAttribute = z.infer<typeof DirectAttributeSchema>;

/** PD-invested attribute. Used for: combat skills, secondary skills, HP, etc. */
export const PDAttributeSchema = z.object({
  pd: pd,
  ...modifierArrays.shape,
});
export type PDAttribute = z.infer<typeof PDAttributeSchema>;

/** Derived attribute — only modifiers, base computed by engine. */
export const DerivedAttributeSchema = z.object({
  ...modifierArrays.shape,
});
export type DerivedAttribute = z.infer<typeof DerivedAttributeSchema>;

/** Flexible attribute — an attribute that can be any type of the above. */
export const FlexibleAttributeSchema = z.union([
  DirectAttributeSchema.strict(),
  PDAttributeSchema.strict(),
  DerivedAttributeSchema.strict(),
]);
export type FlexibleAttribute = z.infer<typeof FlexibleAttributeSchema>;

// ---------------------------------------------------------------------------

/** NombreOpcionesSchema — Used as a named generic unknown structure */
export const NombreOpcionesSchema = z.object({
  nombre:   z.string(),
  opciones: z.unknown().optional(),
});
export type NombreOpciones = z.infer<typeof NombreOpcionesSchema>;

/** PdOpcionesSchema — Used as a PD generic unknown structure */
export const PdOpcionesSchema = z.object({
  pd:       pd,
  opciones: z.unknown().optional(),
});
export type PdOpciones = z.infer<typeof PdOpcionesSchema>;

/** TablaEntrySchema — Used as a PD table generic unknown structure */
export const TablaEntrySchema = z.record(z.string(), PdOpcionesSchema);
