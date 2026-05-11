# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlexLab is a modern web security debugging workbench built on top of mitmproxy — targeting BurpSuite-like traffic debugging capabilities with a modern IDE-style UI (think VSCode/Chrome DevTools/Caido). The project is in early development (MVP phase).

## Repository Structure

```
flexlab/
├── backend/          # Python FastAPI control layer (uv-managed)
├── frontend/         # React/TypeScript SPA (bun-managed)
├── docs/             # Architecture specs
└── mitmproxy/        # Git submodule — mitmproxy source (read-only reference)
```

## Commands

### Frontend (from `frontend/`)

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (Vite HMR)
bun run build        # TypeScript check + Vite build
bun run lint         # ESLint
bun run preview      # Preview production build
```

### Backend (from `backend/`)

```bash
uv run main.py       # Run backend
uv add <package>     # Add dependency
```

Python version is pinned to 3.12 via `.python-version`.

## Architecture

### Three-Layer Design

```
Frontend (React/TS) — WebSocket + REST
        ↓
Backend Control Layer (FastAPI + asyncio)
        ↓
mitmproxy Core (git submodule, minimize modifications)
```

The backend is a **control layer only** — it does not implement proxy logic. All proxying is delegated to mitmproxy. Backend responsibilities: Flow management, WebSocket push, Repeater, Interceptor, Plugin system, Scanner, Project management.

### Frontend Architecture

- **State management**: Zustand — four stores: `flowStore`, `tabStore`, `projectStore`, `settingStore`
- **Flow pattern**: Frontend holds `FlowSummary` only (lightweight list rendering); fetch `FlowDetail` lazily on demand — never hold full flow objects in the frontend
- **Editor**: Monaco Editor for all request/response viewing (raw HTTP, JSON, XML, HTML, GraphQL, diff)
- **UI target**: IDE-style workspace, not a traditional web page

### WebSocket Protocol

All real-time events follow this envelope:

```json
{ "event": "FLOW_ADD", "data": {} }
```

Events: `FLOW_ADD`, `FLOW_UPDATE`, `FLOW_REMOVE`, `INTERCEPT_REQUEST`, `REPEATER_RESULT`, `SCANNER_RESULT`

### Flow Data Pipeline

```
mitmproxy Flow → Serializer → DTO → WebSocket → Frontend Store
```

Never serialize mitmproxy flow objects directly — always go through a DTO/Serializer.

### mitmproxy Integration Rules

- Extend via **addon / api / hook / command** — do not modify mitmproxy core
- Modifications confined to `mitmproxy/tools/web/` if absolutely necessary
- Never modify `mitmproxy/proxy/`

### Database

SQLite via SQLAlchemy. Core tables: `projects`, `flows`, `findings`, `repeater_history`, `plugins`.

### Plugin Interface

```python
class Plugin:
    name = "plugin"

    async def on_request(self, flow): pass
    async def on_response(self, flow): pass
```

## Tech Stack

| Layer    | Key Technologies |
|----------|-----------------|
| Frontend | Bun, Vite, React 19, TypeScript, Zustand, TailwindCSS v4, ky, TanStack Table/Virtual, Monaco Editor |
| Backend  | Python 3.12, uv, FastAPI, asyncio, SQLAlchemy, SQLite, Pydantic |
| Proxy    | mitmproxy (git submodule) |

### Frontend Dependency Decisions

**Editor: Monaco (`@monaco-editor/react`)**
- Chosen over CodeMirror 6 for: JSON Schema validation, Markdown editing, multi-language editing experience
- Performance: use singleton pattern — one global instance, swap `Model` on flow switch (`editor.setModel(newModel)`), dispose old models
- Lazy-load via `@monaco-editor/react` (handles this automatically)
- Markdown editing requires a separate renderer (`marked`/`remark`) for preview — Monaco only handles editing

**HTTP Client: `ky` (not Axios)**
- Axios is overkill; `ky` is fetch-based, 4KB, natively typed

**Styling: TailwindCSS v4 (not v3)**
- v4 uses Rust compiler, significantly faster

**Router: none**
- This is a workspace app; tab navigation is handled by `tabStore` in Zustand

**State: Zustand with `subscribeWithSelector` middleware**
- Prevents high-frequency WebSocket flow updates from re-rendering unrelated components

**WebSocket: native browser API**
- No library needed

## MVP Scope

In scope: HTTP/HTTPS capture, Flow List, Request/Response Viewer, WebSocket real-time sync, HTTPS CA, Repeater, Interceptor.

Out of scope (not yet): Auto-scanner, Fuzz Engine, Intruder, Team Collaboration, Cloud Sync.
