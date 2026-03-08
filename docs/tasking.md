# Tasking: Anima Beyond Fantasy — Character Sheet App
**Version:** 1.1
**Status:** In Progress
**Related to:** Requirements v2.0 · Architecture v1.1

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

---

## Suggested order of implementation

- ✅ US-01  Project bootstrap
- ✅ US-02  File extension registration
- ✅ US-03  Character schema definition
- ✅ US-04  Catalog schema definition
- 🔄 US-05  Base content catalogs
- 🔲 US-06  Derived stats rules files
- 🔲 US-07  Composite attribute resolution
- 🔲 US-08  Primary characteristic modifier table
- 🔲 US-09  Derived stat computation
- 🔲 US-10  DP cost resolution
- 🔲 US-11  Automatic modifier lifecycle
- 🔲 US-27  English and Spanish UI          ← before any UI component
- 🔲 US-18  Character store & reactive engine integration
- 🔲 US-12  New character
- 🔲 US-13  Open and save character files
- 🔲 US-14  Unsaved changes guard
- 🔲 US-28  Schema version compatibility
- 🔲 US-29  Crash-safe file loading
- 🔲 US-16  Character identity section
- 🔲 US-17  Primary characteristics section
- 🔲 US-19  Derived stats section
- 🔲 US-20  Category selection & DP budget
- 🔲 US-21  Secondary abilities & combat abilities
- 🔲 US-22  Lore & free-text fields
- 🔲 US-23  Numeric input validation
- 🔲 US-25  Print view
- 🔲 US-26  PDF export
- 🔲 US-30  Automatic backup on save
- 🔲 US-15  Recent files
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

**Priority:** MUST
**Dependencies:** US-01

**Acceptance Criteria:**
- ✅ A `CharacterSchema` Zod object is defined in `src/lib/schema/character.ts`.
- ✅ The schema includes a `schema_version` field.
- ✅ The schema covers: identity fields, all eight primary characteristics,
  secondary characteristics, resistances, combat skills, secondary skills,
  hit points, fatigue, presence, creation points, and free-text fields.
- ✅ All TypeScript types are inferred from the schema (`z.infer`), with no
  manually duplicated type definitions.
- ✅ Schema is split into focused modules: `enums.ts`, `attribute.ts`,
  `combat.ts`, `secondary.ts`, `character.ts`.
- ✅ Exported types: `AttributeModifier`, `Attribute`, `DirectAttribute`,
  `PDAttribute`, `HybridAttribute`, `CharacteristicSkill`, `Character`,
  `CharacterCategory`.
- ✅ Unit tests in `tests/lib/schema/character.test.ts`.

**Technical Tasks:**
- ✅ Implement `AttributeModifierSchema` (valor, fuente, descriptor?, automatico).
- ✅ Implement attribute hierarchy: `AttributeSchema`, `DirectAttributeSchema`,
  `DirectCharacteristicSkillSchema`, `PDAttributeSchema`,
  `HybridAttributeSchema`, `PDCharacteristicSkillSchema`.
- ✅ Implement `CharacterCategorySchema` (multi-class ready, owns PD investments
  for combat, secondary skills and puntos_de_vida).
- ✅ Implement `CharacterSchema` covering all fields in scope for first release.
- ✅ Export all inferred types.
- ✅ Write unit tests covering: valid character, missing required fields,
  wrong types, negative values, custom skills, modifiers, and multi-class.

---

### ✅ US-04 · Catalog schema definition
**As a** developer
**I want** formally defined schemas for game content catalogs
**so that** base content and custom extensions can be validated consistently.

**Priority:** MUST
**Dependencies:** US-03

**Acceptance Criteria:**
- ✅ Catalog schemas are split by domain: `combat.ts` and `secondary.ts`
  within `src/lib/schema/`.
- ✅ `CombatCatalogSchema` defines static rules for all combat skills
  (nombre, caracteristica). Extensible via optional `custom` record.
