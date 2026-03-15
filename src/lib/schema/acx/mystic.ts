import { z } from "zod";
import { integer, NombreOpcionesSchema, nonNegativeInt, positiveInt } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Via de magia entry
// ---------------------------------------------------------------------------
const viaDeMagiaSchema = z.object({
  /** Level of magic invested in this via. */
  invertido: nonNegativeInt,
  /** Sub-via selected, if any. */
  subvia: z.string().optional(),
  /** Free-access spells for this via. */
  conjuros_libre_acceso: z.array(z.object({
    nombre:             z.string(),
    nivel_libre_acceso: positiveInt,
  })).optional(),
});

// ---------------------------------------------------------------------------
// Niveles de magia
//
// Mixed object: fixed key `conjuros_seleccionados` + dynamic via keys.
// Modeled with z.object(...).catchall(viaSchema) — catchall applies to all
// keys not explicitly defined, i.e. the dynamic via keys.
// ---------------------------------------------------------------------------
const nivelesDeMagiaSchema = z.object({
  /**
   * Spells selected freely across vias (independent of via investment).
   * Array of spell enum values.
   */
  conjuros_seleccionados: z.array(z.string()).optional(),
}).catchall(viaDeMagiaSchema);

// ---------------------------------------------------------------------------
// Metamagia
// nombre + id uniquely identifies a node in the metamagia graph
// (multiple nodes may share the same name at different positions).
// ---------------------------------------------------------------------------
const metamagiaSchema = z.object({
  ...NombreOpcionesSchema.shape,
  id: integer,
});

// ---------------------------------------------------------------------------
// Místicos section
// All fields optional — a mystic character may have any combination.
// ---------------------------------------------------------------------------
export const MisticosSchema = z.object({
  /** Magic level investments per via + free selected spells. */
  niveles_de_magia: nivelesDeMagiaSchema.optional(),

  /** Magic theorem selected. */
  teorema_de_magia: NombreOpcionesSchema.optional(),

  /** Metamagic nodes acquired. nombre+id = unique node identifier. */
  metamagia: z.array(metamagiaSchema).optional(),

  /** Summoning specialty. */
  especialidad_convocatoria: z.string().optional(),

  /** Invocations learned. */
  invocaciones:  z.array(z.string()).optional(),
  /** Incarnations learned. */
  encarnaciones: z.array(z.string()).optional(),

  /**
   * Sheele — complex subsystem, placeholder until formally defined.
   * Stored as unknown for now; user may use string description.
   */
  sheele: z.unknown().optional(),

  /** Dragon pact details. */
  pacto_del_dragon: z.object({
    sacrificio:          z.string(),
    descripcion_dragon:  z.string(),
  }).optional(),
});
export type Misticos = z.infer<typeof MisticosSchema>;
