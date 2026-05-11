import type { MitmFlow } from '../types/flow'

export type WsEvent =
  | { type: 'flows/add'; flow: MitmFlow }
  | { type: 'flows/update'; flow: MitmFlow }
  | { type: 'flows/reset' }

export type WsEventHandler = (event: WsEvent) => void

const BASE_DELAY = 500
const MAX_DELAY = 5000

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
export function createWsConnection(onEvent: WsEventHandler): () => void {
  let ws: WebSocket | null = null
  let attempt = 0
  let stopped = false

  function connect() {
    if (stopped) return
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    ws = new WebSocket(`${protocol}//${location.host}/updates`)

    ws.onopen = () => { attempt = 0 }

    ws.onmessage = (e: MessageEvent<string>) => {
      const event = parseWsMessage(e.data)
      if (event) onEvent(event)
    }

    ws.onclose = () => {
      if (stopped) return
      setTimeout(connect, calcReconnectDelay(attempt++))
    }
  }

  connect()
  return () => {
    stopped = true
    ws?.close()
  }
}
