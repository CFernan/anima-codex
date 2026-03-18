import { describe, it } from "vitest";
import { CombateCatalogSchema }             from "$lib/schema/catalog/combat";
import { CombateBaseCatalog }               from "$lib/catalogs/combat";
import { SecundariasInversionBaseSchema }   from "$lib/catalogs/secondaryAbilities";
import { SecundariasBaseCatalog }           from "$lib/catalogs/secondaryAbilities";
import { CategoriasInversionBaseSchema }    from "$lib/catalogs/categories";
import { CategoriasBaseCatalog }            from "$lib/catalogs/categories";
import { assertValid }                      from "../helpers/test-helpers";


describe("CombateBaseCatalog", () => {
  it("passes CombateCatalogSchema", () =>
    assertValid(CombateCatalogSchema.safeParse(CombateBaseCatalog)));
});

describe("SecundariasBaseCatalog", () => {
  it("passes secundariasInversionBaseSchema", () =>
    assertValid(SecundariasInversionBaseSchema.safeParse(SecundariasBaseCatalog)));
});

describe("CategoriasBaseCatalog", () => {
  it("passes categoriasInversionBaseSchema", () =>
    assertValid(CategoriasInversionBaseSchema.safeParse(CategoriasBaseCatalog)));
});
