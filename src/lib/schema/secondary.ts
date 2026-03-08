import { z } from "zod";
import { CaracteristicaEnum, PenalizadorArmaduraEnum } from "./enums";
import { PDCharacteristicSkillSchema } from "./attribute";

// ---------------------------------------------------------------------------
// Secondary skills — character data
// Each group includes an optional `custom` record for user-defined skills.
// ---------------------------------------------------------------------------

export const SecondarySkillSchema = PDCharacteristicSkillSchema;
export type SecondarySkill = z.infer<typeof SecondarySkillSchema>;

export const SecondarySkillsSchema = z.object({
  atleticas: z.object({
    acrobacias: SecondarySkillSchema,
    atletismo:  SecondarySkillSchema,
    montar:     SecondarySkillSchema,
    nadar:      SecondarySkillSchema,
    trepar:     SecondarySkillSchema,
    saltar:     SecondarySkillSchema,
    pilotar:    SecondarySkillSchema,
    custom:     z.record(z.string(), SecondarySkillSchema).optional(),
  }),
  sociales: z.object({
    estilo:     SecondarySkillSchema,
    intimidar:  SecondarySkillSchema,
    liderazgo:  SecondarySkillSchema,
    persuasion: SecondarySkillSchema,
    comercio:   SecondarySkillSchema,
    callejeo:   SecondarySkillSchema,
    etiqueta:   SecondarySkillSchema,
    custom:     z.record(z.string(), SecondarySkillSchema).optional(),
  }),
  perceptivas: z.object({
    advertir: SecondarySkillSchema,
    buscar:   SecondarySkillSchema,
    rastrear: SecondarySkillSchema,
    custom:   z.record(z.string(), SecondarySkillSchema).optional(),
  }),
  intelectuales: z.object({
    animales:   SecondarySkillSchema,
    ciencia:    SecondarySkillSchema,
    ley:        SecondarySkillSchema,
    herbolaria: SecondarySkillSchema,
    historia:   SecondarySkillSchema,
    tactica:    SecondarySkillSchema,
    medicina:   SecondarySkillSchema,
    memorizar:  SecondarySkillSchema,
    navegacion: SecondarySkillSchema,
    ocultismo:  SecondarySkillSchema,
    tasacion:   SecondarySkillSchema,
    v_magica:   SecondarySkillSchema,
    custom:     z.record(z.string(), SecondarySkillSchema).optional(),
  }),
  vigor: z.object({
    frialdad:  SecondarySkillSchema,
    p_fuerza:  SecondarySkillSchema,
    res_dolor: SecondarySkillSchema,
    custom:    z.record(z.string(), SecondarySkillSchema).optional(),
  }),
  subterfugio: z.object({
    cerrajeria: SecondarySkillSchema,
    disfraz:    SecondarySkillSchema,
    ocultarse:  SecondarySkillSchema,
    robo:       SecondarySkillSchema,
    sigilo:     SecondarySkillSchema,
    tramperia:  SecondarySkillSchema,
    venenos:    SecondarySkillSchema,
    custom:     z.record(z.string(), SecondarySkillSchema).optional(),
  }),
  creativas: z.object({
    arte:              SecondarySkillSchema,
    baile:             SecondarySkillSchema,
    forja:             SecondarySkillSchema,
    runas:             SecondarySkillSchema,
    alquimia:          SecondarySkillSchema,
    animismo:          SecondarySkillSchema,
    musica:            SecondarySkillSchema,
    t_manos:           SecondarySkillSchema,
    caligrafia_ritual: SecondarySkillSchema,
    orfebreria:        SecondarySkillSchema,
    confeccion:        SecondarySkillSchema,
    conf_marionetas:   SecondarySkillSchema,
    custom:            z.record(z.string(), SecondarySkillSchema).optional(),
  }),
});

export type SecondarySkills = z.infer<typeof SecondarySkillsSchema>;

// ---------------------------------------------------------------------------
// Secondary skill definition — catalog data
// Static game rules for each secondary skill.
// ---------------------------------------------------------------------------

export const SecondarySkillDefinitionSchema = z.object({
  /** Display name of the skill (official Spanish name). */
  nombre: z.string(),
  /** Primary characteristic that provides the bonus for this skill. */
  caracteristica: CaracteristicaEnum,
  /** If true, the skill cannot be used without PD investment (value = NaN).
   *  If false, uninvested skills apply a -30 base modifier automatically. */
  conocimiento: z.boolean().default(false),
  /** Armor penalty applied when using this skill. */
  penalizador_armadura: PenalizadorArmaduraEnum.default("ninguno"),
});

export type SecondarySkillDefinition = z.infer<typeof SecondarySkillDefinitionSchema>;
export type SecondarySkillDefinitionInput = z.input<typeof SecondarySkillDefinitionSchema>;

// ---------------------------------------------------------------------------
// Secondary catalog schema
// Mirrors SecondarySkillsSchema structure but holds definitions, not character data.
// Extensible: new groups or skills can be added without breaking existing data.
// ---------------------------------------------------------------------------

const SecondarySkillGroupDefinitionSchema = z.record(z.string(), SecondarySkillDefinitionSchema);

export const SecondaryCatalogSchema = z.object({
  atleticas:     SecondarySkillGroupDefinitionSchema,
  sociales:      SecondarySkillGroupDefinitionSchema,
  perceptivas:   SecondarySkillGroupDefinitionSchema,
  intelectuales: SecondarySkillGroupDefinitionSchema,
  vigor:         SecondarySkillGroupDefinitionSchema,
  subterfugio:   SecondarySkillGroupDefinitionSchema,
  creativas:     SecondarySkillGroupDefinitionSchema,
  custom:        z.record(z.string(), SecondarySkillGroupDefinitionSchema).optional(),
});

export type SecondaryCatalog = z.infer<typeof SecondaryCatalogSchema>;
export type SecondaryCatalogInput = z.input<typeof SecondaryCatalogSchema>;
