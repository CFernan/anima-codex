import type { CombateCatalogInput } from "$lib/schema/catalog/combat";

// ---------------------------------------------------------------------------
// Base catalogs
// ---------------------------------------------------------------------------
export const CombateBaseCatalog : CombateCatalogInput = {
  habilidad_de_ataque:  { nombre: "Habilidad de Ataque",  caracteristica: "des" },
  habilidad_de_parada:  { nombre: "Habilidad de Parada",  caracteristica: "des" },
  habilidad_de_esquiva: { nombre: "Habilidad de Esquiva", caracteristica: "agi" },
  llevar_armadura:      { nombre: "Llevar Armadura",      caracteristica: "fue" },
};