- ✅ `SecondaryCatalogSchema` defines static rules for all secondary skills
  grouped by type (nombre, caracteristica, conocimiento, penalizador_armadura).
  Extensible via optional `custom` group.
- ✅ `conocimiento` defaults to `false`, `penalizador_armadura` defaults to
  `ninguno` — omitted in data files when default.
- ✅ All catalog types are inferred from schemas (`z.infer`, `z.input`).
- ✅ `PenalizadorArmaduraEnum` covers: ninguno, reducible,
  reducible_hasta_mitad, no_reducible, percepcion.

**Technical Tasks:**
- ✅ Implement `CombatSkillDefinitionSchema` and `CombatCatalogSchema` in `combat.ts`.
- ✅ Implement `SecondarySkillDefinitionSchema` and `SecondaryCatalogSchema`
  in `secondary.ts`.
- ✅ Export inferred types and input types for all catalog schemas.

---

### 🔄 US-05 · Base content catalogs
**As a** developer
**I want** the base game content available as validated data
**so that** it is decoupled from application logic and can be extended.

**Priority:** MUST
**Dependencies:** US-04

**Acceptance Criteria:**
- ✅ `src/lib/data/defaultCatalog.ts` contains the full official Anima:
  Beyond Fantasy catalog for combat and secondary skills.
- ✅ All entries validated against their schemas via unit tests.
- 🔲 `src/lib/data/defaultCategoryCosts.ts` contains PD costs for all
  official categories. (placeholder exists, official values pending)
- 🔲 The application loads catalogs on startup and keeps them in a Svelte store.
- 🔲 Missing or malformed catalogs are reported without crashing the app.

**Technical Tasks:**
- ✅ Implement `defaultCombatCatalog` and `defaultSecondaryCatalog` in
  `src/lib/data/defaultCatalog.ts`.
- ✅ Write unit tests in `tests/lib/data/defaultCatalog.test.ts` covering:
  schema validation, default values, conocimiento flags, armor penalties,
  and valid characteristics.
- 🔲 Complete `defaultCategoryCosts.ts` with official PD costs per category.
- 🔲 Implement catalog store in `src/lib/stores/catalogs.ts`.

---

### 🔲 US-06 · Derived stats rules files
**As a** developer  
**I want** derived stat formulas and lookup tables to reside in external JSON files  
**so that** the computation engine is not hard-coded and can be updated without recompiling.

**Priority:** MUST  
**Dependencies:** US-04

**Acceptance Criteria:**
- `data/rules/derived-stats.json` defines the formula for each derived stat in a structured, documented format.
- `data/rules/resistance-tables.json` defines the resistance value table indexed by Presence.
- The engine reads these files and applies them; no derived stat formula is hard-coded in TypeScript.

**Technical Tasks:**
- 🔲 Define the JSON structure for formula rules (e.g. `{ "stat": "initiative", "formula": "agility_mod + dexterity_mod + category_bonus" }`).
- 🔲 Populate `data/rules/derived-stats.json` with all derived stats in scope.
- 🔲 Populate `data/rules/resistance-tables.json`.
- 🔲 Implement the rules loader in the catalog loading flow (US-05) to also load rules files.
- 🔲 Document the rules file format in `docs/architecture.md` under a new "Rules File Format" subsection.

---

## Epic 3 — Rules Engine

### 🔲 US-07 · Composite attribute resolution
**As a** developer  
**I want** a module that computes effective and requirement values for any composite attribute  
**so that** the distinction between base, permanent modifiers, and temporary modifiers is enforced consistently.

**Priority:** MUST  
**Dependencies:** US-03

**Acceptance Criteria:**
- `effectiveValue(attr: Attribute): number` returns `base + sum(base_modifiers) + sum(temporary_modifiers)`.
- `requirementValue(attr: Attribute): number` returns `base + sum(base_modifiers)`.
- Both functions handle empty modifier arrays correctly.
- Negative modifier values are supported.

