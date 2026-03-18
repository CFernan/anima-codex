import { z } from "zod";
import { schemaFromEnum } from "../common/utils";
import {
  KiCaracteristicaEnum, GradoHechizoEnum, FamaEnum,
} from "../common/enums";
import {
  AtributoDerivadoSchema,
  AtributoDirectoSchema,
  integer,
  nonNegativeInt,
} from "../common/basic_types";


// ---------------------------------------------------------------------------
// Ki state
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Ki points state — mutually exclusive representations:
//   · Aggregated:  { total } — single pool, characteristics not tracked
//   · Distributed: { agi, con, des, fue, pod, vol } — per-characteristic pools
// Both cannot coexist in the same object (.strict() enforces exclusivity).
// ---------------------------------------------------------------------------
const puntosDeKiSchema = z.union([
  z.object({ total: nonNegativeInt }).strict(),
  schemaFromEnum(KiCaracteristicaEnum, nonNegativeInt).strict(),
]);

// Technique/ability maintenance cost — per ki characteristic
const costeMantenimientoSchema = schemaFromEnum(
  KiCaracteristicaEnum, AtributoDerivadoSchema,
).partial();

const estadoKiSchema = z.object({
  /** Current ki points available, by characteristic and total. */
  puntos_de_ki: puntosDeKiSchema,
  /** Currently maintained techniques and abilities. */
  tecnicas_y_habilidades_mantenidas: z.array(z.object({
    nombre: z.string(),
    grado:  GradoHechizoEnum,
    /** Maintenance cost modifiers (base from catalog). */
    coste:  costeMantenimientoSchema.optional(),
  })).optional(),
});

// ---------------------------------------------------------------------------
// Supernatural state
// ---------------------------------------------------------------------------
const hechizoCostSchema = AtributoDerivadoSchema; // modifiers only — base from catalog

const estadoSobrenaturalSchema = z.object({
  /** Current zeon pool. */
  zeon:          nonNegativeInt,
  /** Currently accumulated zeon. */
  zeon_acumulado: nonNegativeInt.optional(),
  /** Currently maintained spells. */
  hechizos_mantenidos: z.array(z.object({
    nombre: z.string(),
    grado:  GradoHechizoEnum,
    /** Maintenance cost modifiers (base from catalog). */
    coste:  hechizoCostSchema,
  })).optional(),
  /** Bound creatures and their binding cost. */
  criaturas_atadas: z.array(z.object({
    nombre: z.string(),
    coste:  AtributoDirectoSchema,
  })).optional(),
});

// ---------------------------------------------------------------------------
// Mental state
// ---------------------------------------------------------------------------
const estadoMentalismoSchema = z.object({
  CVs_libres: z.object({
    gastados:              nonNegativeInt,
    invertidos_en_innatos: nonNegativeInt.optional(),
  }),
  turnos_concentrados: nonNegativeInt.optional(),
  poderes_mantenidos: z.array(z.object({
    nombre:    z.string(),
    potencial: z.string(),
  })).optional(),
});

// ---------------------------------------------------------------------------
// Estado root
// ---------------------------------------------------------------------------
export const EstadoSchema = z.object({
  /** Current hit points (may be negative). */
  pv:        integer,
  /** Current fatigue level. */
  cansancio: nonNegativeInt,

  /** Global modifiers affecting all actions or physical actions. */
  modificadores_globales: z.object({
    a_toda_accion: AtributoDerivadoSchema,
    fisicos:       AtributoDerivadoSchema,
  }),

  /** Ki state — all characters have ki points. */
  ki: estadoKiSchema,

  /** Supernatural state (mystic characters only). */
  sobrenatural: estadoSobrenaturalSchema.optional(),

  /** Mentalism state (psychic characters only). */
  mentalismo: estadoMentalismoSchema.optional(),

  /** Fate points. */
  puntos_de_destino: z.object({
    totales: nonNegativeInt,
    usados:  nonNegativeInt,
  }).optional(),

  /** Mental health points. */
  salud_mental: nonNegativeInt.optional(),

  /** Fame/reputation by group. */
  fama: schemaFromEnum(FamaEnum, nonNegativeInt).partial().optional(),
});
export type Estado = z.infer<typeof EstadoSchema>;
