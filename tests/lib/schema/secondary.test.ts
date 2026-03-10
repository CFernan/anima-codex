import { describe, it, expect } from "vitest";
import {
  SecondarySkillsInvestmentSchema,
  AtleticasGroupCostSchema,
  VigorGroupCostSchema,
  SecondarySkillDefinitionSchema,
  SecondaryCatalogSchema,
} from "../../../src/lib/schema/secondary";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const validPDAttribute = {
  pd: 0,
  modificadores_base: [],
  modificadores_temporales: [],
};

const validSecundarias = {
  atleticas: {
    acrobacias: validPDAttribute,
    atletismo:  validPDAttribute,
    montar:     validPDAttribute,
    nadar:      validPDAttribute,
    trepar:     validPDAttribute,
    saltar:     validPDAttribute,
    pilotar:    validPDAttribute,
  },
  sociales: {
    estilo:     validPDAttribute,
    intimidar:  validPDAttribute,
    liderazgo:  validPDAttribute,
    persuasion: validPDAttribute,
    comercio:   validPDAttribute,
    callejeo:   validPDAttribute,
    etiqueta:   validPDAttribute,
  },
  perceptivas: {
    advertir: validPDAttribute,
    buscar:   validPDAttribute,
    rastrear: validPDAttribute,
  },
  intelectuales: {
    animales:   validPDAttribute,
    ciencia:    validPDAttribute,
    ley:        validPDAttribute,
    herbolaria: validPDAttribute,
    historia:   validPDAttribute,
    tactica:    validPDAttribute,
    medicina:   validPDAttribute,
    memorizar:  validPDAttribute,
    navegacion: validPDAttribute,
    ocultismo:  validPDAttribute,
    tasacion:   validPDAttribute,
    v_magica:   validPDAttribute,
  },
  vigor: {
    frialdad:  validPDAttribute,
    p_fuerza:  validPDAttribute,
    res_dolor: validPDAttribute,
  },
  subterfugio: {
    cerrajeria: validPDAttribute,
    disfraz:    validPDAttribute,
    ocultarse:  validPDAttribute,
    robo:       validPDAttribute,
    sigilo:     validPDAttribute,
    tramperia:  validPDAttribute,
    venenos:    validPDAttribute,
  },
  creativas: {
    arte:              validPDAttribute,
    baile:             validPDAttribute,
    forja:             validPDAttribute,
    runas:             validPDAttribute,
    alquimia:          validPDAttribute,
    animismo:          validPDAttribute,
    musica:            validPDAttribute,
    t_manos:           validPDAttribute,
    caligrafia_ritual: validPDAttribute,
    orfebreria:        validPDAttribute,
    confeccion:        validPDAttribute,
    conf_marionetas:   validPDAttribute,
  },
};

const validSkillDef = { nombre: "Acrobacias", caracteristica: "agi" };

// ---------------------------------------------------------------------------
// SecondarySkillsInvestmentSchema
// ---------------------------------------------------------------------------

