import { z } from "zod";


// ---------------------------------------------------------------------------
// Shorthand validators (exported for reuse)
// ---------------------------------------------------------------------------
export const integer        = z.number().int();
export const nonNegativeInt = z.number().int().nonnegative();
export const positiveInt    = z.number().int().positive();
export const pd             = nonNegativeInt; // alias — appears as standalone field name in schemas
export const positiveFrac   = z.number().min(0).max(1)

// ---------------------------------------------------------------------------
// Attribute modifier
// Field names in Spanish — appear verbatim in .acx save files.
// ---------------------------------------------------------------------------
export const ModificadorAttributoSchema = z.object({
  /** Origin of the modifier (e.g. "Hechizo", "Equipo"). */
  fuente:      z.string(),
  /** Numeric modifier value. May be negative. */
  valor:       integer,
  /** Optional free-text description. */
  descripcion: z.string().optional(),
}).strict();
export type ModificadorAtributo = z.infer<typeof ModificadorAttributoSchema>;

const modifierArrays = z.object({
  modificadores_base:       z.array(ModificadorAttributoSchema).optional(),
  modificadores_temporales: z.array(ModificadorAttributoSchema).optional(),
});

// ---------------------------------------------------------------------------
// Attribute types
//
//   AtributoDirectoSchema  — base (user-assigned) + modifiers
//   AtributoPDSchema       — pd investment + modifiers
//   AtributoDerivadoSchema — modifiers only (base computed by engine)
// ---------------------------------------------------------------------------

/** Directly assigned base value. Used for: primary characteristics, apariencia. */
export const AtributoDirectoSchema = z.object({
  base: positiveInt,
  ...modifierArrays.shape,
});
export type AtributoDirecto = z.infer<typeof AtributoDirectoSchema>;

/** PD-invested attribute. Used for: combat skills, secondary skills, HP, etc. */
export const AtributoPDSchema = z.object({
  pd: pd,
  ...modifierArrays.shape,
});
export type AtributoPD = z.infer<typeof AtributoPDSchema>;

/** Derived attribute — only modifiers, base computed by engine. */
export const AtributoDerivadoSchema = z.object({
  ...modifierArrays.shape,
});
export type AtributoDerivado = z.infer<typeof AtributoDerivadoSchema>;

/** Flexible attribute — an attribute that can be any type of the above. */
export const AtributoFlexibleSchema = z.union([
  AtributoDirectoSchema.strict(),
  AtributoPDSchema.strict(),
  AtributoDerivadoSchema.strict(),
]);
export type AtributoFlexible = z.infer<typeof AtributoFlexibleSchema>;

/** Enum and map to track the attribute type */
export type AtributoSchema =
  | typeof AtributoDirectoSchema
  | typeof AtributoPDSchema
  | typeof AtributoDerivadoSchema
  | typeof AtributoFlexibleSchema;

export const TipoAtributoSchema = z.enum(["directo", "pd", "derivado", "flexible"]);
export type TipoAtributo = z.infer<typeof TipoAtributoSchema>;

export const AttributeTypeSchemaMap = {
  directo:  AtributoDirectoSchema,
  pd:       AtributoPDSchema,
  derivado: AtributoDerivadoSchema,
  flexible: AtributoFlexibleSchema
} satisfies Record<TipoAtributo, AtributoSchema>;

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

/** TablaPDSchema — Used as a PD generic table unknown structure */
export const TablaPDSchema = z.record(z.string(), PdOpcionesSchema);
