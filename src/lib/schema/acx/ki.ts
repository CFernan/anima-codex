import { z } from "zod";
import { schemaFromEnum } from "../common/utils";
import { KiCaracteristicaEnum, MantenimientoTecnicaEnum, NivelTecnicaSchema } from "../common/enums";
import { Integer, NombreConOpcionesSchema, NonNegativeInt, PositiveInt } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Technique effect cost — per ki characteristic
// ---------------------------------------------------------------------------
const costeEfectoTecnicaSchema = z.object({
  activacion:        PositiveInt,
  mantenimiento:     PositiveInt.optional(),
  alteracion_por_cm: Integer.optional(),
});

const efectoCosteSchema = schemaFromEnum(
  KiCaracteristicaEnum, costeEfectoTecnicaSchema,
).partial();

// ---------------------------------------------------------------------------
// Technique effect
// ---------------------------------------------------------------------------
const efectoSchema = z.object({
  /** Effect name. Validated against ki effects catalog at runtime. */
  nombre: z.string(),
  /** Effect options. Validated against catalog at runtime. */
  opciones: z.array(z.string()),
  mantenimiento: MantenimientoTecnicaEnum.optional(),
  /** Ki cost per characteristic. At least one characteristic must be present. */
  coste: efectoCosteSchema,
});

// ---------------------------------------------------------------------------
// Technique
// Custom techniques may have enum|string for nombre and arbol.
// ---------------------------------------------------------------------------
const tecnicaSchema = z.object({
  /** Technique name — catalog enum or custom string. */
  nombre:      z.string(),
  descripcion: z.string().optional(),
  nivel:       NivelTecnicaSchema.optional(),
  combinable:  z.boolean().optional(),
  efectos:     z.array(efectoSchema),
  desventajas: z.array(NombreConOpcionesSchema).optional(),
});

// ---------------------------------------------------------------------------
// Technique tree
// ---------------------------------------------------------------------------
const arbolTecnicasSchema = z.object({
  /** Tree name — catalog enum or custom string. */
  arbol: z.string(),
  /** Array of techniques. */
  tecnicas: z.array(tecnicaSchema),
});

// ---------------------------------------------------------------------------
// Ki invocation
// ---------------------------------------------------------------------------
const invocacionPorKiSchema = z.object({
  /** Array of seal names. */
  sellos_de_invocacion: z.array(z.string()),
  /** Pacts with creatures using ki seals. */
  pactos: z.array(z.object({
    criatura: z.string(),
    /** Map of seal type → quantity used. */
    sellos:   z.record(z.string(), NonNegativeInt),
  })),
});

// ---------------------------------------------------------------------------
// Ki section
// ---------------------------------------------------------------------------
export const KiSchema = z.object({
  /** Free ki abilities learned. */
  habilidades_del_ki:      z.array(NombreConOpcionesSchema).optional(),
  /** Nemesis abilities learned. */
  habilidades_del_nemesis: z.array(NombreConOpcionesSchema).optional(),
  /** Technique domain trees. */
  tecnicas_del_dominio:    z.array(arbolTecnicasSchema).optional(),
  /** Ki limits unlocked. */
  limites:                 z.array(z.string()).optional(),
  /** Dragon seals acquired. */
  sellos_del_dragon:       z.array(z.string()).optional(),
  /** Ki invocation subsystem. */
  invocacion_por_ki:       invocacionPorKiSchema.optional(),
});
export type Ki = z.infer<typeof KiSchema>;
