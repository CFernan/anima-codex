import { describe, it, expect } from "vitest";
import {
  SecondaryInvestmentSchema,
  SecondaryPDCostSchema,
  SecondaryRuleDefinitionSchema,
  SecondaryRuleCatalogSchema,
} from "$lib/schema/secondary";
import { assertValid, assertInvalid } from "../helpers/test-helpers";

const validPDAttribute = { pd: 0 };
const validSkillDef = { nombre: "Acrobacias", caracteristica: "agi" };

const validSecundarias = {
  atleticas: {
    acrobacias: validPDAttribute, atletismo:  validPDAttribute, montar: validPDAttribute,
    nadar: validPDAttribute, trepar: validPDAttribute, saltar: validPDAttribute, pilotar: validPDAttribute,
  },
  sociales: {
    estilo: validPDAttribute, intimidar: validPDAttribute, liderazgo: validPDAttribute,
    persuasion: validPDAttribute, comercio: validPDAttribute, callejeo: validPDAttribute, etiqueta: validPDAttribute,
  },
  perceptivas: { advertir: validPDAttribute, buscar: validPDAttribute, rastrear: validPDAttribute },
  intelectuales: {
    animales: validPDAttribute, ciencia: validPDAttribute, ley: validPDAttribute, herbolaria: validPDAttribute,
    historia: validPDAttribute, tactica: validPDAttribute, medicina: validPDAttribute, memorizar: validPDAttribute,
    navegacion: validPDAttribute, ocultismo: validPDAttribute, tasacion: validPDAttribute, v_magica: validPDAttribute,
  },
  vigor: { frialdad: validPDAttribute, p_fuerza: validPDAttribute, res_dolor: validPDAttribute },
  subterfugio: {
    cerrajeria: validPDAttribute, disfraz: validPDAttribute, ocultarse: validPDAttribute, robo: validPDAttribute,
    sigilo: validPDAttribute, tramperia: validPDAttribute, venenos: validPDAttribute,
  },
  creativas: {
    arte: validPDAttribute, baile: validPDAttribute, forja: validPDAttribute, runas: validPDAttribute,
    alquimia: validPDAttribute, animismo: validPDAttribute, musica: validPDAttribute, t_manos: validPDAttribute,
    caligrafia_ritual: validPDAttribute, orfebreria: validPDAttribute, confeccion: validPDAttribute, conf_marionetas: validPDAttribute,
  },
};

const validSecundariaCosts = {
  atleticas:     { coste: 2 },
  sociales:      { coste: 2 },
  perceptivas:   { coste: 2 },
  intelectuales: { coste: 3 },
  vigor:         { coste: 2 },
  subterfugio:   { coste: 2 },
  creativas:     { coste: 2 },
};

// ---------------------------------------------------------------------------
// SecondaryInvestmentSchema
// ---------------------------------------------------------------------------

describe("SecondaryInvestmentSchema", () => {
  it("accepts valid secondary skills investment", () => {
    assertValid(SecondaryInvestmentSchema.safeParse(validSecundarias));
  });

  it("fails when a group is missing", () => {
    const { atleticas, ...rest } = validSecundarias;
    assertInvalid(SecondaryInvestmentSchema.safeParse(rest), "atleticas group is required");
  });

  it("fails when a skill within a group is missing", () => {
    const { acrobacias, ...atleticasSinAcro } = validSecundarias.atleticas;
    assertInvalid(
      SecondaryInvestmentSchema.safeParse({ ...validSecundarias, atleticas: atleticasSinAcro }),
      "acrobacias is required within atleticas",
    );
  });

  it("fails when pd is negative on a skill", () => {
    assertInvalid(
      SecondaryInvestmentSchema.safeParse({
        ...validSecundarias,
        atleticas: { ...validSecundarias.atleticas, acrobacias: { pd: -1 } },
      }),
      "pd must be non-negative",
    );
  });
});

// ---------------------------------------------------------------------------
// SecondaryPDCostSchema
// An object keyed by SecondaryGroupEnum where each group has coste + sobreescribe.
// ---------------------------------------------------------------------------

