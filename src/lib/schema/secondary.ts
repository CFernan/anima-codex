import { z } from "zod";
import { CaracteristicaEnum, PDAttributeSchema } from "./attribute";

// ---------------------------------------------------------------------------
// Secondary skill group keys
// Single source of truth for the 7 secondary skill group identifiers.
// Imported by category.ts to derive PD cost shapes without duplication.
// ---------------------------------------------------------------------------

export const SecondaryGroupKeyEnum = z.enum([
  "atleticas",
  "sociales",
  "perceptivas",
  "intelectuales",
  "vigor",
  "subterfugio",
  "creativas",
]);

export type SecondaryGroupKey = z.infer<typeof SecondaryGroupKeyEnum>;

// ---------------------------------------------------------------------------
// Per-group skill key enums
// Single source of truth for the official skill identifiers in each group.
// satisfies on each group schema enforces exhaustiveness against these enums.
// ---------------------------------------------------------------------------

export const AtleticasSkillKeyEnum = z.enum([
  "acrobacias", "atletismo", "montar", "nadar", "trepar", "saltar", "pilotar",
]);

export const SocialesSkillKeyEnum = z.enum([
  "estilo", "intimidar", "liderazgo", "persuasion", "comercio", "callejeo", "etiqueta",
]);

export const PerceptivasSkillKeyEnum = z.enum([
  "advertir", "buscar", "rastrear",
]);

export const IntelectualesSkillKeyEnum = z.enum([
  "animales", "ciencia", "ley", "herbolaria", "historia", "tactica",
  "medicina", "memorizar", "navegacion", "ocultismo", "tasacion", "v_magica",
]);

export const VigorSkillKeyEnum = z.enum([
  "frialdad", "p_fuerza", "res_dolor",
]);

export const SubterfugioSkillKeyEnum = z.enum([
  "cerrajeria", "disfraz", "ocultarse", "robo", "sigilo", "tramperia", "venenos",
]);

export const CreativasSkillKeyEnum = z.enum([
  "arte", "baile", "forja", "runas", "alquimia", "animismo", "musica",
  "t_manos", "caligrafia_ritual", "orfebreria", "confeccion", "conf_marionetas",
]);

export type AtleticasSkillKey     = z.infer<typeof AtleticasSkillKeyEnum>;
export type SocialesSkillKey      = z.infer<typeof SocialesSkillKeyEnum>;
export type PerceptivasSkillKey   = z.infer<typeof PerceptivasSkillKeyEnum>;
export type IntelectualesSkillKey = z.infer<typeof IntelectualesSkillKeyEnum>;
export type VigorSkillKey         = z.infer<typeof VigorSkillKeyEnum>;
export type SubterfugioSkillKey   = z.infer<typeof SubterfugioSkillKeyEnum>;
export type CreativasSkillKey     = z.infer<typeof CreativasSkillKeyEnum>;

// ---------------------------------------------------------------------------
// Secondary skills investment — character data
// Tracks PD investment per skill. This is what gets written to the .acx file.
// satisfies on each group enforces exhaustiveness against its key enum.
// ---------------------------------------------------------------------------

