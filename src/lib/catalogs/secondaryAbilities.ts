import { SecundariaDefinicionSchema, SecundariaGrupoCostePDsSchema, type SecundariasCatalogInput } from "$lib/schema/catalog/secondaryAbilities";
import { PositiveInt } from "$lib/schema/common/basic_types";
import { schemaFromEnum } from "$lib/schema/common/utils";
import z from "zod";


// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const GrupoSecundariasBaseEnum = z.enum([
  "atleticas",
  "sociales",
  "perceptivas",
  "intelectuales",
  "vigor",
  "subterfugio",
  "creativas",
  "ki",
]);

export const SecundariasAtleticasBaseEnum = z.enum([
  "acrobacias",
  "atletismo",
  "montar",
  "nadar",
  "trepar",
  "saltar",
  "pilotar",
]);

export const SecundariasSocialesBaseEnum = z.enum([
  "estilo",
  "intimidar",
  "liderazgo",
  "persuasion",
  "comercio",
  "callejeo",
  "etiqueta",
]);

export const SecundariasPerceptivasBaseEnum = z.enum([
  "advertir",
  "buscar",
  "rastrear",
]);

export const SecundariasIntelectualesBaseEnum = z.enum([
  "animales",
  "ciencia",
  "ley",
  "herbolaria",
  "historia",
  "tactica",
  "medicina",
  "memorizar",
  "navegacion",
  "ocultismo",
  "tasacion",
  "valoracion_magica",
]);

export const SecundariasVigorBaseEnum = z.enum([
  "frialdad",
  "proeza_de_fuerza",
  "resistir_el_dolor",
]);

export const SecundariasSubterfugioBaseEnum = z.enum([
  "cerrajeria",
  "disfraz",
  "ocultarse",
  "robo",
  "sigilo",
  "tramperia",
  "venenos",
]);

export const SecundariasCreativasBaseEnum = z.enum([
  "arte",
  "baile",
  "forja",
  "runas",
  "alquimia",
  "animismo",
  "musica",
  "trucos_de_manos",
  "caligrafia_ritual",
  "orfebreria",
  "confeccion",
  "confeccion_de_marionetas",
]);

export const SecundariasKiBaseEnum = z.enum([
  "deteccion_del_ki",
  "ocultacion_del_ki",
]);

export const SecundariasBaseTodasEnum = z.enum([
  ...SecundariasAtleticasBaseEnum.options,
  ...SecundariasSocialesBaseEnum.options,
  ...SecundariasPerceptivasBaseEnum.options,
  ...SecundariasIntelectualesBaseEnum.options,
  ...SecundariasVigorBaseEnum.options,
  ...SecundariasSubterfugioBaseEnum.options,
  ...SecundariasCreativasBaseEnum.options,
  ...SecundariasKiBaseEnum.options,
])

// helper schema for validation
export const SecundariasInversionBaseSchema = z.object({
  atleticas:     schemaFromEnum(SecundariasAtleticasBaseEnum,     SecundariaDefinicionSchema),
  sociales:      schemaFromEnum(SecundariasSocialesBaseEnum,      SecundariaDefinicionSchema),
  perceptivas:   schemaFromEnum(SecundariasPerceptivasBaseEnum,   SecundariaDefinicionSchema),
  intelectuales: schemaFromEnum(SecundariasIntelectualesBaseEnum, SecundariaDefinicionSchema),
  vigor:         schemaFromEnum(SecundariasVigorBaseEnum,         SecundariaDefinicionSchema),
  subterfugio:   schemaFromEnum(SecundariasSubterfugioBaseEnum,   SecundariaDefinicionSchema),
  creativas:     schemaFromEnum(SecundariasCreativasBaseEnum,     SecundariaDefinicionSchema),
  ki:            schemaFromEnum(SecundariasKiBaseEnum,            SecundariaDefinicionSchema),
});

// helper schemas for category validation
export const SecundariasCostePDBaseSchema = z.object({
  atleticas:     SecundariaGrupoCostePDsSchema.extend({
                    particular: schemaFromEnum(SecundariasAtleticasBaseEnum, PositiveInt).partial().strict().optional()}),
  sociales:      SecundariaGrupoCostePDsSchema.extend({
                    particular: schemaFromEnum(SecundariasSocialesBaseEnum, PositiveInt).partial().strict().optional()}),
  perceptivas:   SecundariaGrupoCostePDsSchema.extend({
                    particular: schemaFromEnum(SecundariasPerceptivasBaseEnum, PositiveInt).partial().strict().optional()}),
  intelectuales: SecundariaGrupoCostePDsSchema.extend({
                    particular: schemaFromEnum(SecundariasIntelectualesBaseEnum, PositiveInt).partial().strict().optional()}),
  vigor:         SecundariaGrupoCostePDsSchema.extend({
                    particular: schemaFromEnum(SecundariasVigorBaseEnum, PositiveInt).partial().strict().optional()}),
  subterfugio:   SecundariaGrupoCostePDsSchema.extend({
                    particular: schemaFromEnum(SecundariasSubterfugioBaseEnum, PositiveInt).partial().strict().optional()}),
  creativas:     SecundariaGrupoCostePDsSchema.extend({
                    particular: schemaFromEnum(SecundariasCreativasBaseEnum, PositiveInt).partial().strict().optional()}),
  // ki group is ignored as there is no cost
});

