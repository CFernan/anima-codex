import { describe, it } from "vitest";
import {
  CombatInvestmentSchema,
  CombatPDCostSchema,
  CombatRuleDefinitionSchema,
  CombatRuleCatalogSchema,
} from "$lib/schema/combat";
import { assertValid, assertInvalid } from "../helpers/test-helpers";

const validPDAttribute = { pd: 0 };

const validCombatInvestment = {
  habilidad_ataque:  validPDAttribute,
  habilidad_parada:  validPDAttribute,
  habilidad_esquiva: validPDAttribute,
  llevar_armadura:   validPDAttribute,
};

const validCombatCosts = {
  habilidad_ataque:  2,
  habilidad_parada:  2,
  habilidad_esquiva: 2,
  llevar_armadura:   2,
};

const validCombatCatalog = {
  habilidad_ataque:  { nombre: "Habilidad de Ataque",  caracteristica: "des" },
  habilidad_parada:  { nombre: "Habilidad de Parada",  caracteristica: "des" },
  habilidad_esquiva: { nombre: "Habilidad de Esquiva", caracteristica: "agi" },
  llevar_armadura:   { nombre: "Llevar Armadura",      caracteristica: "fue" },
};

// ---------------------------------------------------------------------------
// CombatInvestmentSchema
// ---------------------------------------------------------------------------

describe("CombatInvestmentSchema", () => {
  it("accepts a valid investment", () => {
    assertValid(CombatInvestmentSchema.safeParse(validCombatInvestment));
  });

  it("fails when a skill is missing", () => {
    const { habilidad_ataque, ...rest } = validCombatInvestment;
    assertInvalid(CombatInvestmentSchema.safeParse(rest), "habilidad_ataque is required");
  });

  it("fails when pd is negative", () => {
    assertInvalid(
      CombatInvestmentSchema.safeParse({
        ...validCombatInvestment,
        habilidad_ataque: { pd: -5 },
      }),
      "pd must be non-negative",
    );
  });

  it("accepts pd of zero", () => {
    assertValid(CombatInvestmentSchema.safeParse(validCombatInvestment));
  });

  it("accepts modifiers on a skill", () => {
    assertValid(CombatInvestmentSchema.safeParse({
      ...validCombatInvestment,
      habilidad_ataque: {
        pd: 10,
        modificadores_temporales: [{ valor: 5, fuente: "Bono arma" }],
      },
    }));
  });
});

// ---------------------------------------------------------------------------
// CombatPDCostSchema
// An object keyed by BasicCombatEnum — not a scalar.
// ---------------------------------------------------------------------------

describe("CombatPDCostSchema", () => {
  it("accepts valid costs for all skills", () => {
    assertValid(CombatPDCostSchema.safeParse(validCombatCosts));
  });

  it("fails when a skill cost is missing", () => {
    const { habilidad_ataque, ...rest } = validCombatCosts;
    assertInvalid(CombatPDCostSchema.safeParse(rest), "habilidad_ataque is required");
  });

  it("fails when a skill cost is zero", () => {
    assertInvalid(
      CombatPDCostSchema.safeParse({ ...validCombatCosts, habilidad_ataque: 0 }),
      "cost must be positive",
    );
  });

  it("fails when a skill cost is negative", () => {
    assertInvalid(
      CombatPDCostSchema.safeParse({ ...validCombatCosts, llevar_armadura: -1 }),
      "cost must be positive",
    );
  });

  it("fails when a skill cost is not an integer", () => {
    assertInvalid(
      CombatPDCostSchema.safeParse({ ...validCombatCosts, habilidad_parada: 1.5 }),
      "cost must be an integer",
    );
  });
});

// ---------------------------------------------------------------------------
// CombatRuleDefinitionSchema
// ---------------------------------------------------------------------------

describe("CombatRuleDefinitionSchema", () => {
  it("accepts a valid definition", () => {
    assertValid(CombatRuleDefinitionSchema.safeParse({ nombre: "Ataque", caracteristica: "des" }));
  });

  it("fails when nombre is missing", () => {
    assertInvalid(CombatRuleDefinitionSchema.safeParse({ caracteristica: "des" }), "nombre is required");
  });

  it("fails when caracteristica is invalid", () => {
    assertInvalid(
      CombatRuleDefinitionSchema.safeParse({ nombre: "Ataque", caracteristica: "xyz" }),
      "caracteristica must be a valid characteristic key",
    );
  });

  it("accepts all valid caracteristica values", () => {
    for (const c of ["agi", "con", "des", "fue", "int", "per", "pod", "vol"]) {
      assertValid(CombatRuleDefinitionSchema.safeParse({ nombre: "Skill", caracteristica: c }));
    }
  });
});

// ---------------------------------------------------------------------------
// CombatRuleCatalogSchema
// ---------------------------------------------------------------------------

describe("CombatRuleCatalogSchema", () => {
  it("accepts a valid catalog", () => {
    assertValid(CombatRuleCatalogSchema.safeParse(validCombatCatalog));
  });

  it("fails when a required skill is missing", () => {
    const { habilidad_parada, ...rest } = validCombatCatalog;
    assertInvalid(CombatRuleCatalogSchema.safeParse(rest), "habilidad_parada is required");
  });

  it("fails when a definition has invalid caracteristica", () => {
    assertInvalid(
      CombatRuleCatalogSchema.safeParse({
        ...validCombatCatalog,
        habilidad_ataque: { nombre: "Ataque", caracteristica: "fuerza" },
      }),
      "caracteristica must be a valid characteristic key",
    );
  });
});
