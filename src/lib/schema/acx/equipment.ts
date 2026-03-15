import { z } from "zod";
import {
  TipoTAEnum, TamañoArmaEnum, ManosEnum, ModificadorArmaEnum,
} from "../common/enums";
import {
  DerivedAttributeSchema, integer, nonNegativeInt,
} from "../common/basic_types";


// Calidad Schema
export const CalidadSchema = integer.multipleOf(5);

// ---------------------------------------------------------------------------
// Armor modifier — one entry per damage type
// ---------------------------------------------------------------------------
const modificadorArmaduraSchema = z.object({
  /** Damage type this modifier applies to. */
  TA: TipoTAEnum,
  ...DerivedAttributeSchema.shape
});

// ---------------------------------------------------------------------------
// Weapon modifier — one entry per affected skill
// ---------------------------------------------------------------------------
const modificadorArmaSchema = z.object({
  /** Skill this modifier affects. */
  nombre: ModificadorArmaEnum,
  ...DerivedAttributeSchema.shape
});

// ---------------------------------------------------------------------------
// Ammunition
// ---------------------------------------------------------------------------
const municionSchema = z.object({
  nombre:            z.string(),
  calidad:           CalidadSchema.optional(),
  tamaño:            TamañoArmaEnum.optional(),
  modificadores_arma: z.array(modificadorArmaSchema).optional(),
});

// ---------------------------------------------------------------------------
// Armor
// ---------------------------------------------------------------------------
export const ArmaduraSchema = z.object({
  /** Armor name. Validated against armor catalog at runtime. */
  nombre:    z.string(),
  calidad:   CalidadSchema.optional(),
  encantada: z.boolean().optional(),
  /** Per-damage-type modifiers. Optional — armor may have no modifiers. */
  modificadores_armadura: z.array(modificadorArmaduraSchema).optional(),
});
export type Armadura = z.infer<typeof ArmaduraSchema>;

// ---------------------------------------------------------------------------
// Weapon
// ---------------------------------------------------------------------------
const armaBaseSchema = z.object({
  /** Weapon name. Validated against weapon catalog at runtime. */
  nombre:             z.string(),
  calidad:            CalidadSchema.optional(),
  tamaño:             TamañoArmaEnum.optional(),
  /** Per-skill modifiers granted by this weapon. */
  modificadores_arma: z.array(modificadorArmaSchema).optional(),
  municion:           municionSchema.optional(),
  manos:              ManosEnum.optional(),
  /** Whether this is the character's dominant hand weapon. */
  mano_habil:         z.boolean().optional(),
});

export const ArmaSchema = z.object({
  ...armaBaseSchema.shape,
  /** Off-hand weapons in combined/dual wielding. Max one level deep. */
  armas_combinadas: z.array(armaBaseSchema).optional(),
});
export type Arma = z.infer<typeof ArmaSchema>;

// ---------------------------------------------------------------------------
// Equipment section
// ---------------------------------------------------------------------------
export const EquipoSchema = z.object({
  armaduras: z.array(ArmaduraSchema).optional(),
  armas:     z.array(ArmaSchema).optional(),
});
export type Equipo = z.infer<typeof EquipoSchema>;
