import { describe, it, expect } from "vitest";
import { CombatCatalogSchema } from "../../../src/lib/schema/combat";
import { SecondaryCatalogSchema } from "../../../src/lib/schema/secondary";
import { defaultCombatCatalog, defaultSecondaryCatalog } from "../../../src/lib/data/defaultCatalog";

// ---------------------------------------------------------------------------
// Combat catalog tests
// ---------------------------------------------------------------------------

describe("defaultCombatCatalog", () => {
  it("passes CombatCatalogSchema validation", () => {
    const result = CombatCatalogSchema.safeParse(defaultCombatCatalog);
    expect(result.success).toBe(true);
  });

  it("contains all required combat skills", () => {
    const result = CombatCatalogSchema.safeParse(defaultCombatCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.habilidad_ataque).toBeDefined();
      expect(result.data.habilidad_parada).toBeDefined();
      expect(result.data.habilidad_esquiva).toBeDefined();
      expect(result.data.llevar_armadura).toBeDefined();
    }
  });

  it("all combat skills have a valid caracteristica", () => {
    const result = CombatCatalogSchema.safeParse(defaultCombatCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      const validCaracteristicas = ["agi", "con", "des", "fue", "int", "per", "pod", "vol"];
      for (const skill of Object.values(result.data)) {
        if (skill && typeof skill === "object" && "caracteristica" in skill) {
          expect(validCaracteristicas).toContain(skill.caracteristica);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Secondary catalog tests
// ---------------------------------------------------------------------------

describe("defaultSecondaryCatalog", () => {
  it("passes SecondaryCatalogSchema validation", () => {
    const result = SecondaryCatalogSchema.safeParse(defaultSecondaryCatalog);
    expect(result.success).toBe(true);
  });

  it("contains all required skill groups", () => {
    const result = SecondaryCatalogSchema.safeParse(defaultSecondaryCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.atleticas).toBeDefined();
      expect(result.data.sociales).toBeDefined();
      expect(result.data.perceptivas).toBeDefined();
      expect(result.data.intelectuales).toBeDefined();
      expect(result.data.vigor).toBeDefined();
      expect(result.data.subterfugio).toBeDefined();
      expect(result.data.creativas).toBeDefined();
    }
  });

  it("conocimiento defaults to false when omitted", () => {
    const result = SecondaryCatalogSchema.safeParse(defaultSecondaryCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      // montar does not specify conocimiento — should default to false
      expect(result.data.atleticas.montar.conocimiento).toBe(false);
      // animales does not specify conocimiento — should default to false
      expect(result.data.intelectuales.animales.conocimiento).toBe(false);
    }
  });

  it("penalizador_armadura defaults to ninguno when omitted", () => {
    const result = SecondaryCatalogSchema.safeParse(defaultSecondaryCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      // montar does not specify penalizador_armadura — should default to ninguno
      expect(result.data.atleticas.montar.penalizador_armadura).toBe("ninguno");
      // etiqueta does not specify penalizador_armadura — should default to ninguno
      expect(result.data.sociales.etiqueta.penalizador_armadura).toBe("ninguno");
    }
  });

  it("conocimiento skills are correctly marked", () => {
    const result = SecondaryCatalogSchema.safeParse(defaultSecondaryCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intelectuales.ciencia.conocimiento).toBe(true);
      expect(result.data.intelectuales.historia.conocimiento).toBe(true);
      expect(result.data.intelectuales.medicina.conocimiento).toBe(true);
      expect(result.data.intelectuales.tasacion.conocimiento).toBe(true);
      expect(result.data.intelectuales.v_magica.conocimiento).toBe(true);
      expect(result.data.subterfugio.venenos.conocimiento).toBe(true);
      expect(result.data.creativas.baile.conocimiento).toBe(true);
      expect(result.data.creativas.forja.conocimiento).toBe(true);
      expect(result.data.creativas.musica.conocimiento).toBe(true);
    }
  });

  it("armor penalties are correctly assigned", () => {
    const result = SecondaryCatalogSchema.safeParse(defaultSecondaryCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      // reducible
      expect(result.data.atleticas.acrobacias.penalizador_armadura).toBe("reducible");
      expect(result.data.atleticas.atletismo.penalizador_armadura).toBe("reducible");
      expect(result.data.atleticas.trepar.penalizador_armadura).toBe("reducible");
      expect(result.data.atleticas.saltar.penalizador_armadura).toBe("reducible");
      expect(result.data.vigor.p_fuerza.penalizador_armadura).toBe("reducible");
      expect(result.data.subterfugio.ocultarse.penalizador_armadura).toBe("reducible");
      expect(result.data.creativas.baile.penalizador_armadura).toBe("reducible");
      // reducible_hasta_mitad
      expect(result.data.subterfugio.sigilo.penalizador_armadura).toBe("reducible_hasta_mitad");
      // no_reducible
      expect(result.data.atleticas.nadar.penalizador_armadura).toBe("no_reducible");
      // percepcion
      expect(result.data.perceptivas.advertir.penalizador_armadura).toBe("percepcion");
      expect(result.data.perceptivas.buscar.penalizador_armadura).toBe("percepcion");
      expect(result.data.perceptivas.rastrear.penalizador_armadura).toBe("percepcion");
    }
  });

  it("all skills have a valid caracteristica", () => {
    const result = SecondaryCatalogSchema.safeParse(defaultSecondaryCatalog);
    expect(result.success).toBe(true);
    if (result.success) {
      const validCaracteristicas = ["agi", "con", "des", "fue", "int", "per", "pod", "vol"];
      for (const group of Object.values(result.data)) {
        if (group && typeof group === "object") {
          for (const skill of Object.values(group)) {
            if (skill && typeof skill === "object" && "caracteristica" in skill) {
              expect(validCaracteristicas).toContain(skill.caracteristica);
            }
          }
        }
      }
    }
  });
});
