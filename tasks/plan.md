# Implementation Plan: FlexLab MVP

## Overview

Build the minimum viable FlexLab: a browser-based security workbench that connects directly to mitmproxy's built-in web API. The frontend acts as a modern replacement for mitmproxy's default web UI, adding an IDE-style workspace layout with Flow List, Request/Response viewers, Interceptor, and Repeater.

No separate backend is needed for MVP — mitmproxy's Tornado web server (`mitmweb`) serves as the API layer.

## Architecture Decisions

- **API strategy**: Frontend connects directly to mitmproxy's web API via Vite dev proxy (avoids CORS + XSRF issues)
- **Editor**: Monaco (`@monaco-editor/react`) — singleton instance, swap Model on flow switch
- **State**: Zustand with `subscribeWithSelector` — prevents high-frequency WebSocket updates from re-rendering unrelated components
- **Flow data**: mitmproxy's `flow_to_json` already implements Summary pattern (no body content); body fetched lazily via `/flows/{id}/request|response/content/auto`
- **Replay**: mitmproxy's `POST /flows/{id}/replay` covers Repeater for MVP
- **Intercept**: toggle via `PUT /options` with `{"intercept": "~all"}` or `{"intercept": ""}`

## Running mitmproxy for Development

```bash
# From repo root
cd mitmproxy
uv run mitmweb --web-port 8081 --listen-port 8080 --web-host 127.0.0.1
# Then configure system/browser proxy to 127.0.0.1:8080
```

Frontend dev server (`bun run dev`) proxies all API calls to `localhost:8081`.

## XSRF Handling

mitmproxy uses Tornado's XSRF protection. Via Vite proxy:
1. First GET request (e.g. `GET /flows`) causes mitmproxy to set `_xsrf` cookie on `localhost:5173`
2. All mutation requests (PUT/POST/DELETE) must include `X-Xsrftoken: <cookie-value>` header
3. The ky client must read the `_xsrf` cookie and inject it as a header on every mutation request

## Frontend File Structure

```
frontend/src/
  types/
    flow.ts          # TypeScript types matching mitmproxy flow_to_json
  api/
    client.ts        # ky instance with XSRF injection
    ws.ts            # WebSocket connection + reconnect
    flows.ts         # REST calls: list, content, resume, kill, replay, edit
    transform.ts     # mitmproxy format → internal FlowSummary/FlowDetail
  stores/
    flowStore.ts     # flows map, selected flow id, WebSocket event handlers
    uiStore.ts       # intercept mode toggle, active tab
  components/
    Layout/          # IDE-style shell: toolbar + list panel + detail panel
    FlowList/        # TanStack Table + Virtual, color-coded rows
    FlowDetail/      # Monaco request + response viewers (lazy body load)
    Interceptor/     # Resume/Kill buttons, intercept toggle in toolbar
    Repeater/        # Editable Monaco + Send button
```

---

## Phase 1: Foundation

### Task 1: Install dependencies + configure tooling

**Description:** Set up all frontend dependencies and configure Vite proxy, TailwindCSS v4, and TypeScript paths.

**Acceptance criteria:**
- [ ] All dependencies installed (`zustand`, `@tanstack/react-table`, `@tanstack/react-virtual`, `@monaco-editor/react`, `ky`, `tailwindcss`, `@tailwindcss/vite`)
- [ ] TailwindCSS v4 working (renders a styled div)
- [ ] Vite proxy routes `/flows`, `/updates` (ws), `/options`, `/clear`, `/state`, `/commands`, `/events` to `localhost:8081`
- [ ] `bun run build` passes with no errors

**Verification:**
- [ ] `bun run dev` starts without errors
- [ ] `bun run build` succeeds

**Dependencies:** None

