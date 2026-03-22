# Tasking: Anima Codex — Character Sheet App
**Version:** 1.3
**Status:** In Progress
**Related to:** Requirements v3.1 · Architecture v1.4

---

## Conventions

Each user story follows this structure:
- **As a** [user] **I want** [capability] **so that** [value].
- **Acceptance Criteria** — verifiable, implementation-agnostic conditions.
- **Technical Tasks** — concrete implementation steps derived from the architecture.
- **Priority** — MoSCoW label inherited from the requirements.
- **Dependencies** — other stories that must be completed first.

### Progress Labels

| Label | Meaning |
|---|---|
| 🔲 Not started | Work has not begun. |
| 🔄 In progress | Actively being implemented. |
| ✅ Done | All acceptance criteria met and committed. |
| ⏸ Blocked | Cannot proceed due to an unresolved dependency or issue. |
| ✖️ Cancelled | Won't be finished. |

---

## Suggested order of implementation

- ✅ US-01  Project bootstrap
- ✅ US-02  File extension registration
- ✅ US-03  Character schema definition         ← superseded, see note
- ✖️ US-04  Catalog schema definition           ← superseded, see note
- ✅ US-05  Base content catalogs
- 🔲 US-07  Composite attribute resolution
- 🔲 US-08  Primary characteristic modifier table and combat
- 🔲 US-09  Derived stat computation
- 🔲 US-10  DP cost resolution
- 🔲 US-11  Automatic modifier lifecycle
- 🔲 US-06  Base content catalogs leftovers
- 🔲 US-27  English and Spanish UI              ← before any UI component
- 🔲 US-18  Character store & reactive engine integration
- 🔲 US-12  New character
- 🔲 US-13  Open and save character files
- 🔲 US-14  Unsaved changes guard
- 🔲 US-28  Schema version compatibility
- 🔲 US-29  Crash-safe file loading
- 🔲 US-34  Computed value drift detection
- 🔲 US-16  Character identity section
- 🔲 US-17  Primary characteristics section
- 🔲 US-19  Derived stats section
- 🔲 US-20  Category selection & DP budget
- 🔲 US-21  Secondary abilities & combat abilities
- 🔲 US-22  Description & free-text fields
- 🔲 US-23  Numeric input validation
- 🔲 US-25  Print view
- 🔲 US-26  PDF export
- 🔲 US-30  Automatic backup on save
- 🔲 US-15  Recent files
- 🔲 US-33  Hot catalog — load catalogo_local from opened .acx
- 🔲 US-24  Custom content directory
- 🔲 US-31  Auto-save
- 🔲 US-32  Multiplatform CI/CD pipeline

---

## Epic 1 — Project Scaffolding

### ✅ US-01 · Project bootstrap
**As a** developer
**I want** a working project skeleton with all tooling configured
**so that** I can start implementing features without setup friction.

**Priority:** MUST
**Dependencies:** none

**Acceptance Criteria:**
- The project compiles and launches an empty window on Windows.
- TypeScript strict mode is enabled and enforced.
- The frontend dev server hot-reloads on file save.
- A `README.md` exists with instructions to install dependencies and run the project in development mode.
- The project produces a valid installable executable on Windows via `npm run tauri build`.

**Technical Tasks:**
- ✅ Initialise a Tauri + Svelte + TypeScript project using the official Tauri CLI scaffold.
- ✅ Configure `tsconfig.json` with `strict: true`.
- ✅ Configure `vite.config.ts` for the Svelte frontend.
- ✅ Set up the directory structure as defined in `docs/architecture.md`.
     Note: folders will be created organically as each US is implemented,
     rather than as empty placeholders.
- ✅ Create placeholder files for all modules defined in the project tree.
     Note: superseded by above decision. Structure documented in README.md.
- ✅ Add `docs/requirements.md` and `docs/architecture.md` to the repository.
- ✅ Write the initial `README.md` with setup and run instructions.
- ✅ Verify the project builds a release executable on Windows.
- ✅ Design and set the application icon for all required sizes and platforms.

---

### ✅ US-02 · File extension registration
**As a** user
**I want** `.acx` files to be associated with the application in my operating system
**so that** I can open character files by double-clicking them.

**Priority:** MUST
**Dependencies:** US-01

**Acceptance Criteria:**
- Double-clicking an `.acx` file on Windows launches the application and opens the file in a new tab.
- If the application is already running, double-clicking an `.acx` file opens it in a new tab in the existing window.
- If the file is already open in a tab, that tab is focused instead of opening a duplicate.
- If the file path is passed as a CLI argument, the application opens that file in a new tab on startup.

**Technical Tasks:**
- ✅ Declare the `.acx` file association in `tauri.conf.json` under the `bundle > fileAssociations` key.
- ✅ Install and configure `tauri-plugin-single-instance` to detect subsequent invocations and forward the file path to the running instance.
- ✅ Implement a Tauri event handler in `src-tauri/src/lib.rs` that receives the file path from the single-instance plugin and emits it to the frontend.
- ✅ Implement the frontend event listener that opens the received file path in a new tab, or focuses the existing tab if already open.
  Note: currently appends file paths to a list — tab management pending US-18.
- ✅ Handle the case where no argument is provided (show start screen with a blank character tab).

