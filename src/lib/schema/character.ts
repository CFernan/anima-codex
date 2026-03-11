import { z } from "zod";
import { DerivedAttributeSchema} from "./attribute_type";
import { CategoryInvestmentSchema } from "./category";
import { PhysicalCapacitiesInvestmentSchema,
         CharacteristicInvestmentSchema,
         SecondaryCharacteristicInvestmentSchema,
         ResistencesInvestmentSchema } from "./characteristic";
import { AdvantagesAndDisadvantagesSchema } from "./advantages_and_disadvantages";

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

  // --- Race ---
  raza:    z.string(),

  // --- Primary characteristics ---
  caracteristicas_primarias: CharacteristicInvestmentSchema,

  // --- Physical capacities ---
  capacidades_fisicas: PhysicalCapacitiesInvestmentSchema,

  // --- Secondary characteristics ---
  caracteristicas_secundarias: SecondaryCharacteristicInvestmentSchema,

  // --- Turn ---
  turno_base: DerivedAttributeSchema,

  // --- Presence and resistances ---
  resistencias: ResistencesInvestmentSchema,

  // --- Creation points ---
  ventajas_y_desventajas: AdvantagesAndDisadvantagesSchema,

  // --- Categories (multi-class ready, min 1 required) ---
  // This includes all PDs investment (primary and secondary skills and HPs)
  categorias: z.array(CategoryInvestmentSchema).min(1),

  // --- Free-text fields ---
  trasfondo: z.string().optional(),
  notas:     z.string().optional(),
});

export type Character = z.infer<typeof CharacterSchema>;
