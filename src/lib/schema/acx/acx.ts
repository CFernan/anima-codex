import { z } from "zod";
import { NombreConOpcionesSchema } from "../common/basic_types";
import { CaracteristicasPrimariasSchema } from "./characteristic";
import { CaracteristicasSecundariasSchema } from "./characteristic";
import { CapacidadesFisicasSchema } from "./characteristic";
import { ResistenciasSchema } from "./characteristic";
import { PuntosDeCreacionSchema } from "./creation_points";
import { InversionPdsSchema } from "./category";
import { EquipoSchema } from "./equipment";
import { KiSchema } from "./ki";
import { MisticosSchema } from "./mystic";
import { EstadoSchema } from "./state";
import { DescripcionSchema, CaracteristicasDelSerSchema, AjustesDeNivelSchema, CorduraSchema, NotaSchema } from "./character_miscellany";
import { PsiquicosSchema } from "./psychic";
import { ElanSchema } from "./elan";
import { CatalogoLocalSchema } from "./local_catalog";
import { HabilidadesSecundariasSchema } from "./secondary_abilities";


// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
const metadataSchema = z.object({
  __version_schema:  z.string(),
  __marca_de_tiempo: z.iso.datetime(),
  jugador:           z.string(),
});

// ---------------------------------------------------------------------------
// Input — the character data proper
// ---------------------------------------------------------------------------
const basePersonajeSchema = z.object({
  nombre: z.string(),

  /** Race. opciones varies per race. */
  raza: NombreConOpcionesSchema,

  /** Optional descriptive fields. Predefined + user-defined extras. */
  descripcion: DescripcionSchema.optional(),

  /** Mandatory for all characters. */
  caracteristicas_del_ser:     CaracteristicasDelSerSchema,
  caracteristicas_primarias:   CaracteristicasPrimariasSchema,
  caracteristicas_secundarias: CaracteristicasSecundariasSchema,
  capacidades_fisicas:         CapacidadesFisicasSchema,
  resistencias:                ResistenciasSchema,
  puntos_de_creacion:          PuntosDeCreacionSchema,

  /** PD investments. */
  inversion_pds:               InversionPdsSchema.optional(),

  equipo:    EquipoSchema.optional(),
  ki:        KiSchema.optional(),
  misticos:  MisticosSchema.optional(),
  psiquicos: PsiquicosSchema.optional(),

  habilidades_secundarias: HabilidadesSecundariasSchema.optional(),

  elan: z.array(ElanSchema).optional(),

  ajustes_de_nivel: AjustesDeNivelSchema.optional(),

  cordura: CorduraSchema.optional(),

  /** Current session state. */
  estado: EstadoSchema,

  /** Languages known. Array of catalog enum values. */
  idiomas: z.array(z.string()).optional(),

  /**
   * Free-form notes grouped in an array to keep order of sections.
   * Each section may have several notes, for that there will be
   * duplicates of sections in the general array
   */
  notas: z.array(NotaSchema).optional(),
});

// ---------------------------------------------------------------------------
// Root character schema
// ---------------------------------------------------------------------------
export const AcxSchema = z.object({
  metadata:       metadataSchema,
  personaje:      basePersonajeSchema,
  catalogo_local: CatalogoLocalSchema,
});