**Technical Tasks:**
- 🔲 Implement `effectiveValue` and `requirementValue` in `src/lib/engine/modifiers.ts`.
- 🔲 Implement `addModifier(attr, modifier): Attribute` — returns a new attribute with the modifier appended to the appropriate array.
- 🔲 Implement `removeModifier(attr, source): Attribute` — removes all modifiers with the given source identifier from both arrays.
- 🔲 Implement `updateAutomaticModifiers(attr, source, value): Attribute` — upserts an automatic modifier for a given source.
- 🔲 Write unit tests in `tests/engine/modifiers.test.ts` covering: effective vs. requirement value, add/remove/update operations, negative values, empty arrays.

---

### 🔲 US-08 · Primary characteristic modifier table
**As a** developer  
**I want** the engine to compute the Characteristic Modifier for any primary stat value  
**so that** all derived stats that depend on it are calculated correctly.

**Priority:** MUST  
**Dependencies:** US-07

**Acceptance Criteria:**
- `characteristicModifier(value: number): number` returns the correct modifier for any valid characteristic value according to Anima's table.
- The table is loaded from `data/rules/derived-stats.json`, not hard-coded.
- The function handles values at table boundaries correctly.

**Technical Tasks:**
- 🔲 Implement `characteristicModifier` in `src/lib/engine/tables.ts`.
- 🔲 Implement the table lookup mechanism that reads from the loaded rules files.
- 🔲 Write unit tests covering representative values and boundary cases.

---

### 🔲 US-09 · Derived stat computation
**As a** developer  
**I want** the engine to compute all derived stats from primary characteristics  
**so that** the UI can display them reactively.

**Priority:** MUST  
**Dependencies:** US-07, US-08, US-06

**Acceptance Criteria:**
- The engine computes all derived stats in scope: Characteristic Modifiers, Movement, Initiative, all Resistance values, Life Points, and any other stats derived from primary characteristics.
- Derived stats use the **requirement value** (not the effective value) of primary characteristics as their input, unless a specific rule states otherwise.
- All Anima-specific rounding rules are applied correctly.
- Computed values are consistent with the reference `.xlsx` sheet for the same inputs.

**Technical Tasks:**
- 🔲 Implement `computeDerivedStats(character: Character, rules: Rules): DerivedStats` in `src/lib/engine/formulas.ts`.
- 🔲 Implement resistance table lookups in `src/lib/engine/tables.ts` using `data/rules/resistance-tables.json`.
- 🔲 Define a `DerivedStats` type exported from the schema module.
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
- `totalDpSpent(character: Character, catalogs: Catalogs): number` returns the sum of all spent DP.
- `remainingDp(character: Character, catalogs: Catalogs): number` returns available DP for the current level.
- The engine uses catalog data for costs; no cost is hard-coded.

**Technical Tasks:**
- 🔲 Implement the three functions in `src/lib/engine/dp.ts`.
- 🔲 Define the DP budget per level in `data/categories.json` (already planned in US-05).
- 🔲 Write unit tests in `tests/engine/dp.test.ts` covering: correct cost per category, total spent, remaining, edge case of zero-cost abilities.

---

### 🔲 US-11 · Automatic modifier lifecycle
**As a** developer  
**I want** the engine to automatically generate and remove modifiers when their source values change  
**so that** race bonuses, category bonuses, and similar effects are always in sync with the sheet.

**Priority:** MUST  
**Dependencies:** US-07, US-05

**Acceptance Criteria:**
- When the character's race changes, all automatic modifiers sourced from the previous race are removed and replaced with those from the new race.
- When the character's category changes, all automatic modifiers sourced from the previous category are removed and replaced with those from the new category.
- Manual modifiers are never removed or altered by the engine.
- Automatic modifiers are marked `automatic: true` and are not editable by the user in the UI.