### 🔲 US-32 · Multiplatform CI/CD pipeline
**As a** developer
**I want** an automated build pipeline that compiles and packages the application
for Windows, Linux, and macOS
**so that** releases are produced for all platforms without requiring native machines
for each operating system.

**Priority:** COULD
**Dependencies:** US-01

**Acceptance Criteria:**
- A GitHub Actions workflow triggers on push to `main` and on version tags.
- The workflow produces a valid installable artifact for Windows (.msi or .exe).
- The workflow produces a valid installable artifact for Linux (.deb or .AppImage).
- The workflow produces a valid installable artifact for macOS (.dmg).
- All three builds must pass before a release is published.
- Build artifacts are attached to the GitHub Release automatically.

**Technical Tasks:**
- 🔲 Create `.github/workflows/release.yml` using the official `tauri-apps/tauri-action`.
- 🔲 Configure the workflow with runners: `windows-latest`, `ubuntu-latest`, `macos-latest`.
- 🔲 Configure Node.js and Rust toolchain setup steps for each runner.
- 🔲 Configure artifact upload per platform.
- 🔲 Test the pipeline by pushing a test tag and verifying all three artifacts.

---

## Epic 2 — Data Layer

### ✅ US-03 · Character schema definition
**As a** developer
**I want** a formally defined and versioned character schema
**so that** all character data has a guaranteed shape throughout the application.

> **Note:** This US was completed under a previous design. The schema has since
> been fully redesigned. The current implementation lives in `src/lib/schema/acx/`
> and `src/lib/schema/common/` as documented in `docs/architecture.md` §5.1 and
> the normative schema in `docs/acx_schema.yaml`. The acceptance criteria below
> reflect the new design.

**Priority:** MUST
**Dependencies:** US-01

**Acceptance Criteria:**
- `CharacterSchema` is defined in `src/lib/schema/acx/character.ts`.
- The schema includes `metadata.__version_schema`.
- The schema structure matches `docs/acx_schema.yaml` exactly.
- The `.acx` file is structured as three top-level sections: `metadata`, `personaje`, and `catalogo_local`.
- Engine-writable fields (`__` prefix) are optional in the schema to allow loading files where the engine has not yet run.
- Schemas are split across `src/lib/schema/common/` (shared primitives) and `src/lib/schema/acx/` (character file shape).
- All TypeScript types are inferred from schemas (`z.infer`/`z.input`), with no manually duplicated type definitions.
- Exported variable naming convention: uppercase first letter if exported, lowercase if not.
- Unit tests cover schema validation for representative `.acx` files.

**Technical Tasks:**
- ✅ Define complete normative schema of .acx format (`docs/acx_schema.yaml`).
- ✅ Implement schema under `src/lib/schema/acx` and `src/lib/schema/common` for global usages.
- ✅ Add unit tests for example .acx files.

---

### ✖️ US-04 · Catalog schema definition
**As a** developer
**I want** formally defined schemas for game content catalogs
**so that** base content and custom extensions can be validated consistently.

> **Note:** This US was completed under a previous design. Catalog schemas are
> now being redesigned to live in `src/lib/schema/catalog/` as documented in
> `docs/architecture.md` §5.5. The old schemas in `src/lib/schema/` are
> superseded. Tasks below reflect the new design.

**Priority:** MUST
**Dependencies:** US-03

**Acceptance Criteria:**
- Catalog schemas live in `src/lib/schema/catalog/`.
- Schemas define validation contracts for both base and custom content — the same schema validates both.
- Catalog schemas depend on `schema/common/` primitives but not on `schema/acx/`.
- All types inferred from schemas with no manual duplication.
- Unit tests cover schema validation.

**Technical Tasks:**
- 🔲 Define complete pseudo-schema of catalogs format.
- 🔲 Implement pseudo-schema under `src/lib/schema/catalog`. If needed, move common components from `src/lib/schema/acx` to `src/lib/schema/common`.

**Cancellation reason:**
Catalog schemas are being created on demand alongside base catalogs, done in US-05 and future US.

---

### ✅ US-05 · Base content catalogs
**As a** developer
**I want** the base game content available as validated data
**so that** it is decoupled from application logic and can be extended.

**Priority:** MUST
**Dependencies:** US-04

**Acceptance Criteria:**
- `src/lib/catalogs/` contains the full official Anima: Beyond Fantasy base catalogs for combat skills, secondary skills, and categories.
- All entries satisfy their catalog schemas via `satisfies z.input<typeof ...>`.
- All entries validated against their schemas via unit tests.
- The application initialises the catalog store at startup from bundled data — no disk read required for base content.
- Missing or malformed catalog entries are reported without crashing the app.

**Technical Tasks:**
- ✅ Implement base combat and secondary skill catalogs in `src/lib/catalogs/`.
- ✅ Implement base category catalog with all 20 official categories in `src/lib/catalogs/`.
- ✅ Write unit tests covering schema validation and structural invariants.
- ✅ Implement `schema/catalog/` schemas (US-04) and apply `satisfies` to all data files.
- ✅ Expose base catalogs as a module-level constant in `src/lib/catalogs/index.ts`.
- ✅ Handle malformed catalog entries gracefully — log error, continue loading remainder.

---