describe("SecondaryPDCostSchema", () => {
  it("accepts valid costs for all groups", () => {
    assertValid(SecondaryPDCostSchema.safeParse(validSecundariaCosts));
  });

  it("fails when a group is missing", () => {
    const { atleticas, ...rest } = validSecundariaCosts;
    assertInvalid(SecondaryPDCostSchema.safeParse(rest), "atleticas group is required");
  });

  it("fails when group coste is zero", () => {
    assertInvalid(
      SecondaryPDCostSchema.safeParse({ ...validSecundariaCosts, atleticas: { coste: 0 } }),
      "coste must be positive",
    );
  });

  it("fails when group coste is negative", () => {
    assertInvalid(
      SecondaryPDCostSchema.safeParse({ ...validSecundariaCosts, vigor: { coste: -1 } }),
      "coste must be positive",
    );
  });

  it("accepts sobreescribe with valid skill keys for the group", () => {
    assertValid(SecondaryPDCostSchema.safeParse({
      ...validSecundariaCosts,
      vigor: { coste: 2, sobreescribe: { p_fuerza: 1, res_dolor: 3 } },
    }));
  });

  it("fails when sobreescribe key does not belong to the group", () => {
    assertInvalid(
      SecondaryPDCostSchema.safeParse({
        ...validSecundariaCosts,
        vigor: { coste: 2, sobreescribe: { acrobacias: 1 } }, // acrobacias belongs to atleticas
      }),
      "acrobacias does not belong to vigor group",
    );
  });

  it("fails when sobreescribe cost is zero", () => {
    assertInvalid(
      SecondaryPDCostSchema.safeParse({
        ...validSecundariaCosts,
        vigor: { coste: 2, sobreescribe: { p_fuerza: 0 } },
      }),
      "override cost must be positive",
    );
  });
});

// ---------------------------------------------------------------------------
// SecondaryRuleDefinitionSchema
// ---------------------------------------------------------------------------

describe("SecondaryRuleDefinitionSchema", () => {
  it("accepts a minimal valid definition", () => {
    assertValid(SecondaryRuleDefinitionSchema.safeParse(validSkillDef));
  });

  it("defaults conocimiento to false when omitted", () => {
    const result = SecondaryRuleDefinitionSchema.safeParse(validSkillDef);
    assertValid(result);
    if (result.success) expect(result.data.conocimiento).toBe(false);
  });

  it("defaults penalizador_armadura to ninguno when omitted", () => {
    const result = SecondaryRuleDefinitionSchema.safeParse(validSkillDef);
    assertValid(result);
    if (result.success) expect(result.data.penalizador_armadura).toBe("ninguno");
  });

  it("accepts conocimiento true", () => {
    assertValid(SecondaryRuleDefinitionSchema.safeParse({ ...validSkillDef, conocimiento: true }));
  });

  it("accepts all valid penalizador_armadura values", () => {
    for (const v of ["ninguno", "reducible", "reducible_hasta_mitad", "no_reducible", "percepcion"]) {
      assertValid(SecondaryRuleDefinitionSchema.safeParse({ ...validSkillDef, penalizador_armadura: v }));
    }
  });

  it("fails when penalizador_armadura is invalid", () => {
    assertInvalid(
      SecondaryRuleDefinitionSchema.safeParse({ ...validSkillDef, penalizador_armadura: "total" }),
      "penalizador_armadura must be a valid enum value",
    );
  });

  it("fails when caracteristica is invalid", () => {
    assertInvalid(
      SecondaryRuleDefinitionSchema.safeParse({ nombre: "Test", caracteristica: "xyz" }),
      "caracteristica must be a valid characteristic key",
    );
  });

  it("fails when nombre is missing", () => {
    assertInvalid(SecondaryRuleDefinitionSchema.safeParse({ caracteristica: "agi" }), "nombre is required");
  });
});

// ---------------------------------------------------------------------------
// SecondaryRuleCatalogSchema
// ---------------------------------------------------------------------------

describe("SecondaryRuleCatalogSchema", () => {
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
    assertValid(SecondaryRuleCatalogSchema.safeParse(buildCatalog()));
  });

  it("fails when a group is missing", () => {
    const { atleticas, ...rest } = buildCatalog();
    assertInvalid(SecondaryRuleCatalogSchema.safeParse(rest), "atleticas group is required");
  });

  it("fails when a skill within a group is missing", () => {
    const catalog = buildCatalog();
    const { acrobacias, ...atleticasSinAcro } = catalog.atleticas;
    assertInvalid(
      SecondaryRuleCatalogSchema.safeParse({ ...catalog, atleticas: atleticasSinAcro }),
      "acrobacias is required within atleticas",
    );
  });
});
