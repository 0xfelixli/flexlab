# FlexLab mitmweb Frontend MVP Design

## Goal

Build FlexLab as a custom frontend for mitmproxy's existing web API and event stream. The first MVP focuses on a working traffic viewer plus Repeater, with mitmproxy remaining the capture, storage, and replay core.

The frontend should feel like a security workbench: dense, fast, IDE-style, and useful for repeated debugging work. It is not a marketing page and should not introduce a separate backend control layer in this phase.

## Scope

In scope:

- Connect to a running mitmweb instance.
- Fetch the initial flow list from mitmweb.
- Subscribe to mitmweb WebSocket events for flow add, update, and reset.
- Show a virtualized HTTP flow table.
- Load selected flow details and body content lazily.
- Display request and response content with Monaco-based viewers.
- Create Repeater tabs from selected flows.
- Edit and send repeated requests through mitmweb replay APIs.
- Show the repeated result in the Repeater tab.
- Clear flows through the mitmweb API.

Out of scope for this MVP:

- A custom FastAPI backend control layer.
- Project persistence.
- Plugin system.
- Scanner, Intruder, fuzzing, or team features.
- Replacing or modifying mitmproxy core.
- Editing mitmproxy files except for read-only reference while integrating API behavior.

## Architecture

The browser app connects directly to mitmweb:

```text
FlexLab React frontend
  -> mitmweb HTTP API for initial data, flow content, clear, duplicate, replay
  -> mitmweb WebSocket for real-time flow events
  -> mitmproxy core for capture, storage, and replay
```

This keeps the MVP small and validates the user experience before adding a FlexLab backend. A later backend can wrap the same operations once project management, permissions, plugins, or scanners need server-side ownership.

## UI Design

The main screen uses a compact workbench layout:

- Top toolbar: product name, mitmweb connection status, clear action, and later space for capture controls.
- Left panel: virtualized flow table with Method, Host, Path, Status, Size, and Time.
- Resizable divider between list and detail.
- Right panel: tab strip with an Inspector tab and multiple Repeater tabs.
- Inspector: request and response panes with metadata, headers, and body/raw views.
- Repeater: editable request area, send action, response/result area, and visible request status.

The UI should prioritize scanability and stable dimensions. The first screen should be the actual workbench, not onboarding or explanatory content.

## Data Model

The frontend keeps lightweight flow list state in Zustand. It should not keep all response bodies in global state.

- `FlowSummary`: enough for table rendering and selection.
- `FlowDetail`: selected-flow metadata and headers.
- Body content: fetched on demand by request/response viewer components and cached only where needed.
- Repeater tabs: UI-owned copies created from a selected flow id.

mitmproxy wire data should be transformed through typed DTO helpers before entering UI state. Components should not render raw mitmproxy objects directly.

## Event Flow

Startup:

1. Fetch current flows from mitmweb.
2. Transform flows into frontend DTOs.
3. Connect WebSocket.
4. Apply add/update/reset events to Zustand state.

Selection:

1. User selects a flow row.
2. Detail panel reads summary/detail state.
3. Request and response viewers fetch content lazily for the selected flow.

Repeater:

1. User selects a flow and clicks Send to Repeater.
2. Frontend duplicates or opens an editable request based on mitmweb API support.
3. User edits the request.
4. User sends replay.
5. Repeater tab displays pending, success, or error state and the returned response flow.

## Error Handling

- If mitmweb is unavailable, show a visible disconnected state in the toolbar and keep the workbench usable.
- Initial fetch failures should not crash the app.
- WebSocket disconnects should show stale/disconnected status and attempt reconnect if the current API helper supports it.
- Repeater send failures should stay inside the tab, preserving the edited request.
- Content fetch failures should show an inline empty/error state for that viewer only.

## Testing

Frontend tests should cover:

- mitmproxy wire data to frontend DTO transformation.
- WebSocket event application to the flow store.
- Flow list formatting helpers.
- Repeater tab state changes for pending, success, and error paths where practical.

Manual verification should cover:

- Start mitmweb.
- Start FlexLab frontend.
- Generate HTTP traffic through the proxy.
- Confirm flows appear in real time.
- Select a flow and view request/response details.
- Send a flow to Repeater, edit it, send it, and inspect the result.
- Clear flows and confirm the table resets.

## Implementation Notes

Use the existing React, Vite, TypeScript, Zustand, TanStack Virtual/Table, TailwindCSS, and Monaco setup already present in `frontend/`.

Keep mitmproxy as a submodule and read-only reference. Do not modify `mitmproxy/proxy/`. If API behavior needs to be inspected, read `mitmproxy/tools/web/` and mirror the public API from the FlexLab frontend.