**Files likely touched:**
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/src/index.css`

**Estimated scope:** S

---

### Task 2: TypeScript types + transform layer

**Description:** Define TypeScript types that match mitmproxy's `flow_to_json` output exactly, then write transform functions to convert them to internal `FlowSummary` and `FlowDetail` types used by the stores and UI.

**Acceptance criteria:**
- [ ] `MitmFlow` type matches all fields from `flow_to_json` in `app.py`
- [ ] `FlowSummary` type has: id, method, scheme, host, port, path, status_code, content_length (response), duration, intercepted, marked
- [ ] `FlowDetail` extends summary with: request headers, response headers, content (loaded separately)
- [ ] `toFlowSummary(mitmFlow)` and `toFlowDetail(mitmFlow)` transform functions exist and are typed

**Verification:**
- [ ] `bun run build` with no type errors

**Dependencies:** Task 1

**Files likely touched:**
- `frontend/src/types/flow.ts`
- `frontend/src/api/transform.ts`

**Estimated scope:** S

---

### Task 3: API client + WebSocket layer

**Description:** Build the ky HTTP client with automatic XSRF token injection, and a WebSocket connection manager that connects to `/updates`, handles reconnection, and emits typed events.

**Acceptance criteria:**
- [ ] ky client reads `_xsrf` cookie and injects `X-Xsrftoken` header on PUT/POST/DELETE
- [ ] `fetchFlows()` calls `GET /flows` and returns `MitmFlow[]`
- [ ] `fetchContent(flowId, message, view)` calls `/flows/{id}/request|response/content/{view}`
- [ ] `replayFlow(flowId)`, `resumeFlow(flowId)`, `killFlow(flowId)`, `updateFlow(flowId, patch)` implemented
- [ ] `setIntercept(expr)` calls `PUT /options` with `{"intercept": expr}`
- [ ] WebSocket connects to `/updates`, parses `flows/add`, `flows/update`, `flows/reset` messages
- [ ] WebSocket auto-reconnects on disconnect (exponential backoff, max 5s)

**Verification:**
- [ ] `bun run build` passes
- [ ] With mitmproxy running: `fetchFlows()` returns data in browser console

**Dependencies:** Task 2

**Files likely touched:**
- `frontend/src/api/client.ts`
- `frontend/src/api/ws.ts`
- `frontend/src/api/flows.ts`

**Estimated scope:** M

---

### Checkpoint: Phase 1

- [ ] `bun run build` passes clean
- [ ] With mitmproxy running, `fetchFlows()` returns live flow data in console
- [ ] WebSocket connects and logs incoming events

---

## Phase 2: Flow List

### Task 4: flowStore

**Description:** Zustand store that holds the flows map, handles WebSocket events to add/update/reset flows, and tracks the selected flow ID.

**Acceptance criteria:**
- [ ] `flowStore` holds `flows: Map<string, FlowSummary>` and `selectedId: string | null`
- [ ] On init: connects WebSocket, fetches `/flows`, populates store
- [ ] `flows/add` event: adds flow to map
- [ ] `flows/update` event: updates flow in map
- [ ] `flows/reset` event: clears map, re-fetches
- [ ] `selectFlow(id)` sets `selectedId`
- [ ] Components using `useFlowStore(s => s.selectedId)` do NOT re-render on flow list updates

**Verification:**
- [ ] With mitmproxy running: browse a website, flow count in store increases
- [ ] Selecting a flow does not trigger re-render of flow list rows

**Dependencies:** Task 3

**Files likely touched:**
- `frontend/src/stores/flowStore.ts`

**Estimated scope:** S

---

### Task 5: IDE layout shell

**Description:** Build the main application layout: top toolbar, left flow list panel, right detail panel. Panels are resizable. Uses TailwindCSS v4.

**Acceptance criteria:**
- [ ] Layout fills the full viewport (no scroll on body)
- [ ] Left panel: fixed-width flow list (resizable via drag)
- [ ] Right panel: detail view (fills remaining space)
- [ ] Top toolbar: app name, intercept toggle button, clear button
- [ ] Dark theme

**Verification:**
- [ ] `bun run dev` — layout renders correctly at 1280x800 and 1920x1080

**Dependencies:** Task 1

**Files likely touched:**
- `frontend/src/components/Layout/AppShell.tsx`
- `frontend/src/App.tsx`

**Estimated scope:** S

---

### Task 6: Flow List UI

**Description:** Render the flow list using TanStack Table + TanStack Virtual. Each row shows method, host+path, status code, size, duration. Clicking selects the flow. Color-coded by status (2xx green, 4xx orange, 5xx red, intercepted yellow).

**Acceptance criteria:**
- [ ] Renders all flows from `flowStore` via virtual scrolling (no DOM nodes for off-screen rows)
- [ ] Columns: Method, Host, Path, Status, Size, Duration
- [ ] New flows append to bottom in real time
- [ ] Clicking a row calls `selectFlow(id)`
- [ ] Selected row highlighted
- [ ] Status color coding applied
- [ ] Intercepted flows have distinct styling (yellow background or indicator)
- [ ] Handles 10,000+ rows without jank

**Verification:**
- [ ] Browse 50+ URLs through proxy — all appear in list
- [ ] Scroll performance is smooth with 1000+ flows

**Dependencies:** Task 4, Task 5

**Files likely touched:**
- `frontend/src/components/FlowList/FlowList.tsx`
- `frontend/src/components/FlowList/FlowRow.tsx`

**Estimated scope:** M

---

### Checkpoint: Phase 2

- [ ] Live traffic appears in flow list in real time
- [ ] Scrolling is smooth with many flows
- [ ] Selecting a flow updates `selectedId` in store

---

## Phase 3: Flow Detail

### Task 7: Request Viewer

**Description:** Monaco editor (read-only) showing the selected flow's request. Headers shown above, body in Monaco. Body is lazy-loaded from `/flows/{id}/request/content/auto`. Language auto-detected from Content-Type.

**Acceptance criteria:**
- [ ] Displays request line (method + URL) and headers
- [ ] Monaco shows request body, read-only
- [ ] Body fetched lazily when flow is selected (not on list render)
- [ ] Language set based on Content-Type (json → json, xml → xml, html → html, else plaintext)
- [ ] Monaco singleton: same editor instance reused across flow selections
- [ ] Shows loading state while fetching body
- [ ] Empty state when no flow selected

**Verification:**
- [ ] Select a JSON API request — Monaco shows formatted JSON with syntax highlighting
- [ ] Rapidly click between flows — no crashes, content updates correctly

**Dependencies:** Task 4, Task 5, Task 3

**Files likely touched:**
- `frontend/src/components/FlowDetail/RequestViewer.tsx`
- `frontend/src/components/FlowDetail/MonacoEditor.tsx` (singleton wrapper)

**Estimated scope:** M

---

### Task 8: Response Viewer

**Description:** Monaco editor showing the selected flow's response. Same pattern as Request Viewer. Tabs to switch between Request and Response.

**Acceptance criteria:**
- [ ] Request / Response tab switcher
- [ ] Response viewer shows status line, headers, and body in Monaco
- [ ] Body lazy-loaded from `/flows/{id}/response/content/auto`
- [ ] Language auto-detected from response Content-Type
- [ ] "No response yet" state for in-flight requests

**Verification:**
- [ ] Select a flow with JSON response — Monaco shows highlighted JSON
- [ ] Select a flow with HTML response — Monaco shows HTML highlighting

**Dependencies:** Task 7

**Files likely touched:**
- `frontend/src/components/FlowDetail/ResponseViewer.tsx`
- `frontend/src/components/FlowDetail/DetailPanel.tsx`

**Estimated scope:** S

---

### Checkpoint: Phase 3

- [ ] Click any flow — see full request and response with syntax highlighting
- [ ] Switching flows updates content correctly
- [ ] No memory leaks after viewing 100+ flows

---

## Phase 4: Interceptor + Repeater

### Task 9: Interceptor

**Description:** Toggle intercept mode via the toolbar button. Intercepted flows pause in the list with a distinct indicator. Detail panel shows Resume and Kill buttons for intercepted flows.

**Acceptance criteria:**
- [ ] Toolbar "Intercept" toggle button calls `setIntercept("~all")` or `setIntercept("")`
- [ ] Toggle state persisted in `uiStore`
- [ ] Intercepted flows show yellow indicator in flow list
- [ ] Detail panel shows "Resume" and "Kill" buttons when `flow.intercepted === true`
- [ ] Resume calls `POST /flows/{id}/resume`, flow updates in list
- [ ] Kill calls `POST /flows/{id}/kill`, flow updates in list

**Verification:**
- [ ] Enable intercept, browse a URL — request pauses, yellow in list
- [ ] Click Resume — request continues, yellow indicator clears

**Dependencies:** Task 6, Task 8, Task 3

**Files likely touched:**
- `frontend/src/components/Interceptor/InterceptToggle.tsx`
- `frontend/src/components/FlowDetail/DetailPanel.tsx`
- `frontend/src/stores/uiStore.ts`

**Estimated scope:** S

---

### Task 10: Repeater

**Description:** "Send to Repeater" button in detail panel opens a Repeater tab. User can edit the request in Monaco (editable) and click Send to replay it. Response shown in a read-only Monaco below.

**Acceptance criteria:**
- [ ] "Send to Repeater" button appears in detail panel
- [ ] Clicking opens a Repeater tab (managed by `uiStore`)
- [ ] Repeater shows editable Monaco with request headers + body
- [ ] "Send" button calls `PUT /flows/{id}` with edited content, then `POST /flows/{id}/replay`
- [ ] Response populates read-only Monaco after replay
- [ ] Multiple Repeater tabs supported (one per flow)

**Verification:**
- [ ] Send a GET request to Repeater, change method to POST, add body, click Send — see response
- [ ] Open two different flows in Repeater — tabs switch independently

**Dependencies:** Task 8, Task 3

**Files likely touched:**
- `frontend/src/components/Repeater/RepeaterTab.tsx`
- `frontend/src/stores/uiStore.ts` (tab management)

**Estimated scope:** M

---

### Checkpoint: Final MVP

- [ ] HTTP/HTTPS traffic captured and shown in real time
- [ ] Click flow → see request and response with syntax highlighting
- [ ] Intercept mode: pause, resume, kill requests
- [ ] Repeater: edit and replay any request
- [ ] `bun run build` produces clean production build
- [ ] No console errors during normal usage

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| XSRF token not set before first mutation | High | Always call `GET /flows` on init before any mutations |
| Monaco bundle size delays first paint | Medium | `@monaco-editor/react` lazy-loads automatically; show spinner |
| mitmproxy WebSocket disconnects on proxy restart | Low | Exponential backoff reconnect in ws.ts |
| `PUT /flows/{id}` for Repeater edits is complex | Medium | Start with raw body edit only; header editing is Phase 2 |
| Sec-Fetch-Site mismatch blocking mutations | High | Vite proxy forwards browser's `same-origin` header — must use proxy, not direct calls |

## Open Questions

- Should flow list default sort be newest-first or oldest-first?
- Should Repeater edits modify the original flow or create a duplicate (`POST /flows/{id}/duplicate` first)?
