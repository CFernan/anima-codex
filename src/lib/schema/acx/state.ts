import { z } from "zod";
import { schemaFromEnum } from "../common/utils";
import {
  KiCaracteristicaEnum, GradoHechizoEnum, FamaEnum,
} from "../common/enums";
import {
  AtributoCalculadoSchema,
  AtributoDirectoSchema,
  Integer,
  NonNegativeInt,
  PositiveInt,
} from "../common/basic_types";


// ---------------------------------------------------------------------------
// Character experience
// ---------------------------------------------------------------------------
export const ExperienciaSchema = z.object({
  actual:            NonNegativeInt,
  __siguiente_nivel: NonNegativeInt.optional(),
});

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
  z.object({
    total: NonNegativeInt
  }).strict(),
  schemaFromEnum(KiCaracteristicaEnum, NonNegativeInt).strict(),
]);

// Technique/ability maintenance cost — per ki characteristic
const costeMantenimientoSchema = schemaFromEnum(
  KiCaracteristicaEnum, AtributoCalculadoSchema,
).partial();

const estadoKiSchema = z.object({
  /** Current ki points available, by characteristic and total. */
  puntos_de_ki: puntosDeKiSchema,
  /** Currently maintained techniques and abilities. */
  tecnicas_y_habilidades_mantenidas: z.array(z.object({
    nombre: z.string(),
    /** Maintenance cost modifiers (base from catalog). */
    coste:  costeMantenimientoSchema.optional(),
  })).optional(),
});

// ---------------------------------------------------------------------------
// Weight state
// ---------------------------------------------------------------------------
const indiceDePesoSchema = z.object({
  __peso_natural: z.number().optional(),
  __peso_maximo:  z.number().optional(),
  __peso_cargado: z.number().optional(),
});

// ---------------------------------------------------------------------------
// Fame state
// ---------------------------------------------------------------------------
const famaSchema = z.object({
  ...schemaFromEnum(FamaEnum, NonNegativeInt).partial(),
  __total: NonNegativeInt.optional(),
});

// ---------------------------------------------------------------------------
// Supernatural state
// ---------------------------------------------------------------------------
const estadoSobrenaturalSchema = z.object({
  /** Current zeon pool. */
  zeon:           NonNegativeInt,
  /** Currently accumulated zeon. */
  zeon_acumulado: NonNegativeInt.optional(),
  /** Currently maintained spells. */
  hechizos_mantenidos: z.array(z.object({
    nombre: z.string(),
    grado:  GradoHechizoEnum,
    /** Maintenance cost modifiers (base from catalog). */
    coste:  AtributoCalculadoSchema.optional(),
  })).optional(),
  /** Bound creatures and their binding cost. */
  criaturas_atadas: z.array(z.object({
    nombre: z.string(),
    coste:  AtributoDirectoSchema.optional(),
  })).optional(),
});

// ---------------------------------------------------------------------------
// Mental state
// ---------------------------------------------------------------------------
const estadoMentalismoSchema = z.object({
  CVs_libres: z.object({
    gastados:              NonNegativeInt,
    invertidos_en_innatos: NonNegativeInt.optional(),
  }),
  turnos_concentrados: PositiveInt.optional(),
  poderes_mantenidos:  z.array(z.object({
    nombre:    z.string(),
    potencial: AtributoCalculadoSchema,
  })).optional(),
});

// ---------------------------------------------------------------------------
// Estado root
// ---------------------------------------------------------------------------
export const EstadoSchema = z.object({
  /** Character Experience */
  experiencia: ExperienciaSchema.optional(),

  /** Current hit points (may be negative). */
  pv:        Integer,
  /** Current fatigue level. */
  cansancio: NonNegativeInt,

  /** Carried weight */
  indice_de_peso: indiceDePesoSchema.optional(),

  /** Global modifiers affecting all actions or physical actions. */
  modificadores_globales: z.object({
    a_toda_accion: AtributoCalculadoSchema.optional(),
    fisicos:       AtributoCalculadoSchema.optional(),
  }).optional(),

  /** Ki state (characters who developed ki only). */
  ki:           estadoKiSchema.optional(),
  /** Supernatural state (mystic characters only). */
  sobrenatural: estadoSobrenaturalSchema.optional(),
  /** Mentalism state (psychic characters only). */
  mentalismo:   estadoMentalismoSchema.optional(),

  /** Fate points. */
  puntos_de_destino: z.object({
    totales: NonNegativeInt,
    usados:  NonNegativeInt,
  }).optional(),

  /** Fame/reputation by group. */
  fama: famaSchema.optional(),

  /** Mental health. */
  salud_mental: NonNegativeInt.optional(),
  trastornos:   z.array(z.string()).optional(),
});
