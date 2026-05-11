# mitmweb React Replacement Design

## Goal

Replace the UI served by `mitmproxy/mitmproxy/tools/web` with the FlexLab React frontend while reusing mitmweb's existing HTTP and WebSocket API protocol.

The first implementation should make `mitmweb` serve the React build output as its page. It should not redesign mitmproxy's proxy core, replace the API protocol, or move React source files into the generated mitmweb static directory.

## Scope

In scope:

- Keep React source, dependencies, tests, and Vite config in `frontend/`.
- Build `frontend/dist` with Vite.
- Sync the built `index.html` and static assets into `mitmproxy/mitmproxy/tools/web/`.
- Keep mitmweb API routes such as `/flows`, `/events`, `/updates`, `/options`, `/commands`, `/clear`, `/state`, and `/filter-help`.
- Make the production React app call mitmweb through same-origin relative URLs.
- Keep the Vite development proxy pointed at a running mitmweb instance.

Out of scope:

- Replacing mitmweb's backend API with the future FlexLab FastAPI protocol.
- Rewriting mitmproxy proxy internals.
- Editing hashed JavaScript or CSS bundles by hand.
- Treating `mitmproxy/tools/web` as the React source tree.

## Architecture

`frontend/` is the source of truth for the UI. Developers run and test the app there.

`mitmproxy/mitmproxy/tools/web/` is the deployment target for mitmweb. It may be overwritten by a build or sync step. Business logic should not be hand-authored inside generated files in this directory.

The replacement flow is:

```text
frontend React source
        |
        | bun run build
        v
frontend/dist
        |
        | sync build output
        v
mitmproxy/mitmproxy/tools/web/index.html + static assets
        |
        | served by mitmweb Tornado app
        v
browser
```

## API And Data Flow

The React app continues to use mitmweb's native protocol:

- REST-like endpoints for flow lists, flow detail, options, commands, state, and clearing flows.
- WebSocket endpoint `/updates` for real-time updates.

During development, Vite proxies these paths to a running mitmweb server. In production, the React page is served by mitmweb itself, so requests should use relative URLs and stay same-origin.

## Build And Sync

Add a repeatable command rather than manually editing `mitmproxy/tools/web/index.html`.

The command should:

1. Build the React app from `frontend/`.
2. Remove or replace only the generated mitmweb UI files needed for the frontend bundle.
3. Copy `frontend/dist/index.html` to `mitmproxy/mitmproxy/tools/web/index.html`.
4. Copy built static assets to `mitmproxy/mitmproxy/tools/web/static/` or another path already served by mitmweb.

The command should avoid touching mitmproxy Python API files unless serving behavior requires it.

## Error Handling

If the React bundle fails to load, the browser should fail visibly through normal asset load errors. The build/sync command should fail non-zero if `frontend/dist` is missing or if required files cannot be copied.

If API requests fail, the React app should use its existing client error handling and store behavior. Protocol changes are not part of this phase.

## Testing

Verification should include:

- `bun run build` from `frontend/`.
- Existing frontend tests where available.
- A sync command dry run or real run into `mitmproxy/mitmproxy/tools/web/`.
- Start mitmweb and confirm the served page loads the FlexLab React UI.
- Confirm `/updates` connects and flow endpoints still resolve through same-origin paths.

## Future Work

After the UI replacement works, FlexLab can decide whether to keep mitmweb's API, wrap it, or migrate to a FastAPI control layer. That migration should be designed separately because it changes backend ownership and frontend data contracts.