### 🔄 US-06 · Base content catalogs leftovers
**As a** developer
**I want** the base game content leftovers available as validated data
**so that** it is decoupled from application logic and can be extended.

**Priority:** MUST
**Dependencies:** US-04, US-05

**Acceptance Criteria:**
- `src/lib/catalogs/` contains the full official Anima: Beyond Fantasy base catalogs for basic advantages, disadvantages, and weapons.
- All entries satisfy their catalog schemas via `satisfies z.input<typeof ...>`.
- All entries validated against their schemas via unit tests.
- The application initialises the catalog store at startup from bundled data — no disk read required for base content.

**Technical Tasks:**
- 🔲 Implement base advantages and disadvantages catalogs in `src/lib/catalogs/`.
- 🔲 Implement base weapons catalog in `src/lib/catalogs/`.
- 🔲 Write unit tests covering schema validation and structural invariants.
- 🔲 Implement `schema/catalog/` schemas (US-04) and apply `satisfies` to all data files.
- 🔲 Update catalog store in `src/lib/stores/catalogs.ts` initialised from bundled data.

---

## Epic 3 — Rules Engine

### 🔲 US-07 · Composite attribute resolution
**As a** developer
**I want** a module that computes the full result structure for any composite attribute
**so that** the distinction between user input, permanent modifiers, and temporary modifiers
is enforced consistently and the engine-written `__` fields are always up to date.

**Priority:** MUST
**Dependencies:** US-03

**Acceptance Criteria:**
- `computeAttributeResults(attr: FlexibleAttribute): AttributeResults` returns an object with:
  - `__base_calculada` — derived from `base` directly (for `DirectAttribute`) or via PD conversion table (for `PDAttribute`). Zero for `ComputedAttribute`.
  - `__final_base` — `__base_calculada + sum(modificadores_base)`. Used for requirement evaluation.
  - `__final_temporal` — `__final_base + sum(modificadores_temporales)`. The value displayed in the UI.
- Both modifier arrays may be empty or absent; the function handles all cases correctly.
- Negative modifier values are supported.
- `addModifier(attr, modifier, type: 'base' | 'temporal'): FlexibleAttribute` appends a modifier entry to the correct array.
- `removeModifier(attr, fuente): FlexibleAttribute` removes all modifier entries with the given source from both arrays.
- Unit tests cover all three attribute types, empty arrays, negative modifiers, and boundary values.

**Technical Tasks:**
- 🔲 Implement `computeAttributeResults` in `src/lib/engine/attributes.ts`, handling `DirectAttribute`, `PDAttribute`, and `ComputedAttribute`.
- 🔲 Implement `addModifier` and `removeModifier` in the same module.
- 🔲 Write unit tests in `tests/engine/attributes.test.ts`.

---

### 🔲 US-08 · Primary characteristic modifier table
**As a** developer
**I want** the engine to compute the Characteristic Modifier for any primary stat value
**so that** all derived stats that depend on it are calculated correctly.

**Priority:** MUST
**Dependencies:** US-07

**Acceptance Criteria:**
- `characteristicModifier(value: number): number` returns the correct modifier for any valid characteristic value according to Anima's table.
- The table is defined as a TypeScript constant in `src/lib/engine/tables.ts`, not read from an external file.
- The function handles values at table boundaries correctly.

**Technical Tasks:**
- 🔲 Implement `characteristicModifier` in `src/lib/engine/tables.ts` using a hardcoded lookup table.
- 🔲 Write unit tests covering all representative values and boundary cases.

---

### 🔲 US-09 · Derived stat computation
**As a** developer
**I want** the engine to compute all derived stats from primary characteristics
**so that** the UI can display them reactively.

**Priority:** MUST
**Dependencies:** US-07, US-08

**Acceptance Criteria:**
- The engine computes all derived stats in scope: Characteristic Modifiers, Movement, Initiative, all Resistance values, Life Points.
- Derived stats use `__final_base` (not `__final_temporal`) of primary characteristics as their input, unless a specific rule states otherwise.
- All Anima-specific rounding rules are applied correctly.
- Computed values are consistent with the reference `.xlsx` sheet for the same inputs.
- `DerivedStats` is a TypeScript type in `src/lib/engine/types.ts` representing the in-memory computation result — it is not a Zod schema.

**Technical Tasks:**
- 🔲 Define `DerivedStats` type in `src/lib/engine/types.ts`.
- 🔲 Implement `computeDerivedStats(character: Character, catalogs: Catalogs): DerivedStats` in `src/lib/engine/formulas.ts`.
- 🔲 Implement resistance table lookups in `src/lib/engine/tables.ts` as TypeScript constants.
- 🔲 Write unit tests in `tests/engine/formulas.test.ts` covering each derived stat with known input/output pairs validated against the reference sheet.

---

### 🔲 US-10 · DP cost resolution
**As a** developer
**I want** the engine to compute the DP cost of any ability for the active character's category
**so that** the sheet can enforce point limits and display costs correctly.

**Priority:** MUST
**Dependencies:** US-05, US-07

**Acceptance Criteria:**
- `dpCost(abilityId: string, categoryId: string, catalogs: Catalogs): number` returns the correct cost.
- `totalDpSpent(character: Character, catalogs: Catalogs): number` returns the sum of all spent DP across all categories.
- `remainingDp(character: Character, catalogs: Catalogs): number` returns available DP for the current level.
- The engine reads costs from the catalog; no cost is hard-coded.
- Multiclass characters compute DP correctly across all their categories.

