import { z } from "zod";
import { DirectAttributeSchema,
         DirectCharacteristicSkillSchema,
         HybridAttributeSchema,
         PDAttributeSchema } from "./attribute";
import { CombatSkillsSchema } from "./combat";
import { SecondarySkillsSchema } from "./secondary";

// ---------------------------------------------------------------------------
// Character category (class)
// Array allows future multi-class support without schema changes.
// Each category owns its PD investments for combat and secondary skills.
// ---------------------------------------------------------------------------

export const CharacterCategorySchema = z.object({
  /** Category name (e.g. "Guerrero", "Acróbata"). */
  nombre: z.string(),
  /** Character level within this category. Must be at least 1. */
  nivel: z.number().int().positive(),
  /** Primary combat skills with their PD investments. */
  combate: CombatSkillsSchema,
  /** Supernatural skills (reserved for future use). */
  sobrenaturales: z.record(z.string(), PDAttributeSchema).optional(),
  /** Psychic skills (reserved for future use). */
  psiquicas: z.record(z.string(), PDAttributeSchema).optional(),
  /** Secondary skills with their PD investments, grouped by type. */
  secundarias: SecondarySkillsSchema,
  /** Hit points (hybrid: fixed base from CON + PD investment). */
  puntos_de_vida: HybridAttributeSchema,
});

export type CharacterCategory = z.infer<typeof CharacterCategorySchema>;

// ---------------------------------------------------------------------------
// Creation points
// ---------------------------------------------------------------------------

const CreationPointsSchema = z.object({
  total:    z.number().int().nonnegative(),
  gastados: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Root character schema
// ---------------------------------------------------------------------------

export const CharacterSchema = z.object({
  // --- Schema metadata ---
  /** Incremented on breaking schema changes to enable migration logic. */
  schema_version: z.literal(1),

  // --- Identity ---
  nombre:  z.string(),
  jugador: z.string(),
  raza:    z.string(),

  // --- Primary characteristics ---
  agi: DirectAttributeSchema,
  con: DirectAttributeSchema,
  des: DirectAttributeSchema,
  fue: DirectAttributeSchema,
  int: DirectAttributeSchema,
  per: DirectAttributeSchema,
  pod: DirectAttributeSchema,
  vol: DirectAttributeSchema,

  // --- Secondary characteristics ---
  apariencia: DirectAttributeSchema,
  tamaño:     DirectAttributeSchema,

  // --- Fatigue ---
  turno: DirectAttributeSchema,

  // --- Presence and resistances ---
  presencia: DirectAttributeSchema,
  rf: DirectCharacteristicSkillSchema,
  re: DirectCharacteristicSkillSchema,
  rv: DirectCharacteristicSkillSchema,
  rm: DirectCharacteristicSkillSchema,
  rp: DirectCharacteristicSkillSchema,

  // --- Creation points ---
  puntos_creacion: CreationPointsSchema,

  // --- Categories (multi-class ready, min 1 required) ---
  // This includes all PDs investment
  categorias: z.array(CharacterCategorySchema).min(1),

  // --- Free-text fields ---
  trasfondo: z.string().optional(),
  notas:     z.string().optional(),
});

export type Character = z.infer<typeof CharacterSchema>;
