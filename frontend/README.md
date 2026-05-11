# FlexLab Frontend

React/Vite UI for FlexLab. During development, run this app with Vite HMR and let Vite proxy mitmweb API requests to a running mitmweb instance.

## Development With HMR

Start mitmweb on port 8081:

```bash
cd ../mitmproxy
uv run mitmweb --web-port 8081 --set web_open_browser=false
```

Start the React dev server:

```bash
cd ../frontend
bun run dev:mitmweb
```

Open:

```text
http://127.0.0.1:5173
```

Vite proxies these mitmweb routes to `http://127.0.0.1:8081`:

- `/flows`
- `/options`
- `/clear`
- `/state`
- `/commands`
- `/events`
- `/filter-help`
- `/updates` WebSocket

Override the mitmweb target when needed:

```bash
VITE_MITMWEB_URL=http://127.0.0.1:8090 bun run dev:mitmweb
```

## Publish Into mitmweb

Build and copy the React UI into `mitmproxy/mitmproxy/tools/web`:

```bash
bun run sync:mitmweb
```

After this, opening the mitmweb server directly should load the built FlexLab UI:

```text
http://127.0.0.1:8081
```

## Verification

```bash
bun test
bun run build
```
