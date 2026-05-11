# mitmweb Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing React frontend work as a custom mitmweb UI for traffic viewing and Repeater.

**Architecture:** Keep the frontend connected directly to mitmweb HTTP and WebSocket APIs. Preserve the current Zustand flow store, lazy content loading, Monaco viewers, and tabbed Inspector/Repeater shell.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, ky, TanStack Table/Virtual, Monaco, TailwindCSS v4, Bun test/build scripts.

---

### Task 1: Align API Layer With mitmweb

**Files:**
- Modify: `frontend/src/api/client.ts`
- Modify: `frontend/src/api/ws.ts`
- Modify: `frontend/src/api/flows.ts`
- Test: `frontend/src/api/client.test.ts`
- Test: `frontend/src/api/ws.test.ts`

- [ ] Add tests for configurable mitmweb base URL and WebSocket URL.
- [ ] Add tests for flow list, clear, content, duplicate, and replay endpoint paths.
- [ ] Update API helpers to use the tested paths.
- [ ] Run API tests.

### Task 2: Improve Flow Store Behavior

**Files:**
- Modify: `frontend/src/stores/flowStore.ts`
- Test: `frontend/src/stores/flowStore.test.ts`

- [ ] Add tests for add/update/reset handling and selected-flow preservation.
- [ ] Make store resilient when mitmweb is unavailable.
- [ ] Run store tests.

### Task 3: Repeater Request Editing And Result State

**Files:**
- Modify: `frontend/src/components/Repeater/RepeaterTab.tsx`
- Modify: `frontend/src/stores/uiStore.ts`
- Test: `frontend/src/stores/uiStore.test.ts`

- [ ] Add tests for opening, closing, and activating Repeater tabs.
- [ ] Ensure each Repeater tab keeps edited request state and send status.
- [ ] Wire send action to mitmweb replay API.
- [ ] Run Repeater-related tests.

### Task 4: Workbench Usability

**Files:**
- Modify: `frontend/src/components/Layout/Toolbar.tsx`
- Modify: `frontend/src/components/Layout/AppShell.tsx`
- Modify: `frontend/src/components/Layout/RightPanel.tsx`
- Modify: `frontend/src/components/FlowDetail/DetailPanel.tsx`
- Modify: `frontend/src/components/FlowList/FlowList.tsx`

- [ ] Show mitmweb connection status in the toolbar.
- [ ] Keep flow table, Inspector, and Repeater interactions stable in the workbench layout.
- [ ] Keep copy compact and tool-like.

### Task 5: Verification

**Files:**
- Modify as needed based on verification failures.

- [ ] Run `bun run build`.
- [ ] Run focused tests.
- [ ] Start the dev server and inspect the workbench in browser if dependencies are available.