describe("SecondarySkillsInvestmentSchema", () => {
  it("accepts valid secondary skills investment", () => {
    expect(SecondarySkillsInvestmentSchema.safeParse(validSecundarias).success).toBe(true);
  });

  it("fails when a group is missing", () => {
    const { atleticas, ...rest } = validSecundarias;
    expect(SecondarySkillsInvestmentSchema.safeParse(rest).success).toBe(false);
  });

  it("fails when a skill within a group is missing", () => {
    const { acrobacias, ...atleticasSinAcro } = validSecundarias.atleticas;
    const result = SecondarySkillsInvestmentSchema.safeParse({
      ...validSecundarias,
      atleticas: atleticasSinAcro,
    });
    expect(result.success).toBe(false);
  });

  it("fails when pd is negative on a skill", () => {
    const result = SecondarySkillsInvestmentSchema.safeParse({
      ...validSecundarias,
      atleticas: { ...validSecundarias.atleticas, acrobacias: { ...validPDAttribute, pd: -1 } },
    });
    expect(result.success).toBe(false);
  });

  it("accepts custom skills within a group", () => {
    const result = SecondarySkillsInvestmentSchema.safeParse({
      ...validSecundarias,
      creativas: { ...validSecundarias.creativas, custom: { cocina: validPDAttribute } },
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Group cost schemas (AtleticasGroupCostSchema as representative)
// ---------------------------------------------------------------------------

describe("AtleticasGroupCostSchema", () => {
  it("accepts a valid group cost", () => {
    expect(AtleticasGroupCostSchema.safeParse({ coste: 2 }).success).toBe(true);
  });

  it("accepts group cost with valid overrides", () => {
    const result = AtleticasGroupCostSchema.safeParse({ coste: 2, overrides: { acrobacias: 1, nadar: 3 } });
    expect(result.success).toBe(true);
  });

  it("fails when coste is zero", () => {
    expect(AtleticasGroupCostSchema.safeParse({ coste: 0 }).success).toBe(false);
  });

  it("fails when coste is negative", () => {
    expect(AtleticasGroupCostSchema.safeParse({ coste: -1 }).success).toBe(false);
  });

  it("fails when override key does not belong to atleticas", () => {
    const result = AtleticasGroupCostSchema.safeParse({ coste: 2, overrides: { venenos: 1 } }); // venenos is subterfugio
    expect(result.success).toBe(false);
  });

  it("fails when override cost is zero", () => {
    expect(AtleticasGroupCostSchema.safeParse({ coste: 2, overrides: { acrobacias: 0 } }).success).toBe(false);
  });
});

describe("VigorGroupCostSchema", () => {
  it("accepts valid vigor overrides", () => {
    const result = VigorGroupCostSchema.safeParse({ coste: 2, overrides: { p_fuerza: 1 } });
    expect(result.success).toBe(true);
  });

  it("fails when override key belongs to another group", () => {
    const result = VigorGroupCostSchema.safeParse({ coste: 2, overrides: { acrobacias: 1 } });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SecondarySkillDefinitionSchema
// ---------------------------------------------------------------------------

describe("SecondarySkillDefinitionSchema", () => {
  it("accepts a minimal valid definition", () => {
    expect(SecondarySkillDefinitionSchema.safeParse(validSkillDef).success).toBe(true);
  });

  it("defaults conocimiento to false when omitted", () => {
    const result = SecondarySkillDefinitionSchema.safeParse(validSkillDef);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.conocimiento).toBe(false);
  });

  it("defaults penalizador_armadura to ninguno when omitted", () => {
    const result = SecondarySkillDefinitionSchema.safeParse(validSkillDef);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.penalizador_armadura).toBe("ninguno");
  });

  it("accepts conocimiento true", () => {
    const result = SecondarySkillDefinitionSchema.safeParse({ ...validSkillDef, conocimiento: true });
    expect(result.success).toBe(true);
  });

  it("accepts all valid penalizador_armadura values", () => {
    const values = ["ninguno", "reducible", "reducible_hasta_mitad", "no_reducible", "percepcion"];
    for (const v of values) {
      expect(SecondarySkillDefinitionSchema.safeParse({ ...validSkillDef, penalizador_armadura: v }).success).toBe(true);
    }
  });

  it("fails when penalizador_armadura is invalid", () => {
    expect(SecondarySkillDefinitionSchema.safeParse({ ...validSkillDef, penalizador_armadura: "total" }).success).toBe(false);
  });

  it("fails when caracteristica is invalid", () => {
    expect(SecondarySkillDefinitionSchema.safeParse({ nombre: "Test", caracteristica: "xyz" }).success).toBe(false);
  });

  it("fails when nombre is missing", () => {
    expect(SecondarySkillDefinitionSchema.safeParse({ caracteristica: "agi" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SecondaryCatalogSchema
// ---------------------------------------------------------------------------

describe("SecondaryCatalogSchema", () => {
  const buildCatalog = () => ({
    atleticas:     { acrobacias: validSkillDef, atletismo: validSkillDef, montar: validSkillDef, nadar: validSkillDef, trepar: validSkillDef, saltar: { nombre: "Saltar", caracteristica: "fue" }, pilotar: validSkillDef },
    sociales:      { estilo: { nombre: "Estilo", caracteristica: "pod" }, intimidar: { nombre: "Intimidar", caracteristica: "vol" }, liderazgo: { nombre: "Liderazgo", caracteristica: "pod" }, persuasion: { nombre: "Persuasión", caracteristica: "int" }, comercio: { nombre: "Comercio", caracteristica: "int" }, callejeo: { nombre: "Callejeo", caracteristica: "int" }, etiqueta: { nombre: "Etiqueta", caracteristica: "int" } },
    perceptivas:   { advertir: { nombre: "Advertir", caracteristica: "per" }, buscar: { nombre: "Buscar", caracteristica: "per" }, rastrear: { nombre: "Rastrear", caracteristica: "per" } },
    intelectuales: { animales: validSkillDef, ciencia: validSkillDef, ley: validSkillDef, herbolaria: validSkillDef, historia: validSkillDef, tactica: validSkillDef, medicina: validSkillDef, memorizar: validSkillDef, navegacion: validSkillDef, ocultismo: validSkillDef, tasacion: validSkillDef, v_magica: { nombre: "Valoración Mágica", caracteristica: "pod" } },
    vigor:         { frialdad: { nombre: "Frialdad", caracteristica: "vol" }, p_fuerza: { nombre: "Proezas de Fuerza", caracteristica: "fue" }, res_dolor: { nombre: "Resistir el Dolor", caracteristica: "vol" } },
    subterfugio:   { cerrajeria: validSkillDef, disfraz: validSkillDef, ocultarse: { nombre: "Ocultarse", caracteristica: "per" }, robo: validSkillDef, sigilo: { nombre: "Sigilo", caracteristica: "agi" }, tramperia: validSkillDef, venenos: validSkillDef },
    creativas:     { arte: { nombre: "Arte", caracteristica: "pod" }, baile: validSkillDef, forja: validSkillDef, runas: validSkillDef, alquimia: validSkillDef, animismo: { nombre: "Animismo", caracteristica: "pod" }, musica: { nombre: "Música", caracteristica: "pod" }, t_manos: validSkillDef, caligrafia_ritual: validSkillDef, orfebreria: validSkillDef, confeccion: validSkillDef, conf_marionetas: { nombre: "Conf. Marionetas", caracteristica: "pod" } },
  });

  it("accepts a valid catalog", () => {
    expect(SecondaryCatalogSchema.safeParse(buildCatalog()).success).toBe(true);
  });

  it("fails when a group is missing", () => {
    const { atleticas, ...rest } = buildCatalog();
    expect(SecondaryCatalogSchema.safeParse(rest).success).toBe(false);
  });

  it("fails when a skill within a group is missing", () => {
    const catalog = buildCatalog();
    const { acrobacias, ...atleticasSinAcro } = catalog.atleticas;
    expect(SecondaryCatalogSchema.safeParse({ ...catalog, atleticas: atleticasSinAcro }).success).toBe(false);
  });

  it("accepts custom skills within a group", () => {
    const catalog = buildCatalog();
    const result = SecondaryCatalogSchema.safeParse({
      ...catalog,
      creativas: { ...catalog.creativas, custom: { cocina: validSkillDef } },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a custom group at root level", () => {
    const result = SecondaryCatalogSchema.safeParse({
      ...buildCatalog(),
      custom: { marciales: { arte_suave: validSkillDef } },
    });
    expect(result.success).toBe(true);
  });
});
