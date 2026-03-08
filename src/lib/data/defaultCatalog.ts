import type { CombatCatalogInput } from "../schema/combat";
import type { SecondaryCatalogInput } from "../schema/secondary";

// ---------------------------------------------------------------------------
// Default combat catalog — official Anima: Beyond Fantasy base rules.
// ---------------------------------------------------------------------------

export const defaultCombatCatalog: CombatCatalogInput = {
  habilidad_ataque:  { nombre: "Habilidad de Ataque",  caracteristica: "des" },
  habilidad_parada:  { nombre: "Habilidad de Parada",  caracteristica: "des" },
  habilidad_esquiva: { nombre: "Habilidad de Esquiva", caracteristica: "agi" },
  llevar_armadura:   { nombre: "Llevar Armadura",      caracteristica: "fue" },
};

// ---------------------------------------------------------------------------
// Default secondary catalog — official Anima: Beyond Fantasy base rules.
// Fields with default values (conocimiento: false, penalizador_armadura: "ninguno")
// are omitted for brevity.
// ---------------------------------------------------------------------------

export const defaultSecondaryCatalog: SecondaryCatalogInput = {
  atleticas: {
    acrobacias: { nombre: "Acrobacias", caracteristica: "agi", penalizador_armadura: "reducible"             },
    atletismo:  { nombre: "Atletismo",  caracteristica: "agi", penalizador_armadura: "reducible"             },
    montar:     { nombre: "Montar",     caracteristica: "agi"                                                },
    nadar:      { nombre: "Nadar",      caracteristica: "agi", penalizador_armadura: "no_reducible"          },
    trepar:     { nombre: "Trepar",     caracteristica: "agi", penalizador_armadura: "reducible"             },
    saltar:     { nombre: "Saltar",     caracteristica: "fue", penalizador_armadura: "reducible"             },
    pilotar:    { nombre: "Pilotar",    caracteristica: "des"                                                },
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
    animales:   { nombre: "Animales",          caracteristica: "int"                     },
    ciencia:    { nombre: "Ciencia",           caracteristica: "int", conocimiento: true  },
    ley:        { nombre: "Ley",               caracteristica: "int"                     },
    herbolaria: { nombre: "Herbolaria",        caracteristica: "int"                     },
    historia:   { nombre: "Historia",          caracteristica: "int", conocimiento: true  },
    tactica:    { nombre: "Táctica",           caracteristica: "int"                     },
    medicina:   { nombre: "Medicina",          caracteristica: "int", conocimiento: true  },
    memorizar:  { nombre: "Memorizar",         caracteristica: "int"                     },
    navegacion: { nombre: "Navegación",        caracteristica: "int"                     },
    ocultismo:  { nombre: "Ocultismo",         caracteristica: "int"                     },
    tasacion:   { nombre: "Tasación",          caracteristica: "int", conocimiento: true  },
    v_magica:   { nombre: "Valoración Mágica", caracteristica: "pod", conocimiento: true  },
  },
  vigor: {
    frialdad:  { nombre: "Frialdad",          caracteristica: "vol"                      },
    p_fuerza:  { nombre: "Proezas de Fuerza", caracteristica: "fue", penalizador_armadura: "reducible" },
    res_dolor: { nombre: "Resistir el Dolor", caracteristica: "vol"                      },
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
    t_manos:           { nombre: "Trucos de Manos",   caracteristica: "des"                      },
    caligrafia_ritual: { nombre: "Caligrafía Ritual", caracteristica: "des"                      },
    orfebreria:        { nombre: "Orfebrería",        caracteristica: "des"                      },
    confeccion:        { nombre: "Confección",        caracteristica: "des"                      },
    conf_marionetas:   { nombre: "Conf. Marionetas",  caracteristica: "pod"                      },
  },
};
