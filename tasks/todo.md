# FlexLab MVP - Task List

## Phase 1: Foundation
- [x] Task 1: Install dependencies + configure tooling (Vite proxy, TailwindCSS v4)
- [x] Task 2: TypeScript types + transform layer (MitmFlow → FlowSummary/FlowDetail)
- [x] Task 3: API client + WebSocket layer (ky + XSRF + reconnect)

### Checkpoint 1
- [ ] `bun run build` passes, `fetchFlows()` returns live data from mitmproxy

## Phase 2: Flow List
- [x] Task 4: flowStore (Zustand, WebSocket event handling, selectedId)
- [x] Task 5: IDE layout shell (toolbar + resizable panels, dark theme)
- [x] Task 6: Flow List UI (TanStack Table + Virtual, color coding, real-time updates)

### Checkpoint 2
- [ ] Live traffic in flow list, smooth scrolling, row selection works

## Phase 3: Flow Detail
- [x] Task 7: Request Viewer (Monaco singleton, lazy body load, language detection)
- [x] Task 8: Response Viewer (Monaco, Request/Response tabs)

### Checkpoint 3
- [ ] Click flow → request and response with syntax highlighting

## Phase 4: Interceptor + Repeater
- [x] Task 9: Interceptor (toggle, resume/kill, yellow indicators)
- [x] Task 10: Repeater (editable Monaco, Send button, response view)

### Checkpoint 4 (Final)
- [x] Full MVP end-to-end: capture → view → intercept → replay