export const SecondarySkillsInvestmentSchema = z.object({
  atleticas: z.object({
    acrobacias: PDAttributeSchema,
    atletismo:  PDAttributeSchema,
    montar:     PDAttributeSchema,
    nadar:      PDAttributeSchema,
    trepar:     PDAttributeSchema,
    saltar:     PDAttributeSchema,
    pilotar:    PDAttributeSchema,
    custom:     z.record(z.string(), PDAttributeSchema).optional(),
  } satisfies Record<AtleticasSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  sociales: z.object({
    estilo:     PDAttributeSchema,
    intimidar:  PDAttributeSchema,
    liderazgo:  PDAttributeSchema,
    persuasion: PDAttributeSchema,
    comercio:   PDAttributeSchema,
    callejeo:   PDAttributeSchema,
    etiqueta:   PDAttributeSchema,
    custom:     z.record(z.string(), PDAttributeSchema).optional(),
  } satisfies Record<SocialesSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  perceptivas: z.object({
    advertir: PDAttributeSchema,
    buscar:   PDAttributeSchema,
    rastrear: PDAttributeSchema,
    custom:   z.record(z.string(), PDAttributeSchema).optional(),
  } satisfies Record<PerceptivasSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  intelectuales: z.object({
    animales:   PDAttributeSchema,
    ciencia:    PDAttributeSchema,
    ley:        PDAttributeSchema,
    herbolaria: PDAttributeSchema,
    historia:   PDAttributeSchema,
    tactica:    PDAttributeSchema,
    medicina:   PDAttributeSchema,
    memorizar:  PDAttributeSchema,
    navegacion: PDAttributeSchema,
    ocultismo:  PDAttributeSchema,
    tasacion:   PDAttributeSchema,
    v_magica:   PDAttributeSchema,
    custom:     z.record(z.string(), PDAttributeSchema).optional(),
  } satisfies Record<IntelectualesSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  vigor: z.object({
    frialdad:  PDAttributeSchema,
    p_fuerza:  PDAttributeSchema,
    res_dolor: PDAttributeSchema,
    custom:    z.record(z.string(), PDAttributeSchema).optional(),
  } satisfies Record<VigorSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  subterfugio: z.object({
    cerrajeria: PDAttributeSchema,
    disfraz:    PDAttributeSchema,
    ocultarse:  PDAttributeSchema,
    robo:       PDAttributeSchema,
    sigilo:     PDAttributeSchema,
    tramperia:  PDAttributeSchema,
    venenos:    PDAttributeSchema,
    custom:     z.record(z.string(), PDAttributeSchema).optional(),
  } satisfies Record<SubterfugioSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  creativas: z.object({
    arte:              PDAttributeSchema,
    baile:             PDAttributeSchema,
    forja:             PDAttributeSchema,
    runas:             PDAttributeSchema,
    alquimia:          PDAttributeSchema,
    animismo:          PDAttributeSchema,
    musica:            PDAttributeSchema,
    t_manos:           PDAttributeSchema,
    caligrafia_ritual: PDAttributeSchema,
    orfebreria:        PDAttributeSchema,
    confeccion:        PDAttributeSchema,
    conf_marionetas:   PDAttributeSchema,
    custom:            z.record(z.string(), PDAttributeSchema).optional(),
  } satisfies Record<CreativasSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
} satisfies Record<SecondaryGroupKey, z.ZodTypeAny>);

export type SecondarySkillsInvestment = z.infer<typeof SecondarySkillsInvestmentSchema>;

// ---------------------------------------------------------------------------
// Secondary skill group cost — category data
// PD cost schema for a single secondary skill group.
// coste: default PD cost for all skills in the group.
// overrides: individual skill costs that differ from the group default.
//   Override keys are validated against the group's own skill key enum.
// Moved here from category.ts — costs are a property of the secondary subsystem.
// ---------------------------------------------------------------------------

// Each GroupCostSchema uses z.object().partial().strict() for overrides:
//   .partial() — every skill key is optional (only overridden skills need to be listed)
//   .strict()  — unknown keys are rejected (prevents cross-group key leakage)
//   satisfies  — compile-time exhaustiveness: adding a key to the enum without
//                adding it to this object produces a compile error
const _posInt = z.number().int().positive();

export const AtleticasGroupCostSchema = z.object({
  coste: _posInt,
  overrides: z.object({
    acrobacias: _posInt, atletismo: _posInt, montar:  _posInt,
    nadar:      _posInt, trepar:    _posInt, saltar:  _posInt, pilotar: _posInt,
  } satisfies Record<AtleticasSkillKey, z.ZodTypeAny>).partial().strict().optional(),
});

export const SocialesGroupCostSchema = z.object({
  coste: _posInt,
  overrides: z.object({
    estilo: _posInt, intimidar: _posInt, liderazgo: _posInt, persuasion: _posInt,
    comercio: _posInt, callejeo: _posInt, etiqueta:  _posInt,
  } satisfies Record<SocialesSkillKey, z.ZodTypeAny>).partial().strict().optional(),
});

export const PerceptivasGroupCostSchema = z.object({
  coste: _posInt,
  overrides: z.object({
    advertir: _posInt, buscar: _posInt, rastrear: _posInt,
  } satisfies Record<PerceptivasSkillKey, z.ZodTypeAny>).partial().strict().optional(),
});

export const IntelectualesGroupCostSchema = z.object({
  coste: _posInt,
  overrides: z.object({
    animales: _posInt, ciencia:   _posInt, ley:       _posInt, herbolaria: _posInt,
    historia: _posInt, tactica:   _posInt, medicina:  _posInt, memorizar:  _posInt,
    navegacion: _posInt, ocultismo: _posInt, tasacion: _posInt, v_magica:  _posInt,
  } satisfies Record<IntelectualesSkillKey, z.ZodTypeAny>).partial().strict().optional(),
});

export const VigorGroupCostSchema = z.object({
  coste: _posInt,
  overrides: z.object({
    frialdad: _posInt, p_fuerza: _posInt, res_dolor: _posInt,
  } satisfies Record<VigorSkillKey, z.ZodTypeAny>).partial().strict().optional(),
});

export const SubterfugioGroupCostSchema = z.object({
  coste: _posInt,
  overrides: z.object({
    cerrajeria: _posInt, disfraz: _posInt, ocultarse: _posInt, robo:      _posInt,
    sigilo:     _posInt, tramperia: _posInt, venenos:  _posInt,
  } satisfies Record<SubterfugioSkillKey, z.ZodTypeAny>).partial().strict().optional(),
});

export const CreativasGroupCostSchema = z.object({
  coste: _posInt,
  overrides: z.object({
    arte: _posInt, baile: _posInt, forja:             _posInt, runas:           _posInt,
    alquimia: _posInt, animismo: _posInt, musica:     _posInt, t_manos:         _posInt,
    caligrafia_ritual: _posInt, orfebreria: _posInt, confeccion: _posInt, conf_marionetas: _posInt,
  } satisfies Record<CreativasSkillKey, z.ZodTypeAny>).partial().strict().optional(),
});

export type AtleticasGroupCost     = z.infer<typeof AtleticasGroupCostSchema>;
export type SocialesGroupCost      = z.infer<typeof SocialesGroupCostSchema>;
export type PerceptivasGroupCost   = z.infer<typeof PerceptivasGroupCostSchema>;
export type IntelectualesGroupCost = z.infer<typeof IntelectualesGroupCostSchema>;
export type VigorGroupCost         = z.infer<typeof VigorGroupCostSchema>;
export type SubterfugioGroupCost   = z.infer<typeof SubterfugioGroupCostSchema>;
export type CreativasGroupCost     = z.infer<typeof CreativasGroupCostSchema>;

// ---------------------------------------------------------------------------
// Armor penalty enum
// Describes how a skill is affected by worn armor and whether the
// penalty can be reduced via the llevar_armadura skill.
//
//   ninguno               — no penalty
//   reducible             — penalty can be fully eliminated via llevar_armadura
//   reducible_hasta_mitad — penalty can be reduced by at most half
//   no_reducible          — penalty cannot be reduced in any way
//   percepcion            — non-reducible penalty applied only to perceptive
//                           skills (advertir, buscar, rastrear)
// ---------------------------------------------------------------------------

export const PenalizadorArmaduraEnum = z.enum([
  "ninguno",
  "reducible",
  "reducible_hasta_mitad",
  "no_reducible",
  "percepcion",
]);

export type PenalizadorArmadura = z.infer<typeof PenalizadorArmaduraEnum>;

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
// Describes the static rules for all secondary skills, grouped by type.
// Extensible: custom groups and skills can be added without breaking existing data.
// ---------------------------------------------------------------------------

export const SecondaryCatalogSchema = z.object({
  atleticas: z.object({
    acrobacias: SecondarySkillDefinitionSchema,
    atletismo:  SecondarySkillDefinitionSchema,
    montar:     SecondarySkillDefinitionSchema,
    nadar:      SecondarySkillDefinitionSchema,
    trepar:     SecondarySkillDefinitionSchema,
    saltar:     SecondarySkillDefinitionSchema,
    pilotar:    SecondarySkillDefinitionSchema,
    custom:     z.record(z.string(), SecondarySkillDefinitionSchema).optional(),
  } satisfies Record<AtleticasSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  sociales: z.object({
    estilo:     SecondarySkillDefinitionSchema,
    intimidar:  SecondarySkillDefinitionSchema,
    liderazgo:  SecondarySkillDefinitionSchema,
    persuasion: SecondarySkillDefinitionSchema,
    comercio:   SecondarySkillDefinitionSchema,
    callejeo:   SecondarySkillDefinitionSchema,
    etiqueta:   SecondarySkillDefinitionSchema,
    custom:     z.record(z.string(), SecondarySkillDefinitionSchema).optional(),
  } satisfies Record<SocialesSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  perceptivas: z.object({
    advertir: SecondarySkillDefinitionSchema,
    buscar:   SecondarySkillDefinitionSchema,
    rastrear: SecondarySkillDefinitionSchema,
    custom:   z.record(z.string(), SecondarySkillDefinitionSchema).optional(),
  } satisfies Record<PerceptivasSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  intelectuales: z.object({
    animales:   SecondarySkillDefinitionSchema,
    ciencia:    SecondarySkillDefinitionSchema,
    ley:        SecondarySkillDefinitionSchema,
    herbolaria: SecondarySkillDefinitionSchema,
    historia:   SecondarySkillDefinitionSchema,
    tactica:    SecondarySkillDefinitionSchema,
    medicina:   SecondarySkillDefinitionSchema,
    memorizar:  SecondarySkillDefinitionSchema,
    navegacion: SecondarySkillDefinitionSchema,
    ocultismo:  SecondarySkillDefinitionSchema,
    tasacion:   SecondarySkillDefinitionSchema,
    v_magica:   SecondarySkillDefinitionSchema,
    custom:     z.record(z.string(), SecondarySkillDefinitionSchema).optional(),
  } satisfies Record<IntelectualesSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  vigor: z.object({
    frialdad:  SecondarySkillDefinitionSchema,
    p_fuerza:  SecondarySkillDefinitionSchema,
    res_dolor: SecondarySkillDefinitionSchema,
    custom:    z.record(z.string(), SecondarySkillDefinitionSchema).optional(),
  } satisfies Record<VigorSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  subterfugio: z.object({
    cerrajeria: SecondarySkillDefinitionSchema,
    disfraz:    SecondarySkillDefinitionSchema,
    ocultarse:  SecondarySkillDefinitionSchema,
    robo:       SecondarySkillDefinitionSchema,
    sigilo:     SecondarySkillDefinitionSchema,
    tramperia:  SecondarySkillDefinitionSchema,
    venenos:    SecondarySkillDefinitionSchema,
    custom:     z.record(z.string(), SecondarySkillDefinitionSchema).optional(),
  } satisfies Record<SubterfugioSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  creativas: z.object({
    arte:              SecondarySkillDefinitionSchema,
    baile:             SecondarySkillDefinitionSchema,
    forja:             SecondarySkillDefinitionSchema,
    runas:             SecondarySkillDefinitionSchema,
    alquimia:          SecondarySkillDefinitionSchema,
    animismo:          SecondarySkillDefinitionSchema,
    musica:            SecondarySkillDefinitionSchema,
    t_manos:           SecondarySkillDefinitionSchema,
    caligrafia_ritual: SecondarySkillDefinitionSchema,
    orfebreria:        SecondarySkillDefinitionSchema,
    confeccion:        SecondarySkillDefinitionSchema,
    conf_marionetas:   SecondarySkillDefinitionSchema,
    custom:            z.record(z.string(), SecondarySkillDefinitionSchema).optional(),
  } satisfies Record<CreativasSkillKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>),
  custom: z.record(z.string(), z.record(z.string(), SecondarySkillDefinitionSchema)).optional(),
} satisfies Record<SecondaryGroupKey, z.ZodTypeAny> & Record<string, z.ZodTypeAny>);

export type SecondaryCatalog = z.infer<typeof SecondaryCatalogSchema>;
export type SecondaryCatalogInput = z.input<typeof SecondaryCatalogSchema>;