// ---------------------------------------------------------------------------
// Base catalog
// ---------------------------------------------------------------------------
export const SecundariasBaseCatalog: SecundariasCatalogInput = {
  atleticas: {
    acrobacias: { nombre: "Acrobacias", caracteristica: "agi", penalizador_armadura: "reducible"    },
    atletismo:  { nombre: "Atletismo",  caracteristica: "agi", penalizador_armadura: "reducible"    },
    montar:     { nombre: "Montar",     caracteristica: "agi"                                       },
    nadar:      { nombre: "Nadar",      caracteristica: "agi", penalizador_armadura: "no_reducible" },
    trepar:     { nombre: "Trepar",     caracteristica: "agi", penalizador_armadura: "reducible"    },
    saltar:     { nombre: "Saltar",     caracteristica: "fue", penalizador_armadura: "reducible"    },
    pilotar:    { nombre: "Pilotar",    caracteristica: "des"                                       },
  },
  sociales: {
    estilo:     { nombre: "Estilo",     caracteristica: "pod" },
    intimidar:  { nombre: "Intimidar",  caracteristica: "vol" },
    liderazgo:  { nombre: "Liderazgo",  caracteristica: "pod" },
    persuasion: { nombre: "Persuasión", caracteristica: "int" },
    comercio:   { nombre: "Comercio",   caracteristica: "int" },
    callejeo:   { nombre: "Callejeo",   caracteristica: "int" },
    etiqueta:   { nombre: "Etiqueta",   caracteristica: "int" },
  },
  perceptivas: {
    advertir: { nombre: "Advertir", caracteristica: "per", penalizador_armadura: "percepcion" },
    buscar:   { nombre: "Buscar",   caracteristica: "per", penalizador_armadura: "percepcion" },
    rastrear: { nombre: "Rastrear", caracteristica: "per", penalizador_armadura: "percepcion" },
  },
  intelectuales: {
    animales:          { nombre: "Animales",          caracteristica: "int"                     },
    ciencia:           { nombre: "Ciencia",           caracteristica: "int", conocimiento: true },
    ley:               { nombre: "Ley",               caracteristica: "int"                     },
    herbolaria:        { nombre: "Herbolaria",        caracteristica: "int"                     },
    historia:          { nombre: "Historia",          caracteristica: "int", conocimiento: true },
    tactica:           { nombre: "Táctica",           caracteristica: "int"                     },
    medicina:          { nombre: "Medicina",          caracteristica: "int", conocimiento: true },
    memorizar:         { nombre: "Memorizar",         caracteristica: "int"                     },
    navegacion:        { nombre: "Navegación",        caracteristica: "int"                     },
    ocultismo:         { nombre: "Ocultismo",         caracteristica: "int"                     },
    tasacion:          { nombre: "Tasación",          caracteristica: "int", conocimiento: true },
    valoracion_magica: { nombre: "Valoración Mágica", caracteristica: "pod", conocimiento: true },
  },
  vigor: {
    frialdad:          { nombre: "Frialdad",          caracteristica: "vol"                      },
    proeza_de_fuerza:  { nombre: "Proezas de Fuerza", caracteristica: "fue", penalizador_armadura: "reducible" },
    resistir_el_dolor: { nombre: "Resistir el Dolor", caracteristica: "vol"                      },
  },
  subterfugio: {
    cerrajeria: { nombre: "Cerrajería", caracteristica: "des"                                                },
    disfraz:    { nombre: "Disfraz",    caracteristica: "des"                                                },
    ocultarse:  { nombre: "Ocultarse",  caracteristica: "per", penalizador_armadura: "reducible"             },
    robo:       { nombre: "Robo",       caracteristica: "des"                                                },
    sigilo:     { nombre: "Sigilo",     caracteristica: "agi", penalizador_armadura: "reducible_hasta_mitad" },
    tramperia:  { nombre: "Trampería",  caracteristica: "des"                                                },
    venenos:    { nombre: "Venenos",    caracteristica: "int", conocimiento: true                            },
  },
  creativas: {
    arte:              { nombre: "Arte",              caracteristica: "pod"                      },
    baile:             { nombre: "Baile",             caracteristica: "agi", conocimiento: true, penalizador_armadura: "reducible" },
    forja:             { nombre: "Forja",             caracteristica: "des", conocimiento: true  },
    runas:             { nombre: "Runas",             caracteristica: "des"                      },
    alquimia:          { nombre: "Alquimia",          caracteristica: "int"                      },
    animismo:          { nombre: "Animismo",          caracteristica: "pod"                      },
    musica:            { nombre: "Música",            caracteristica: "pod", conocimiento: true  },
    trucos_de_manos:   { nombre: "Trucos de Manos",   caracteristica: "des"                      },
    caligrafia_ritual: { nombre: "Caligrafía Ritual", caracteristica: "des"                      },
    orfebreria:        { nombre: "Orfebrería",        caracteristica: "des"                      },
    confeccion:        { nombre: "Confección",        caracteristica: "des"                      },
    confeccion_de_marionetas: { nombre: "Confección de Marionetas",  caracteristica: "pod"       },
  },
  ki: {
    deteccion_del_ki:  { nombre: "Detección del Ki",  caracteristica: null, conocimiento: true },
    ocultacion_del_ki: { nombre: "Ocultación del Ki", caracteristica: null, conocimiento: true },
  }
} satisfies z.input<typeof SecundariasInversionBaseSchema>;
