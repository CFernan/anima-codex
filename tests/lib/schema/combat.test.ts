import { describe, it, expect } from "vitest";
import {
  CombatSkillsInvestmentSchema,
  BasicCombatSkillCostSchema,
  CombatSkillDefinitionSchema,
  CombatCatalogSchema,
} from "../../../src/lib/schema/combat";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const validPDAttribute = {
  pd: 0,
  modificadores_base: [],
  modificadores_temporales: [],
};

const validCombatInvestment = {
  habilidad_ataque:  validPDAttribute,
  habilidad_parada:  validPDAttribute,
  habilidad_esquiva: validPDAttribute,
  llevar_armadura:   validPDAttribute,
};

const validCombatCatalog = {
  habilidad_ataque:  { nombre: "Habilidad de Ataque",  caracteristica: "des" },
  habilidad_parada:  { nombre: "Habilidad de Parada",  caracteristica: "des" },
  habilidad_esquiva: { nombre: "Habilidad de Esquiva", caracteristica: "agi" },
  llevar_armadura:   { nombre: "Llevar Armadura",      caracteristica: "fue" },
};

// ---------------------------------------------------------------------------
// CombatSkillsInvestmentSchema
// ---------------------------------------------------------------------------

describe("CombatSkillsInvestmentSchema", () => {
  it("accepts a valid investment", () => {
    expect(CombatSkillsInvestmentSchema.safeParse(validCombatInvestment).success).toBe(true);
  });

  it("fails when a skill is missing", () => {
    const { habilidad_ataque, ...rest } = validCombatInvestment;
    expect(CombatSkillsInvestmentSchema.safeParse(rest).success).toBe(false);
  });

  it("fails when pd is negative", () => {
    const result = CombatSkillsInvestmentSchema.safeParse({
      ...validCombatInvestment,
      habilidad_ataque: { ...validPDAttribute, pd: -5 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts pd of zero", () => {
    expect(CombatSkillsInvestmentSchema.safeParse(validCombatInvestment).success).toBe(true);
  });

  it("accepts modifiers on a skill", () => {
    const result = CombatSkillsInvestmentSchema.safeParse({
      ...validCombatInvestment,
      habilidad_ataque: {
        pd: 10,
        modificadores_base: [{ valor: 5, fuente: "Bono racial", automatico: true }],
        modificadores_temporales: [],
      },
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// BasicCombatSkillCostSchema
// ---------------------------------------------------------------------------

describe("BasicCombatSkillCostSchema", () => {
  it("accepts a positive integer", () => {
    expect(BasicCombatSkillCostSchema.safeParse(2).success).toBe(true);
  });

  it("fails when zero", () => {
    expect(BasicCombatSkillCostSchema.safeParse(0).success).toBe(false);
  });

  it("fails when negative", () => {
    expect(BasicCombatSkillCostSchema.safeParse(-1).success).toBe(false);
  });

  it("fails when not an integer", () => {
    expect(BasicCombatSkillCostSchema.safeParse(1.5).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CombatSkillDefinitionSchema
// ---------------------------------------------------------------------------

describe("CombatSkillDefinitionSchema", () => {
  it("accepts a valid definition", () => {
    expect(CombatSkillDefinitionSchema.safeParse({ nombre: "Ataque", caracteristica: "des" }).success).toBe(true);
  });

  it("fails when nombre is missing", () => {
    expect(CombatSkillDefinitionSchema.safeParse({ caracteristica: "des" }).success).toBe(false);
  });

  it("fails when caracteristica is invalid", () => {
    expect(CombatSkillDefinitionSchema.safeParse({ nombre: "Ataque", caracteristica: "xyz" }).success).toBe(false);
  });

  it("accepts all valid caracteristica values", () => {
    const valid = ["agi", "con", "des", "fue", "int", "per", "pod", "vol"];
    for (const c of valid) {
      expect(CombatSkillDefinitionSchema.safeParse({ nombre: "Skill", caracteristica: c }).success).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// CombatCatalogSchema
// ---------------------------------------------------------------------------

describe("CombatCatalogSchema", () => {
  it("accepts a valid catalog", () => {
    expect(CombatCatalogSchema.safeParse(validCombatCatalog).success).toBe(true);
  });

  it("accepts catalog with custom skills", () => {
    const result = CombatCatalogSchema.safeParse({
      ...validCombatCatalog,
      custom: {
        arte_marcial_basica: { nombre: "Arte Marcial Básica", caracteristica: "agi" },
      },
    });
    expect(result.success).toBe(true);
  });

  it("fails when a required skill is missing", () => {
    const { habilidad_parada, ...rest } = validCombatCatalog;
    expect(CombatCatalogSchema.safeParse(rest).success).toBe(false);
  });

  it("fails when a definition has invalid caracteristica", () => {
    const result = CombatCatalogSchema.safeParse({
      ...validCombatCatalog,
      habilidad_ataque: { nombre: "Ataque", caracteristica: "fuerza" },
    });
    expect(result.success).toBe(false);
  });
});