**Technical Tasks:**
- 🔲 Implement the three functions in `src/lib/engine/dp.ts`.
- 🔲 Write unit tests in `tests/engine/dp.test.ts` covering: correct cost per category, total spent across multiple categories, remaining DP, zero-cost abilities.

---

### 🔲 US-11 · Automatic modifier lifecycle
**As a** developer
**I want** the engine to automatically compute and apply modifiers when their source values change
**so that** race bonuses, category bonuses, and similar effects are always in sync with the sheet.

**Priority:** MUST
**Dependencies:** US-07, US-05

**Acceptance Criteria:**
- Race and category bonuses are computed from the catalog at runtime and written into `modificadores_base` as entries with `__automatico: true`.
- Automatic modifier entries are always recomputed from scratch on load and never trusted from the persisted file — the engine overwrites them entirely.
- When the character's race or category changes, all automatic modifiers are recomputed from the updated catalog entry.
- Manual modifiers (entries without `__automatico: true`) are never removed or altered by the engine.
- The engine produces the final modifier list by replacing all previous automatic entries with freshly computed ones and preserving all manual entries.
- Malformed catalog entries are handled gracefully — logged, skipped, no crash.

**Technical Tasks:**
- 🔲 Implement `computeRaceModifiers(raceId: string, catalogs: Catalogs): AttributeModifier[]` in `src/lib/engine/modifiers.ts`.
- 🔲 Implement `computeCategoryModifiers(categories: InversionPDs[], catalogs: Catalogs): AttributeModifier[]`.
- 🔲 Implement `mergeModifiers(manual: AttributeModifier[], automatic: AttributeModifier[]): AttributeModifier[]` — replaces all `__automatico: true` entries with the new automatic set, preserving all manual entries.
- 🔲 Wire these functions into the derived store (US-18) so they are recomputed reactively.
- 🔲 Write unit tests covering: correct bonus values per race/category, manual modifiers preserved, changes to race/category produce updated automatic modifiers, malformed catalog entries skipped gracefully.

---

## Epic 4 — File Management

### 🔲 US-12 · New character
**As a** user
**I want** to create a blank character sheet
**so that** I can start building a new character from scratch.

**Priority:** MUST
**Dependencies:** US-03, US-05

**Acceptance Criteria:**
- `File > New` opens a new tab with a blank character sheet at default values.
- Default values are defined in the schema, not in the UI component.
- The new tab has no associated file path (it is "unsaved").
- The unsaved changes indicator is shown immediately on the new tab.
- The new tab becomes the active tab automatically.

**Technical Tasks:**
- 🔲 Implement `defaultCharacter(): Character` in `src/lib/schema/acx/character.ts`.
- 🔲 Implement the `File > New` menu action in `MenuBar.svelte`.
- 🔲 Implement `openNewTab(character, filePath): void` in the app store —
  appends a new tab to the tabs array and sets it as active.
- 🔲 Connect `File > New` to `openNewTab(defaultCharacter(), null)`.

---

### 🔲 US-13 · Open and save character files
**As a** user
**I want** to open an existing character file and save my current character to disk
**so that** my work persists between sessions.

**Priority:** MUST
**Dependencies:** US-03, US-05

**Acceptance Criteria:**
- `File > Open` shows a native file picker filtered to `.acx` files.
- After selection, the file is opened in a new tab. If already open, that tab is focused.
- If the file is invalid, a descriptive error is shown and no new tab is opened.
- `File > Save` writes `metadata`, `personaje`, and `catalogo_local` as pretty-printed JSON (2-space indent) to the associated file path. All engine-computed `__` fields are included as a snapshot of the current session.
- `File > Save As` shows a native save dialog and writes to the chosen path, updating the active tab's file path.
- After a successful save, the active tab's unsaved changes indicator is cleared.
- `Ctrl+S` triggers Save. `Ctrl+Shift+S` triggers Save As.

**Technical Tasks:**
- 🔲 Implement Tauri commands in `src-tauri/src/commands/file.rs`: `open_file_dialog`, `read_file`, `save_file_dialog`, `write_file`.
- 🔲 Implement file loading logic: invoke `open_file_dialog`, read content, validate `personaje` with `CharacterSchema`, invoke `openNewTab` or focus existing tab.
- 🔲 Implement duplicate detection: before opening, check if the file path is already present in any tab's `currentFilePath`.
- 🔲 Implement file saving logic: serialise with `JSON.stringify(data, null, 2)`, invoke `write_file`, update tab's `currentFilePath` and `isDirty`.
- 🔲 Implement keyboard shortcut handlers in the layout component.

---

### 🔲 US-14 · Unsaved changes guard
**As a** user
**I want** to be warned before losing unsaved changes
**so that** I never accidentally discard work.

**Priority:** MUST
**Dependencies:** US-13

**Acceptance Criteria:**
- Each tab displays an unsaved changes indicator when `isDirty` is true.
- Attempting to close a tab with unsaved changes shows a confirmation dialog
  with options: Save, Discard, Cancel.
- Attempting to close the application while any tab has unsaved changes shows
  a confirmation dialog for each affected tab in sequence.
