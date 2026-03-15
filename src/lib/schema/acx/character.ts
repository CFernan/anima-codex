import { z } from "zod";
import { NombreOpcionesSchema } from "../common/basic_types";
import { CaracteristicasPrimariasSchema } from "./characteristic";
import { CaracteristicasSecundariasSchema } from "./characteristic";
import { CapacidadesFisicasSchema } from "./characteristic";
import { ResistenciasSchema } from "./characteristic";
import { DerivedAttributeSchema } from "../common/basic_types";
import { PuntosDeCreacionSchema } from "./creation_points";
import { CategoriaInversionSchema } from "./category";
import { EquipoSchema } from "./equipment";
import { KiSchema } from "./ki";
import { MisticosSchema } from "./mystic";
import { EstadoSchema } from "./state";
import { DescripcionSchema, CaracteristicasDelSerSchema, AjustesDeNivelSchema } from "./character_miscellany";
import { PsiquicosSchema } from "./psychic";
import { ElanSchema } from "./elan";
import { CatalogoLocalSchema } from "./local_catalog";


// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
const metadataSchema = z.object({
  version_schema:  z.string(),
  marca_de_tiempo: z.iso.datetime(),
  jugador:         z.string(),
});

// ---------------------------------------------------------------------------
// Input — the character data proper
// ---------------------------------------------------------------------------
const entradaSchema = z.object({
  nombre: z.string(),

  /** Race. opciones varies per race. */
  raza: NombreOpcionesSchema,

  /** Optional descriptive fields. Predefined + user-defined extras. */
  descripcion: DescripcionSchema.optional(),

  /** Mandatory for all characters. */
  caracteristicas_del_ser:     CaracteristicasDelSerSchema,
  caracteristicas_primarias:   CaracteristicasPrimariasSchema,
  caracteristicas_secundarias: CaracteristicasSecundariasSchema,
  capacidades_fisicas:         CapacidadesFisicasSchema,
  resistencias:                ResistenciasSchema,
  turno_base:                  DerivedAttributeSchema,
  puntos_de_creacion:          PuntosDeCreacionSchema,

  /** Category investments. At least one required. */
  categorias: z.array(CategoriaInversionSchema).min(1),

  equipo:    EquipoSchema.optional(),
  ki:        KiSchema.optional(),
  misticos:  MisticosSchema.optional(),
  psiquicos: PsiquicosSchema.optional(),
  elan:      z.array(ElanSchema).optional(),

  ajustes_de_nivel: AjustesDeNivelSchema.optional(),

  /** Current session state. */
  estado: EstadoSchema,

  /** Languages known. Array of catalog enum values. */
  idiomas: z.array(z.string()).optional(),

  /**
   * Free-form notes grouped by section name.
   * Each element has exactly one key (section name → content).
   * Exactly-one-key per element is not enforceable in Zod.
   */
  notas: z.array(z.record(z.string(), z.string())).optional(),
});

// ---------------------------------------------------------------------------
// Root character schema
// ---------------------------------------------------------------------------
export const CharacterSchema = z.object({
  metadata:       metadataSchema,
  entrada:        entradaSchema,
  catalogo_local: CatalogoLocalSchema,
});
export type Character = z.infer<typeof CharacterSchema>;
export type CharacterInput = z.input<typeof CharacterSchema>;
