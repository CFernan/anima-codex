import { z } from "zod";
import { NombreConOpcionesSchema, NonNegativeInt, PdConOpcionesSchema, StringOrNumber, AtributoCalculadoSchema, Integer } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Descripcion — predefined fields + user-defined extras
// All fields optional. Catchall allows arbitrary string|number user extras.
// ---------------------------------------------------------------------------
export const DescripcionSchema = z.object({
  edad:         StringOrNumber.optional(),
  peso:         StringOrNumber.optional(),
  altura:       StringOrNumber.optional(),
  sexo:         z.string().optional(),
  region:       z.string().optional(),
  clase_social: z.string().optional(),
  trasfondo:    z.string().optional(),
  /**
   * Relative paths to image files associated with the character.
   * Images are stored as separate files alongside the .acx file.
   */
  imagenes:     z.array(z.string()).optional(),
  // any other custom additional field string or number or bool
}).catchall(z.union([z.string(), z.number(), z.boolean()]));
export type Descripcion = z.infer<typeof DescripcionSchema>;

// ---------------------------------------------------------------------------
// Caracteristicas del ser — mandatory for all characters
// ---------------------------------------------------------------------------
export const CaracteristicasDelSerSchema = z.object({
  /** Being type (e.g. human, creature). seleccion varies per type. */
  tipo:                NombreConOpcionesSchema,
  gnosis:              NonNegativeInt,
  __natura:            Integer.optional(),
  acumulacion_de_daño: z.boolean().optional(),
  creado_con_magia:    z.boolean().optional(),
  criatura_con_pcs:    z.boolean().optional(),
  /** Essential abilities. Each element has exactly one catalog name key. */
  habilidades_esenciales: z.array(PdConOpcionesSchema).optional(),
  /** Powers. Each element has exactly one catalog name key. */
  poderes:                z.array(PdConOpcionesSchema).optional(),
});
export type CaracteristicasDelSer = z.infer<typeof CaracteristicasDelSerSchema>;

// ---------------------------------------------------------------------------
// Level adjustments
// ---------------------------------------------------------------------------
export const AjustesDeNivelSchema = z.object({
  __ajuste_por_raza:    NonNegativeInt.optional(),
  ajuste_por_gnosis_pc: z.boolean().optional(),
  ajuste_por_legados:   z.boolean().optional(),
  artefacto_vinculado:  z.boolean().optional(),
  pds_adicionales:      NonNegativeInt.optional(),
});
export type AjustesDeNivel = z.infer<typeof AjustesDeNivelSchema>;

// ---------------------------------------------------------------------------
// Sanity
// ---------------------------------------------------------------------------
export const CorduraSchema = z.object({
  salud_mental:     AtributoCalculadoSchema,
  umbral_de_locura: AtributoCalculadoSchema,
});

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------
export const NotaSchema = z.object({
  seccion:   z.string(),
  contenido: z.string(),
});