- "Save" triggers the save flow before closing the tab.
- "Discard" closes the tab without saving.
- "Cancel" aborts the action and returns to the current state.

**Technical Tasks:**
- 🔲 Implement `isDirty` per tab in the app store, set to `true` on any character state mutation and `false` after a successful save.
- 🔲 Implement tab close button with unsaved changes indicator.
- 🔲 Implement `UnsavedChangesDialog.svelte` invoked on tab close.
- 🔲 Implement the `beforeunload` Tauri hook to iterate over all dirty tabs and invoke the dialog for each before allowing the window to close.
- 🔲 Expose `guardTabClose(tabId): Promise<'save' | 'discard' | 'cancel'>` utility used by tab close and window close flows.

---

### 🔲 US-15 · Recent files
**As a** user
**I want** quick access to recently opened character files
**so that** I can resume work without navigating the file system.

**Priority:** SHOULD
**Dependencies:** US-13

**Acceptance Criteria:**
- The last 10 opened or saved file paths are stored persistently.
- `File > Recent Files` shows a submenu with the stored paths.
- Clicking an entry opens the file (with the unsaved changes guard).
- If a file in the list no longer exists, it is shown as unavailable and removed from the list on next access.

**Technical Tasks:**
- 🔲 Store the recent files list using Tauri's persisted storage (`tauri-plugin-store` or equivalent).
- 🔲 Update the list on every successful open or save operation.
- 🔲 Implement the `File > Recent Files` submenu in `MenuBar.svelte`.
- 🔲 Handle missing file gracefully: catch the read error, show a notification, remove the entry from the list.

---

## Epic 5 — Character Sheet UI

### 🔲 US-16 · Character identity section
**As a** user
**I want** to fill in my character's basic identity fields
**so that** I can identify the character and set the foundational data that other sections depend on.

**Priority:** MUST
**Dependencies:** US-03, US-05, US-18

**Acceptance Criteria:**
- The identity section displays: Name (text), Race (dropdown), Being Type (dropdown), Gnosis (numeric).
- The description section displays all predefined fields (age, sex, height, weight, region, social class) plus background text and images.
- Race dropdown is populated from the loaded catalog.
- The character supports one or more categories — at least one is required.
- Changing Race triggers automatic modifier recomputation (US-11) reactively.
- All fields are bound bidirectionally to the character store.

**Technical Tasks:**
- 🔲 Implement `Identity.svelte` with all identity and description fields.
- 🔲 Implement `Dropdown.svelte` as a reusable component accepting an array of `{ id, name }` entries.
- 🔲 Implement image attachment via Tauri file dialog — stores relative path in `descripcion.imagenes`.
- 🔲 Wire race change to `computeRaceModifiers` (US-11) via the character store.

---

### 🔲 US-17 · Primary characteristics section
**As a** user
**I want** to view and edit the eight primary characteristics with their modifier breakdown
**so that** I can manage the core stats of my character and understand where each value comes from.

**Priority:** MUST
**Dependencies:** US-07, US-08, US-18

**Acceptance Criteria:**
- The section displays all eight characteristics: Agility, Constitution, Dexterity, Strength, Intelligence, Perception, Power, Willpower.
- For each characteristic, the displayed value is `__final_temporal`.
- When `__final_temporal` differs from `__final_base`, the value is visually highlighted to indicate active temporary modifiers.
- The Characteristic Modifier is displayed alongside each characteristic.
- A breakdown panel (expandable or on hover) shows: `base`, `__base_calculada`, `__final_base`, `__final_temporal`, each base modifier with its source and descriptor, each temporary modifier with its source and descriptor.
- The user can edit the `base` value directly.
- The user can add, edit, and delete manual modifiers (both base and temporary).
- Automatic modifiers (`__automatico: true`) are displayed as read-only.
- All changes update the character store and trigger reactive recalculation of derived stats.

**Technical Tasks:**
- 🔲 Implement `PrimaryStats.svelte` iterating over the eight characteristics.
- 🔲 Implement `NumericInput.svelte` enforcing integer input and rejecting non-numeric characters.
- 🔲 Implement `ModifierList.svelte` displaying an array of `AttributeModifier` entries, with add/edit/delete controls for manual entries and read-only display for automatic ones.
- 🔲 Implement `AttributeBreakdown.svelte` as a reusable tooltip/panel showing `base`, `__base_calculada`, `__final_base`, `__final_temporal`, and the modifier list.
- 🔲 Apply visual highlight when `__final_temporal !== __final_base`.
- 🔲 Connect base value edits and modifier changes to the character store.

---

### 🔲 US-18 · App store & reactive engine integration
**As a** developer
**I want** a central Svelte store that manages all open tabs and triggers engine recalculations automatically
**so that** any change in any tab propagates correctly to all dependent values.

**Priority:** MUST
**Dependencies:** US-07, US-09, US-10

**Acceptance Criteria:**
- A single writable Svelte store holds the full app state: an array of tabs and the active tab ID.
- Each tab contains its own `Character` state, `currentFilePath`, and `isDirty`.
- A derived store `activeTab` always reflects the currently selected tab.
- A derived store `derivedStats` always reflects `computeDerivedStats` for the active tab's character.
- A derived store `dpSummary` always reflects `totalDpSpent` and `remainingDp` for the active tab's character.
- Any mutation to a tab's character sets that tab's `isDirty = true`.
- No component computes derived values locally; all components read from derived stores.

