import type { MitmFlow } from '../types/flow'

export type WsEvent =
  | { type: 'flows/add'; flow: MitmFlow }
  | { type: 'flows/update'; flow: MitmFlow }
  | { type: 'flows/reset' }

export type WsEventHandler = (event: WsEvent) => void
export type WsStatusHandler = (status: 'connected' | 'disconnected') => void

const BASE_DELAY = 500
const MAX_DELAY = 5000

export function getWsUrl(
  configured = import.meta.env.VITE_MITMWEB_URL ?? '',
  protocol = location.protocol,
  host = location.host,
): string {
  if (configured) {
    const url = new URL(configured)
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
    url.pathname = '/updates'
    url.search = ''
    url.hash = ''
    return url.toString()
  }

  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
  return `${wsProtocol}//${host}/updates`
}

export function calcReconnectDelay(attempt: number): number {
  return Math.min(BASE_DELAY * 2 ** attempt, MAX_DELAY)
}

export function parseWsMessage(raw: string): WsEvent | null {
  try {
    const data = JSON.parse(raw) as { type: string; payload?: { flow: MitmFlow } }
    switch (data.type) {
      case 'flows/add':
      case 'flows/update':
        return { type: data.type, flow: data.payload!.flow }
      case 'flows/reset':
        return { type: 'flows/reset' }
      default:
        return null
    }
  } catch {
    return null
  }
}

/** Opens a WebSocket to /updates and calls onEvent for each recognized event.
 *  Returns a cleanup function that stops reconnection and closes the socket. */
export function createWsConnection(
  onEvent: WsEventHandler,
  onStatus?: WsStatusHandler,
): () => void {
  let ws: WebSocket | null = null
  let attempt = 0
  let stopped = false

  function connect() {
    if (stopped) return
    ws = new WebSocket(getWsUrl())

    ws.onopen = () => {
      attempt = 0
      onStatus?.('connected')
    }

    ws.onmessage = (e: MessageEvent<string>) => {
      const event = parseWsMessage(e.data)
      if (event) onEvent(event)
    }

    ws.onclose = () => {
      if (stopped) return
      onStatus?.('disconnected')
      setTimeout(connect, calcReconnectDelay(attempt++))
    }
  }

  connect()
  return () => {
    stopped = true
    ws?.close()
  }
}