**Technical Tasks:**
- 🔲 Implement `applyRaceModifiers(character, raceId, catalogs): Character` in `src/lib/engine/modifiers.ts`.
- 🔲 Implement `applyCategoryModifiers(character, categoryId, catalogs): Character` in `src/lib/engine/modifiers.ts`.
- 🔲 Both functions call `updateAutomaticModifiers` (US-07) for each affected attribute.
- 🔲 Wire these functions into the Svelte store (US-18) so they fire reactively on race/category change.
- 🔲 Write unit tests covering: race change removes old and applies new modifiers, manual modifiers survive race/category changes.

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
- 🔲 Implement `defaultCharacter(): Character` in `src/lib/schema/character.ts`.
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
- `File > Save` writes the active tab's character state as JSON to its associated file path.
- `File > Save As` shows a native save dialog and writes to the chosen path, updating the active tab's file path.
- After a successful save, the active tab's unsaved changes indicator is cleared.
- `Ctrl+S` triggers Save. `Ctrl+Shift+S` triggers Save As.

**Technical Tasks:**
- 🔲 Implement Tauri commands in `src-tauri/src/commands/file.rs`: `open_file_dialog`, `read_file`, `save_file_dialog`, `write_file`.
- 🔲 Implement file loading logic: invoke `open_file_dialog`, read content, validate with Zod, invoke `openNewTab` or focus existing tab.
- 🔲 Implement duplicate detection: before opening, check if the file path is already present in any tab's `currentFilePath`.
- 🔲 Implement file saving logic: serialise active tab's character state to JSON, invoke `write_file`, update tab's `currentFilePath` and `isDirty`.
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
- The identity section displays: Name (text), Race (dropdown), Category (dropdown), Level (numeric).
- Race and Category dropdowns are populated from the loaded catalogs.
- Changing Race triggers automatic modifier updates (US-11) reactively.
- Changing Category triggers automatic modifier updates (US-11) and DP recalculation (US-10) reactively.
- All fields are bound bidirectionally to the character store.

**Technical Tasks:**
- 🔲 Implement `Identity.svelte` with the four fields.
- 🔲 Implement `Dropdown.svelte` as a reusable component accepting an array of `{ id, name }` entries and emitting the selected `id`.
- 🔲 Wire race and category changes to `applyRaceModifiers` and `applyCategoryModifiers` (US-11) via the character store.

---

### 🔲 US-17 · Primary characteristics section
**As a** user  
**I want** to view and edit the eight primary characteristics with their modifier breakdown  
**so that** I can manage the core stats of my character and understand where each value comes from.

**Priority:** MUST  
**Dependencies:** US-07, US-08, US-18

**Acceptance Criteria:**
- The section displays all eight characteristics: Agility, Constitution, Dexterity, Strength, Intelligence, Perception, Power, Willpower.
- For each characteristic, the displayed value is the effective value (`base + all modifiers`).
- The Characteristic Modifier is displayed alongside each characteristic.
- A breakdown panel (expandable or on hover) shows: base value, each base modifier with its source and descriptor, each temporary modifier with its source and descriptor.
- The user can edit the base value directly.
- The user can add, edit, and delete manual modifiers (both base and temporary).
- Automatic modifiers are displayed as read-only.
- All changes update the character store and trigger reactive recalculation of derived stats.

**Technical Tasks:**
- 🔲 Implement `PrimaryStats.svelte` iterating over the eight characteristics.
- 🔲 Implement `NumericInput.svelte` enforcing integer input and rejecting non-numeric characters.
- 🔲 Implement `ModifierList.svelte` displaying an array of `AttributeModifier` entries, with add/edit/delete controls for manual entries and read-only display for automatic ones.
- 🔲 Connect base value edits and modifier changes to the character store.

---

### 🔲 US-18 · App store & reactive engine integration
**As a** developer  
**I want** a central Svelte store that manages all open tabs and triggers engine recalculations automatically 
**so that** any change in any tab propagates correctly to all dependent values.

**Priority:** MUST  
**Dependencies:** US-07, US-09, US-10

**Acceptance Criteria:**
- A single writable Svelte store holds the full app state: an array of tabs 
  and the active tab ID.
