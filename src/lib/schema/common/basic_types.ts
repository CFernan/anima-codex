import { z } from "zod";
import { uniqueValues } from "./utils";


// ---------------------------------------------------------------------------
// Shorthand validators (exported for reuse)
// ---------------------------------------------------------------------------
export const Integer          = z.number().int();
export const NonNegativeInt   = z.number().int().nonnegative();
export const PositiveInt      = z.number().int().positive();
export const PD               = NonNegativeInt; // alias — appears as standalone field name in schemas
export const PositiveFraction = z.number().min(0).max(1)
export const StringOrNumber   = z.union([z.string(), z.number()])

// ---------------------------------------------------------------------------
// Attribute modifier
// Field names in Spanish — appear verbatim in .acx save files.
// ---------------------------------------------------------------------------
export const ModificadorAtributoSchema = z.object({
  /** Origin of the modifier (e.g. "Hechizo", "Equipo"). */
  fuente:       z.string(),
  /** Numeric modifier value. May be negative. */
  valor:        Integer,
  /** Optional free-text description. */
  descripcion:  z.string().optional(),
  /** Used as write-only by engine */
  __automatico: z.boolean().optional(),
});
export type ModificadorAtributoInput = z.infer<typeof ModificadorAtributoSchema>;
export type ModificadorAtributo = ModificadorAtributoInput & {
  readonly _key: string;  /** Identifier key for each modifier */
};

//** Lambda to create unique key of automatico + fuente + descripccion */
export const modifierKey = (m: ModificadorAtributoInput): string =>
  `${m.__automatico ? "auto" : ""}|${m.fuente}|${m.descripcion ?? ""}`;

export const makeModifier = (m: ModificadorAtributoInput): ModificadorAtributo => ({
  ...m,
  _key: modifierKey(m),
});

const modificadoresSchema = z.object({
  modificadores_base:       z.array(ModificadorAtributoSchema)
    .refine(
        uniqueValues(modifierKey),
        { message: "fuente + descripcion must be unique within modificadores_base" }
    ).optional(),
  modificadores_temporales: z.array(ModificadorAtributoSchema)
    .refine(
        uniqueValues(modifierKey),
        { message: "fuente + descripcion must be unique within modificadores_temporales" }
    ).optional(),
});

// ---------------------------------------------------------------------------
// Attribute result
// This contains the result computed by the engine
// ---------------------------------------------------------------------------
export const ResultadoAtributoSchema = z.object({
  __base_calculada: Integer.optional(), // if it is equal than final_base no need to store
  __final_base:     Integer.optional(),
  __final_temporal: Integer.optional(), // if it is equal than final_base no need to store
})
export type ResultadoAtributo = z.infer<typeof ResultadoAtributoSchema>;

// ---------------------------------------------------------------------------
// Attribute types
//
//   AtributoDirectoSchema  — base (user-assigned) + modifiers
//   AtributoPDSchema       — pd investment + modifiers
//   AtributoDerivadoSchema — modifiers only (base computed by engine)
// ---------------------------------------------------------------------------

/** Directly assigned base value. Used for: primary characteristics, apariencia. */
export const AtributoDirectoSchema = z.object({
  base: PositiveInt,
  ...modificadoresSchema.shape,
  ...ResultadoAtributoSchema.shape,
});
export type AtributoDirecto = z.infer<typeof AtributoDirectoSchema>;

/** PD-invested attribute. Used for: combat skills, secondary skills, HP, etc. */
export const AtributoPDSchema = z.object({
  pd: PD,
  ...modificadoresSchema.shape,
  ...ResultadoAtributoSchema.shape,
});
export type AtributoPD = z.infer<typeof AtributoPDSchema>;

/** Computed attribute — only modifiers, base computed by engine. */
export const AtributoCalculadoSchema = z.object({
  ...modificadoresSchema.shape,
  ...ResultadoAtributoSchema.shape,
});
export type AtributoCalculado = z.infer<typeof AtributoCalculadoSchema>;

/** Flexible attribute — an attribute that can be any type of the above. */
export const AtributoFlexibleSchema = z.union([
  AtributoDirectoSchema.strict(),
  AtributoPDSchema.strict(),
  AtributoCalculadoSchema.strict(),
]);
export type AtributoFlexible = z.infer<typeof AtributoFlexibleSchema>;

/** Enum and map to track the attribute type */
export type AtributoSchema =
  | typeof AtributoDirectoSchema
  | typeof AtributoPDSchema
  | typeof AtributoCalculadoSchema
  | typeof AtributoFlexibleSchema;

export const TipoAtributoSchema = z.enum(["directo", "pd", "derivado", "flexible"]);
export type TipoAtributo = z.infer<typeof TipoAtributoSchema>;

export const AttributeTypeSchemaMap = {
  directo:  AtributoDirectoSchema,
  pd:       AtributoPDSchema,
  derivado: AtributoCalculadoSchema,
  flexible: AtributoFlexibleSchema
} satisfies Record<TipoAtributo, AtributoSchema>;

// ---------------------------------------------------------------------------

/** NombreOpcionesSchema — Used as a named generic unknown structure */
export const NombreConOpcionesSchema = z.object({
  nombre:   z.string(),
  opciones: z.unknown().optional(),
});
export type NombreOpciones = z.infer<typeof NombreConOpcionesSchema>;

/** PdOpcionesSchema — Used as a PD generic unknown structure */
export const PdConOpcionesSchema = z.object({
  pd: PD,
  ...NombreConOpcionesSchema.shape,
});
export type PdOpciones = z.infer<typeof PdConOpcionesSchema>;
