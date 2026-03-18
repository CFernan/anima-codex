import { type CombateCatalog, CombateCatalogSchema } from "$lib/schema/catalog/combat";
import { type SecundariasCatalog, SecundariasCatalogSchema } from "$lib/schema/catalog/secondaryAbilities";
import { type CategoriasCatalog, CategoriasCatalogSchema }  from "$lib/schema/catalog/category";
import { CombateBaseCatalog }      from "$lib/catalogs/combat";
import { SecundariasBaseCatalog }  from "$lib/catalogs/secondaryAbilities";
import { CategoriasBaseCatalog }   from "$lib/catalogs/categories";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CatalogError {
  catalog: string;
  entry?:  string;
  message: string;
}

export interface Catalogs {
  combate:     CombateCatalog;
  secundarias: SecundariasCatalog;
  categorias:  CategoriasCatalog;
  errors:      CatalogError[];
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function loadBaseCatalogs(): Catalogs {
  const errors: CatalogError[] = [];

  const combate = CombateCatalogSchema.safeParse(CombateBaseCatalog);
  if (!combate.success) errors.push({
    catalog: "combate",
    message: combate.error.issues.map(i => i.message).join(", "),
  });

  const secundarias = SecundariasCatalogSchema.safeParse(SecundariasBaseCatalog);
  if (!secundarias.success) errors.push({
    catalog: "secundarias",
    message: secundarias.error.issues.map(i => i.message).join(", "),
  });

  const categorias = CategoriasCatalogSchema.safeParse(CategoriasBaseCatalog);
  if (!categorias.success) errors.push({
    catalog: "categorias",
    message: categorias.error.issues.map(i => i.message).join(", "),
  });

  return {
    combate:     combate.success     ? combate.data     : {} as CombateCatalog,
    secundarias: secundarias.success ? secundarias.data : {} as SecundariasCatalog,
    categorias:  categorias.success  ? categorias.data  : {} as CategoriasCatalog,
    errors,
  };
}


// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export const CatalogIndex: Catalogs = loadBaseCatalogs();
