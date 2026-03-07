# Project structure
```
anima-sheet/
│
├── docs/                                   # Project documentation
│   ├── project-tree.md
│   ├── requirements.md
│   └── architecture.md
│   └── tasking.md
│
├── src-tauri/                              # Wrapper process (Rust)
│   ├── src/
│   │   ├── main.rs                         # Entry point, window setup, CLI argument handling
│   │   └── commands/                       # Tauri command handlers
│   │       ├── mod.rs
│   │       ├── file.rs                     # save_file, open_file, list_catalog_dir
│   │       └── os.rs                       # File extension registration
│   ├── Cargo.toml
│   └── tauri.conf.json                     # Permissions, bundle config, file association
│
├── src/                                    # Frontend process (Svelte + TypeScript)
│   ├── lib/
│   │   ├── engine/                         # Rules engine — no UI dependencies
│   │   │   ├── formulas.ts                 # Derived value computations
│   │   │   ├── tables.ts                   # Table lookups (Resistance, Modifiers, etc.)
│   │   │   ├── dp.ts                       # DP cost resolution per category
│   │   │   └── modifiers.ts               # Modifier lifecycle: resolve, apply, evaluate
│   │   ├── schema/                         # Zod schemas and inferred types
│   │   │   ├── character.ts                # AttributeSchema, CharacterSchema, inferred types
│   │   │   └── catalog.ts                  # CatalogSchema + catalog entry types
│   │   ├── stores/                         # Svelte reactive stores (app state)
│   │   │   ├── character.ts                # Active character state
│   │   │   └── catalogs.ts                 # In-memory loaded catalogs
│   │   └── i18n/                           # Localization
│   │       ├── en.json
│   │       └── es.json
│   ├── components/                         # Svelte UI components
│   │   ├── sheet/                          # Character sheet sections
│   │   │   ├── Identity.svelte
│   │   │   ├── PrimaryStats.svelte
│   │   │   ├── SecondaryStats.svelte
│   │   │   ├── Abilities.svelte
│   │   │   └── Lore.svelte                 # Background, history, images
│   │   ├── shared/                         # Reusable UI primitives
│   │   │   ├── NumericInput.svelte
│   │   │   ├── Dropdown.svelte
│   │   │   ├── MarkdownEditor.svelte
│   │   │   └── ModifierList.svelte         # Displays base/temporary modifier arrays
│   │   └── layout/
│   │       ├── MenuBar.svelte
│   │       └── PrintView.svelte
│   ├── App.svelte
│   └── main.ts
│
├── data/                                   # Base content catalogs (shipped with the app)
│   ├── categories.json                     # All playable categories with DP costs
│   ├── races.json
│   ├── weapons.json
│   ├── secondary-abilities.json
│   └── rules/                              # Computation rules (formulas, tables)
│       ├── derived-stats.json
│       └── resistance-tables.json
│
├── tools/                                  # Standalone utilities (not part of the app bundle)
│   └── xlsx-migrator/                      # Backlog — legacy .xlsx conversion utility
│       └── README.md                       # Placeholder documenting the future scope
│
├── tests/
│   ├── engine/                             # Unit tests for the rules engine
│   │   ├── formulas.test.ts
│   │   ├── modifiers.test.ts               # Effective value vs. requirement value resolution
│   │   └── dp.test.ts
│   └── schema/                             # Validation tests for schemas and catalogs
│       ├── character.test.ts
│       └── catalog.test.ts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```