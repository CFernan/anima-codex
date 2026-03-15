import { z } from "zod";
import { AjusteGnosisEnum } from "../common/enums";
import { NombreOpcionesSchema, nonNegativeInt, PdOpcionesSchema } from "../common/basic_types";


// ---------------------------------------------------------------------------
// Descripcion — predefined fields + user-defined extras
// All fields optional. Catchall allows arbitrary string|number user extras.
// ---------------------------------------------------------------------------
export const DescripcionSchema = z.object({
  edad:         z.union([z.string(), z.number()]).optional(),
  sexo:         z.string().optional(),
  altura:       z.union([z.string(), z.number()]).optional(),
  peso:         z.union([z.string(), z.number()]).optional(),
  region:       z.string().optional(),
  clase_social: z.string().optional(),
  trasfondo:    z.string().optional(),
  /**
   * Relative paths to image files associated with the character.
   * Images are stored as separate files alongside the .acx file.
   */
  imagenes:     z.array(z.string()).optional(),
}).catchall(z.union([z.string(), z.number()]));
export type Descripcion = z.infer<typeof DescripcionSchema>;

// ---------------------------------------------------------------------------
// Caracteristicas del ser — mandatory for all characters
// ---------------------------------------------------------------------------
export const CaracteristicasDelSerSchema = z.object({
  /** Being type (e.g. human, creature). seleccion varies per type. */
  tipo:   NombreOpcionesSchema,
  gnosis: nonNegativeInt,
  acumulacion_de_daño: z.boolean().optional(),
  creado_con_magia:    z.boolean().optional(),
  criatura_con_pcs:    z.boolean().optional(),
  /** Essential abilities. Each element has exactly one catalog key. */
  habilidades_esenciales: z.array(z.record(z.string(), PdOpcionesSchema)).optional(),
  /** Powers. Each element has exactly one catalog key. */
  poderes:               z.array(z.record(z.string(), PdOpcionesSchema)).optional(),
});
export type CaracteristicasDelSer = z.infer<typeof CaracteristicasDelSerSchema>;

// ---------------------------------------------------------------------------
// Ajustes de nivel
// ---------------------------------------------------------------------------
export const AjustesDeNivelSchema = z.object({
  ajuste_por_gnosis:   AjusteGnosisEnum.optional(),
  ajuste_por_legados:  z.boolean().optional(),
  artefacto_vinculado: z.boolean().optional(),
  pds_adicionales:     nonNegativeInt.optional(),
});
export type AjustesDeNivel = z.infer<typeof AjustesDeNivelSchema>;
