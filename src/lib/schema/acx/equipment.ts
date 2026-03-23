import { z } from "zod";
import {
  TipoTAEnum, TamañoArmaEnum,
} from "../common/enums";
import {
  AtributoCalculadoSchema, OptionalBool, Integer,
} from "../common/basic_types";
import { schemaFromEnum } from "../common/utils";


// ---------------------------------------------------------------------------
// Calidad Schema
// ---------------------------------------------------------------------------
export const CalidadSchema = Integer.multipleOf(5);

// ---------------------------------------------------------------------------
// TA performance and modifiers
// ---------------------------------------------------------------------------
const rendimientoTASchema = schemaFromEnum(TipoTAEnum, AtributoCalculadoSchema).partial();

// ---------------------------------------------------------------------------
// Weapon performance
// ---------------------------------------------------------------------------
const rendimientoArmaSchema = z.object({
  turno:                AtributoCalculadoSchema.optional(),
  habilidad_de_ataque:  AtributoCalculadoSchema.optional(),
  habilidad_de_parada:  AtributoCalculadoSchema.optional(),
  habilidad_de_esquiva: AtributoCalculadoSchema.optional(),
  daño:                 rendimientoTASchema.optional(),
});

// ---------------------------------------------------------------------------
// Ammunition
// ---------------------------------------------------------------------------
const municionSchema = z.object({
  nombre:      z.string(),
  calidad:     CalidadSchema.optional(),
  tamaño:      TamañoArmaEnum.optional(),
  rendimiento: rendimientoArmaSchema.optional(),
});

// ---------------------------------------------------------------------------
// Weapon
// ---------------------------------------------------------------------------
const definicionArmaBaseSchema = z.object({
  /** Weapon name. Validated against weapon catalog at runtime. */
  nombre:          z.string(),
  calidad:         CalidadSchema.optional(),
  tamaño:          TamañoArmaEnum.optional(),
  a_dos_manos:     OptionalBool,
  /** Whether this is the character's dominant hand weapon. */
  mano_no_habil:   OptionalBool,
  /** Performance granted by this weapon. */
  rendimiento:     rendimientoArmaSchema,
  municion:        municionSchema.optional(),
});

export const ArmaSchema = z.object({
  ...definicionArmaBaseSchema.shape,
  /** Off-hand weapons in combined/dual wielding. Max one level deep. */
  armas_combinadas: z.array(definicionArmaBaseSchema).optional(),
});
export type Arma = z.infer<typeof ArmaSchema>;

// ---------------------------------------------------------------------------
// Armor
// ---------------------------------------------------------------------------
const armaduraBaseSchema = z.object({
  /** Armor name. Validated against armor catalog at runtime. */
  nombre:    z.string(),
  calidad:   CalidadSchema.optional(),
  encantada: OptionalBool,
  TA:        rendimientoTASchema,
});

export const ArmaduraSchema = z.object({
  capas:    z.array(armaduraBaseSchema).optional(),
  TA_final: rendimientoTASchema,
});
export type Armadura = z.infer<typeof ArmaduraSchema>;

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
const inventarioSchema = z.object({
  nombre:      z.string(),
  descripcion: z.string().optional(),
  peso:        z.number().optional(),
});

// ---------------------------------------------------------------------------
// Equipment section
// ---------------------------------------------------------------------------
export const EquipoSchema = z.object({
  armas:      z.array(ArmaSchema).optional(),
  armadura:   ArmaduraSchema.optional(),
  inventario: z.array(inventarioSchema).optional(),
});
export type Equipo = z.infer<typeof EquipoSchema>;