**Technical Tasks:**
- 🔲 Implement `src/lib/stores/app.ts` with: `appState` (writable), `activeTab` (derived), `derivedStats` (derived), `dpSummary` (derived).
- 🔲 Implement tab management helpers: `openNewTab`, `closeTab`, `focusTab`, `setActiveTab`.
- 🔲 Implement character mutation helpers scoped to a tab: `setBase`, `addManualModifier`, `removeModifier`, `setIdentityField`.
- 🔲 Rename `character.ts` store to `app.ts` to reflect the broader scope.
- 🔲 Ensure all helpers update the store immutably.

---

### 🔲 US-19 · Derived stats section
**As a** user
**I want** to see all derived stats updated in real time as I edit primary characteristics
**so that** I always have an accurate view of my character's capabilities.

**Priority:** MUST
**Dependencies:** US-09, US-18

**Acceptance Criteria:**
- The section displays all derived stats in scope: Characteristic Modifiers, Movement, Initiative, all Resistance values, Life Points.
- All values update instantly (< 100 ms) when any primary characteristic changes.
- Derived stats are read-only in the UI; they cannot be edited directly.
- Each derived stat that is influenced by modifiers shows the same expandable breakdown as primary characteristics (US-17).

**Technical Tasks:**
- 🔲 Implement `SecondaryStats.svelte` reading from the `derivedStats` derived store.
- 🔲 Ensure the component has no local computation logic — all values come from the store.

---

### 🔲 US-20 · Category selection & DP budget
**As a** user
**I want** to select my character's category and see my DP budget and spending at a glance
**so that** I can manage point allocation without mental arithmetic.

**Priority:** MUST
**Dependencies:** US-10, US-16, US-18

**Acceptance Criteria:**
- The DP budget section displays: total DP available at current level, total DP spent, remaining DP.
- Remaining DP updates instantly when any ability value changes.
- If remaining DP goes negative, a visual warning is shown.
- The category dropdown (US-16) drives the DP cost table used for all calculations.

**Technical Tasks:**
- 🔲 Implement the DP summary display in `Abilities.svelte` reading from the `dpSummary` derived store.
- 🔲 Implement the negative-DP visual state in the component.

---

### 🔲 US-21 · Secondary abilities & primary combat abilities
**As a** user
**I want** to manage my character's secondary abilities and primary combat abilities
**so that** I can allocate DP and track my character's skills.

**Priority:** MUST
**Dependencies:** US-10, US-18, US-20

**Acceptance Criteria:**
- All secondary abilities from the loaded catalog are displayed, grouped by group (atleticas, sociales, perceptivas, intelectuales, vigor, subterfugio, creativas).
- The four primary combat abilities (Attack, Block, Dodge, Wear Armor) are displayed.
- For each ability, the following are displayed: `base` or `pd` value, `__final_temporal` (with breakdown panel), DP spent, DP cost for the current category.
- When `__final_temporal` differs from `__final_base`, the value is visually highlighted.
- The user can increase or decrease the `pd` investment of each ability; DP totals update reactively.
- Manual modifiers can be added to any ability.

**Technical Tasks:**
- 🔲 Implement `Abilities.svelte` iterating over abilities grouped by catalog group.
- 🔲 Reuse `NumericInput.svelte`, `ModifierList.svelte`, and `AttributeBreakdown.svelte` from US-17.
- 🔲 Implement ability update helpers in the character store (`setAbilityPd`, `addAbilityModifier`).
- 🔲 Derive ability effective values through the `derivedStats` store or a dedicated `abilityStats` derived store.

---

### 🔲 US-22 · Description & free-text fields
**As a** user
**I want** to write free-form text for my character's background and attach images
**so that** the sheet captures the narrative side of my character.

**Priority:** MUST
**Dependencies:** US-18

**Acceptance Criteria:**
- The description section includes a `trasfondo` long-form text field supporting rich text content (e.g. HTML), allowing formatting with paragraphs, bold, italic, and lists.
- The `notas` section allows adding free-form note entries each with a section name and rich text content.
- Multiple images can be attached; they are stored as relative paths in `descripcion.imagenes`.
- All fields are persisted in the character store and saved with the character file.

**Technical Tasks:**
- 🔲 Implement `Description.svelte` with trasfondo, notas, and imagenes fields.
- 🔲 Implement `RichTextEditor.svelte` with a rich text renderer supporting HTML content (evaluate a lightweight editor such as `tiptap` or similar).
- 🔲 Implement image attachment via Tauri file dialog — stores relative path, displays image from path.
- 🔲 Implement notes section with add/remove entries, each with section name and rich text content field.

---

## Epic 6 — Input Validation

### 🔲 US-23 · Numeric input validation
**As a** user
**I want** numeric fields to reject invalid input immediately
**so that** the character sheet never contains malformed data.

**Priority:** MUST
**Dependencies:** US-17, US-21

