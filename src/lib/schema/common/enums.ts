import { z } from "zod";


// ---------------------------------------------------------------------------
// Characteristics
// ---------------------------------------------------------------------------
export const CaracteristicaEnum = z.enum([
  "agi", "con", "des", "fue", "int", "per", "pod", "vol",
]);
export type Caracteristica = z.infer<typeof CaracteristicaEnum>;

// Ki only uses 6 characteristics (no int, no per)
export const KiCaracteristicaEnum = z.enum([
  "agi", "con", "des", "fue", "pod", "vol",
]);
export type KiCaracteristica = z.infer<typeof KiCaracteristicaEnum>;

// ---------------------------------------------------------------------------
// Derived stats enums
// ---------------------------------------------------------------------------
export const ResistenciaEnum = z.enum([
  "presencia", "rf", "rv", "re", "rm", "rp",
]);
export type Resistencia = z.infer<typeof ResistenciaEnum>;

export const CapacidadFisicaEnum = z.enum([
  "tipo_de_movimiento", "indice_de_peso", "cansancio", "regeneracion",
]);
export type CapacidadFisica = z.infer<typeof CapacidadFisicaEnum>;

// ---------------------------------------------------------------------------
// Secondary skill groups (official — custom groups use z.string())
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Primary abilities
// ---------------------------------------------------------------------------
export const HabilidadCombateBasicaEnum = z.enum([
  "habilidad_de_ataque", "habilidad_de_parada",
  "habilidad_de_esquiva", "llevar_armadura",
]);

export const HabilidadSobrenaturalBasicaEnum = z.enum([
  "zeon", "ACT", "multiplo_de_regeneracion", "proyeccion_magica",
]);

export const ConvocatoriaEnum = z.enum([
  "convocar", "controlar", "atar", "desconvocar",
]);

export const HabilidadPsiquicaBasicaEnum = z.enum([
  "CV", "proyeccion_psiquica",
]);

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------
export const TipoTAEnum = z.enum([
  "fil", "con", "pen", "cal", "ele", "fri", "ene",
]);
export type TipoTA = z.infer<typeof TipoTAEnum>;

export const TamañoArmaEnum = z.enum(["normal", "enorme", "gigante"]);
export const ManosEnum = z.enum(["una_mano", "dos_manos"]);

export const ModificadorArmaEnum = z.enum([
  "habilidad_de_ataque", "habilidad_de_parada",
  "habilidad_de_esquiva", "daño", "turno",
]);

// ---------------------------------------------------------------------------
// Ki
// ---------------------------------------------------------------------------
export const KiSecundariasEnum = z.enum([
  "deteccion_del_ki", "ocultacion_del_ki",
]);

export const MantenimientoTecnicaEnum = z.enum([
  "mantenido", "sostenimiento_menor", "sostenimiento_mayor",
]);

export const NivelTecnicaSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type NivelTecnica = z.infer<typeof NivelTecnicaSchema>;

// ---------------------------------------------------------------------------
// Magic
// ---------------------------------------------------------------------------
export const GradoHechizoEnum = z.enum([
  "base", "intermedio", "avanzado", "arcano",
]);

// ---------------------------------------------------------------------------
// State / misc
// ---------------------------------------------------------------------------
export const FamaEnum = z.enum([
  "audacia", "honorabilidad", "habilidad", "cobardia", "infamia",
]);

export const AjusteGnosisEnum = z.enum(["pd", "pc"]);

export const CambioCategoriaEnum = z.enum(["previa", "posterior"]);

// ---------------------------------------------------------------------------
// Exposed engine formulas names
// ---------------------------------------------------------------------------
