# Anima Codex

An open-source desktop character sheet for *Anima: Beyond Fantasy*.  
Built with Tauri + SvelteKit + TypeScript.

---

## Prerequisites

Before running the project, ensure you have the following installed:

| Tool | Version | Link |
|---|---|---|
| Rust & Cargo | 1.70+ | https://rustup.rs |
| Node.js | 20+ | https://nodejs.org |
| npm | 9+ | Included with Node.js |

On Windows, also ensure you have:
- [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — select "Desktop development with C++"
- [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) — pre-installed on Windows 11

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/CFernan/anima-codex.git
cd anima-codex
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in development mode
```bash
npm run tauri dev
```

The first build will take several minutes as Cargo downloads and compiles
Rust dependencies. Subsequent builds will be significantly faster.

---

## Project Structure
```
anima-codex/
├── docs/                   # Project documentation
│   ├── requirements.md
│   ├── architecture.md
│   └── tasking.md
├── src/                    # Frontend (SvelteKit + TypeScript)
│   ├── lib/                # (pending — US-03 onwards)
│   │   ├── engine/         # Rules engine — no UI dependencies
│   │   ├── schema/         # Zod schemas and inferred types
│   │   ├── stores/         # Svelte reactive stores
│   │   └── i18n/           # Localisation files
│   ├── components/         # (pending — US-16 onwards)
│   │   ├── sheet/          # Character sheet sections
│   │   ├── shared/         # Reusable UI primitives
│   │   └── layout/         # App layout components
│   ├── routes/             # SvelteKit file-based routing
│   └── app.html            # HTML root template
├── src-tauri/              # Desktop wrapper (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   └── lib.rs
│   ├── capabilities/       # Tauri permission declarations
│   ├── icons/              # Application icons
│   └── tauri.conf.json
├── data/                   # (pending — US-05) Base game content catalogs
│   └── rules/              # Computation rules and lookup tables
├── tools/                  # (pending — backlog) Standalone utilities
│   └── xlsx-migrator/
├── tests/                  # (pending — US-03) Unit tests
│   ├── engine/
│   └── schema/
└── static/                 # Static assets
```

---

## Documentation

- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)

---

## License

This project is open-source. License TBD.