**Acceptance Criteria:**
- Non-numeric characters cannot be typed into numeric fields.
- Pasting non-numeric content is sanitised.
- If the entered value exceeds the rule-defined range for that field, a visual warning (e.g. red border) is shown without blocking input.
- The character store is only updated with valid numeric values; out-of-range values show the warning but are still stored (the player may have a temporary reason to exceed limits).

**Technical Tasks:**
- 🔲 Extend `NumericInput.svelte` with: `keydown` handler to block non-numeric keys, `paste` handler to sanitise pasted content, `min`/`max` props for range validation, visual error state via a CSS class.
- 🔲 Define the valid range for each characteristic (1–20) in the schema or rules files, not in the component.

---

## Epic 7 — Custom Content

### 🔲 US-24 · Custom content directory
**As a** user
**I want** to specify a folder of custom content files
**so that** I can use homebrew weapons, abilities, or other content alongside the official catalog.

**Priority:** SHOULD
**Dependencies:** US-05

**Acceptance Criteria:**
- On startup, the application loads custom content from a default directory (e.g. `<app_data>/custom_catalogs/`).
- The user can override the custom content directory path via Settings.
- On load, all JSON files in the directory are validated against the appropriate catalog schema.
- Valid custom entries extend or override base catalog entries by key, with custom taking precedence.
- Invalid entries produce a per-file descriptive error; remaining files continue loading.
- Custom entries are visually distinguishable from base entries (e.g. a "custom" badge).
- The custom directory path is persisted across sessions.

**Technical Tasks:**
- 🔲 Implement Tauri commands `list_directory` and `read_file` in `file.rs`.
- 🔲 Implement merge logic in `src/lib/stores/catalogs.ts`: custom entries take precedence over base on key collision.
- 🔲 Implement the settings UI for selecting the custom content directory.
- 🔲 Persist the directory path using Tauri's persistent storage.
- 🔲 Implement the "custom" badge in `Dropdown.svelte` and other catalog-listing components.

---

### 🔲 US-33 · Hot catalog — load catalogo_local from opened .acx
**As a** developer
**I want** the engine to merge the character-local catalog into the effective catalog
when a character file is opened
**so that** character-specific content (bespoke weapons, custom ki techniques)
is available during the session without affecting other characters.

**Priority:** MUST
**Dependencies:** US-13, US-24

**Acceptance Criteria:**
- When a character file is opened, `catalogo_local` is extracted and validated against the appropriate catalog schemas.
- Valid entries are merged into the effective catalog with the highest priority (hot > persistent custom > base).
- Invalid entries produce a per-entry descriptive error; the remainder continue loading.
- When the character tab is closed, its hot catalog entries are removed from the effective catalog.
- Hot catalog entries do not persist to other open character tabs.

**Technical Tasks:**
- 🔲 Implement `loadHotCatalog(catalogoLocal: unknown): CatalogError[]` in `src/lib/catalogs/index.ts` — validates and merges into the effective catalog.
- 🔲 Invoke `loadHotCatalog` in the file loading flow (US-13) after `CharacterSchema` validation.
- 🔲 Invoke catalog cleanup on tab close (US-14).
- 🔲 Write unit tests covering: valid hot entries merged correctly, invalid entries reported without crashing, cleanup on tab close.

---

## Epic 8 — Export & Print

### 🔲 US-25 · Print view
**As a** user
**I want** a printer-friendly view of my character sheet
**so that** I can print a physical copy.

**Priority:** MUST
**Dependencies:** US-19, US-21, US-22

**Acceptance Criteria:**
- A "Print View" option renders the character sheet in a traditional, multi-column layout optimised for A4/Letter paper.
- The layout hides all interactive controls (buttons, inputs), showing only values.
- The modifier breakdown is shown in a condensed format.
- Triggering the browser/OS print dialog from this view produces a correctly paginated output.

**Technical Tasks:**
- 🔲 Implement `PrintView.svelte` as a read-only rendering of the full character state.
- 🔲 Implement CSS print media queries (`@media print`) to hide navigation and interactive elements and adjust layout for paper.
- 🔲 Add a "Print" button / menu item that opens the print view and invokes `window.print()`.

---

### 🔲 US-26 · PDF export
**As a** user
**I want** to export my character sheet as a PDF file
**so that** I can share it digitally.

**Priority:** MUST
**Dependencies:** US-25

**Acceptance Criteria:**
- A "Export to PDF" option produces a PDF file faithful to the print view.
- The user is shown a native save dialog to choose the output path.
- The exported PDF is correctly paginated.

**Technical Tasks:**
- 🔲 Evaluate the PDF generation approach: CSS print + Tauri's `print_to_pdf` webview API vs. a dedicated library (e.g. `@react-pdf/renderer` equivalent for Svelte, or a Rust PDF crate invoked from the wrapper).
- 🔲 Implement the chosen approach and connect it to the "Export to PDF" menu item.
- 🔲 Implement the save dialog via a Tauri command.
- 🔲 Document the chosen approach and any trade-offs in `docs/architecture.md`.

---

## Epic 9 — Localisation

### 🔲 US-27 · English and Spanish UI
**As a** user
**I want** the application interface to be available in English and Spanish
**so that** I can use it in my preferred language.

**Priority:** MUST
**Dependencies:** US-01

**Acceptance Criteria:**
- All UI strings are externalised; no hardcoded user-facing text exists in components.
- The application detects the system language on first launch and selects English or Spanish accordingly.
- The user can manually change the language from a settings option.
- The language preference is persisted across sessions.