- Each tab contains its own `Character` state, `currentFilePath`, and `isDirty`.
- A derived store `activeTab` always reflects the currently selected tab.
- A derived store `derivedStats` always reflects `computeDerivedStats` for the active tab's character.
- A derived store `dpSummary` always reflects `totalDpSpent` and `remainingDp` for the active tab's character.
- Any mutation to a tab's character sets that tab's `isDirty = true`.
- No component computes derived values locally; all components read from  derived stores.

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
- All secondary abilities defined in `data/secondary-abilities.json` are displayed, grouped by category (e.g. Athletic, Social, Intellectual).
- All Primary Combat Abilities (Attack, Block, Dodge, Wear Armor, Ki) are displayed.
- For each ability, the following are displayed: base value, total effective value (with modifier breakdown), DP spent, DP cost for the current category.
- The user can increase or decrease the base value of each ability; DP totals update reactively.
- The composite attribute model (base + modifiers) applies to all abilities.
- Manual modifiers can be added to any ability.

**Technical Tasks:**
- 🔲 Implement `Abilities.svelte` iterating over abilities grouped by type.
- 🔲 Reuse `NumericInput.svelte` and `ModifierList.svelte` from US-17.
- 🔲 Implement ability update helpers in the character store (`setAbilityBase`, `addAbilityModifier`).
- 🔲 Derive ability effective values through the `derivedStats` store or a dedicated `abilityStats` derived store.

---

### 🔲 US-22 · Lore & free-text fields
**As a** user  
**I want** to write free-form text for my character's background and history, and attach an image  
**so that** the sheet captures the narrative side of my character.

**Priority:** MUST  
**Dependencies:** US-18

**Acceptance Criteria:**
- The Lore section includes two long-form text fields: Background and Character History.
- Both fields support basic Markdown formatting (bold, italic, unordered lists) with live preview or inline rendering.
- An image field allows the user to attach a character portrait; the image is stored as a base64 string within the character file.
- All fields are persisted in the character store and saved with the character file.

**Technical Tasks:**
- 🔲 Implement `Lore.svelte` with the two text fields and the image field.
- 🔲 Implement `MarkdownEditor.svelte` with a simple Markdown renderer (evaluate `marked` or `micromark` as a dependency).
- 🔲 Implement image selection via Tauri's file dialog, read as base64, store in the character schema.
- 🔲 Add `lore.background`, `lore.history`, and `lore.portrait_base64` fields to `CharacterSchema` (US-03).

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
- The user can specify a custom content directory via a settings panel or menu option.
- On load, the application reads all JSON files from that directory and validates each against the appropriate catalog schema.
- Valid custom entries extend or override base catalog entries by `id`, without replacing the entire catalog.
- Invalid entries produce a per-file descriptive error; the rest of the custom content loads successfully.
- Custom entries are visually distinguishable from base entries in dropdowns and lists (e.g. a "custom" badge).
- The custom directory path is persisted across sessions.

**Technical Tasks:**
- 🔲 Implement Tauri command `list_directory` and `read_file` in `file.rs` to enumerate and read files from an arbitrary directory.
- 🔲 Implement the merge logic in `src/lib/stores/catalogs.ts`: after loading custom files, merge by `id` with base catalogs, custom entries taking precedence.
- 🔲 Implement the settings UI for selecting the custom content directory.
- 🔲 Persist the directory path using Tauri's persistent storage.
- 🔲 Implement the "custom" badge in `Dropdown.svelte` and any other component that lists catalog entries.

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
- All catalog entry names (`name.en`, `name.es`) are rendered in the active language.

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
- Every character file includes a `schema_version` field.
- If the file's schema version matches the application's supported version, it loads normally.
- If the file's schema version is older but migration logic exists, the file is migrated silently and marked as modified.
- If the file's schema version is unsupported (too new or unrecognised), an error is shown and the file is not loaded.

**Technical Tasks:**
- 🔲 Define the current schema version as a constant in `src/lib/schema/character.ts`.
- 🔲 Implement `migrateCharacter(raw: unknown, fromVersion: string): Character` in a new `src/lib/schema/migrations.ts` module.
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