**Technical Tasks:**
- 🔲 Implement `src/lib/i18n/en.json` and `src/lib/i18n/es.json` with all UI strings.
- 🔲 Implement a lightweight i18n store: `currentLanguage` (writable), `t(key)` translation helper.
- 🔲 Replace all hardcoded strings in components with `t()` calls.
- 🔲 Implement language auto-detection using `navigator.language` on first launch.
- 🔲 Implement the language selector in the settings UI.
- 🔲 Persist language preference using Tauri's persistent storage.

---

## Epic 10 — Reliability & Non-Functional

### 🔲 US-28 · Schema version compatibility
**As a** user
**I want** the application to detect and handle incompatible character files gracefully
**so that** I am never left with a broken session after opening an old or future-format file.

**Priority:** MUST
**Dependencies:** US-03, US-13

**Acceptance Criteria:**
- Every character file includes a `metadata.__version_schema` field.
- If the file's schema version matches the application's supported version, it loads normally.
- If the file's schema version is older but migration logic exists, the file is migrated silently and marked as modified.
- If the file's schema version is unsupported (too new or unrecognised), an error is shown and the file is not loaded.

**Technical Tasks:**
- 🔲 Define the current schema version as a constant in `src/lib/schema/acx/character.ts`.
- 🔲 Implement `migrateCharacter(raw: unknown, fromVersion: string): Character` in `src/lib/schema/acx/migrations.ts`.
- 🔲 Invoke migration logic in the file loading flow (US-13) before Zod validation.
- 🔲 Write tests for each migration path.

---

### 🔲 US-29 · Crash-safe file loading
**As a** user
**I want** the application to remain stable when opening a malformed file
**so that** a corrupted file never prevents me from using the app.

**Priority:** MUST
**Dependencies:** US-13

**Acceptance Criteria:**
- Any error during file reading or schema validation is caught and displayed as a user-facing message.
- The current session state is not altered on a failed load.
- The application remains fully functional after a failed load.

**Technical Tasks:**
- 🔲 Wrap all file loading operations in `try/catch` blocks in the frontend.
- 🔲 Implement a `Notification.svelte` or toast component for displaying errors non-modally.
- 🔲 Ensure Zod validation errors produce human-readable messages (use `.safeParse()` and format the error output).

---

### 🔲 US-34 · Computed value drift detection
**As a** user
**I want** to be notified when the engine's recomputed values differ from those stored in the file I opened
**so that** I can detect and understand changes caused by engine updates, catalog changes, or manual file edits.

**Priority:** SHOULD
**Dependencies:** US-07, US-09, US-11, US-13

**Acceptance Criteria:**
- After opening a file and recomputing all `__` fields, the engine compares the freshly computed values against those read from the file.
- If any discrepancy is detected, a non-blocking warning panel is shown listing each affected attribute with: its name, the persisted value, and the newly computed value.
- Warnings do not prevent the character from loading or being used.
- The engine's freshly computed values always take precedence over the persisted `__` values.
- If no `__` fields are present in the file (e.g. a freshly created file), no comparison is performed and no warning is shown.
- The warning panel can be dismissed by the user.

**Technical Tasks:**
- 🔲 Implement `detectDrift(persisted: Character, recomputed: Character): DriftWarning[]` in `src/lib/engine/drift.ts`, comparing all `__` fields between the two character states.
- 🔲 Invoke `detectDrift` in the file loading flow (US-13) after the engine recomputes all values.
- 🔲 Implement `DriftWarningPanel.svelte` to display the list of discrepancies non-modally.
- 🔲 Write unit tests covering: no drift when values match, correct warnings when values differ, no warnings when `__` fields are absent.

---

### 🔲 US-30 · Automatic backup on save
**As a** user
**I want** the application to keep a backup of my last saved file before overwriting it
**so that** I can recover from accidental overwrites.

**Priority:** SHOULD
**Dependencies:** US-13

**Acceptance Criteria:**
- Before overwriting a file, the previous version is copied to `<filename>.bak` in the same directory.
- Only one backup is kept per file (the previous version of the last save).
- The backup is created by the Rust wrapper, not the frontend.

**Technical Tasks:**
- 🔲 Extend the `write_file` Tauri command in `file.rs` to copy the existing file to `.bak` before writing.
- 🔲 Handle the case where no previous file exists (first save) gracefully.

---

### 🔲 US-31 · Auto-save
**As a** user
**I want** the application to periodically save my work automatically
**so that** I lose minimal progress in the event of a crash.

**Priority:** COULD
**Dependencies:** US-13

**Acceptance Criteria:**
- Auto-save can be enabled or disabled in settings (disabled by default).
- When enabled, the character is saved to the current file path every N minutes (configurable, default 5).
- Auto-save does not trigger if there are no unsaved changes.
- Auto-save does not trigger if the character has no associated file path (i.e. has never been saved).

**Technical Tasks:**
- 🔲 Implement an auto-save interval using `setInterval` in `App.svelte`, gated on `isDirty` and `currentFilePath`.
- 🔲 Implement the auto-save settings UI (enable/disable toggle, interval selector).
- 🔲 Persist auto-save settings using Tauri's persistent storage.
