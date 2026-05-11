import { describe, it, expect, beforeEach } from 'bun:test'
import { applyWsEvent } from './flowStore'
import { useFlowStore } from './flowStore'
import type { FlowDetail } from '../types/flow'
import type { WsEvent } from '../api/ws'

const mockFlow: FlowDetail = {
  id: 'flow-1',
  type: 'http',
  intercepted: false,
  marked: '',
  isReplay: false,
  timestamp: 1000,
  method: 'GET',
  scheme: 'https',
  host: 'example.com',
  port: 443,
  path: '/api',
  statusCode: 200,
  responseSize: 128,
  duration: 50,
  httpVersion: 'HTTP/1.1',
  requestHeaders: [['Accept', 'application/json']],
  responseHeaders: [['Content-Type', 'application/json']],
  responseReason: 'OK',
  comment: '',
  error: null,
}

const mockMitmFlow = {
  id: 'flow-1',
  type: 'http' as const,
  intercepted: false,
  is_replay: null,
  modified: false,
  marked: '',
  comment: '',
  timestamp_created: 1000,
  request: {
    method: 'GET',
    scheme: 'https',
    host: 'example.com',
    port: 443,
    path: '/api',
    http_version: 'HTTP/1.1',
    headers: [] as [string, string][],
    contentLength: null,
    contentHash: null,
    timestamp_start: 1000,
    timestamp_end: 1050,
    pretty_host: 'example.com',
  },
  response: {
    http_version: 'HTTP/1.1',
    status_code: 200,
    reason: 'OK',
    headers: [] as [string, string][],
    contentLength: 128,
    contentHash: 'abc',
    timestamp_start: 1060,
    timestamp_end: 1100,
  },
}

// ─── applyWsEvent (pure function) ────────────────────────────────────────────

describe('applyWsEvent', () => {
  it('adds a new flow on flows/add', () => {
    const flows = new Map<string, FlowSummary>()
    const event: WsEvent = { type: 'flows/add', flow: mockMitmFlow as never }
    const result = applyWsEvent(flows, event)
    expect(result.has('flow-1')).toBe(true)
    expect(result.get('flow-1')?.method).toBe('GET')
  })

  it('updates an existing flow on flows/update', () => {
    const flows = new Map([['flow-1', mockFlow]])
    const updatedMitm = { ...mockMitmFlow, response: { ...mockMitmFlow.response, status_code: 404 } }
    const event: WsEvent = { type: 'flows/update', flow: updatedMitm as never }
    const result = applyWsEvent(flows, event)
    expect(result.get('flow-1')?.statusCode).toBe(404)
  })

  it('does not mutate the original map', () => {
    const flows = new Map<string, FlowSummary>()
    const event: WsEvent = { type: 'flows/add', flow: mockMitmFlow as never }
    applyWsEvent(flows, event)
    expect(flows.size).toBe(0)
  })

  it('clears all flows on flows/reset', () => {
    const flows = new Map([['flow-1', mockFlow], ['flow-2', { ...mockFlow, id: 'flow-2' }]])
    const result = applyWsEvent(flows, { type: 'flows/reset' })
    expect(result.size).toBe(0)
  })
})

// ─── useFlowStore actions ─────────────────────────────────────────────────────

describe('useFlowStore', () => {
  beforeEach(() => {
    useFlowStore.setState({ flows: new Map(), selectedId: null, connectionStatus: 'idle' })
  })

  it('starts with empty flows and no selection', () => {
    const { flows, selectedId, connectionStatus } = useFlowStore.getState()
    expect(flows.size).toBe(0)
    expect(selectedId).toBeNull()
    expect(connectionStatus).toBe('idle')
  })

  it('selectFlow sets selectedId', () => {
    useFlowStore.getState().selectFlow('flow-1')
    expect(useFlowStore.getState().selectedId).toBe('flow-1')
  })

  it('selectFlow(null) clears selection', () => {
    useFlowStore.setState({ selectedId: 'flow-1' })
    useFlowStore.getState().selectFlow(null)
    expect(useFlowStore.getState().selectedId).toBeNull()
  })

  it('setFlows populates the map from a list', () => {
    useFlowStore.getState().setFlows([mockFlow, { ...mockFlow, id: 'flow-2' }] as FlowDetail[])
    expect(useFlowStore.getState().flows.size).toBe(2)
    expect(useFlowStore.getState().flows.has('flow-1')).toBe(true)
  })

  it('handleWsEvent adds flow to store', () => {
    const event: WsEvent = { type: 'flows/add', flow: mockMitmFlow as never }
    useFlowStore.getState().handleWsEvent(event)
    expect(useFlowStore.getState().flows.has('flow-1')).toBe(true)
  })

  it('handleWsEvent updates existing flow', () => {
    useFlowStore.setState({ flows: new Map([['flow-1', mockFlow]]) })
    const updatedMitm = { ...mockMitmFlow, response: { ...mockMitmFlow.response, status_code: 500 } }
    useFlowStore.getState().handleWsEvent({ type: 'flows/update', flow: updatedMitm as never })
    expect(useFlowStore.getState().flows.get('flow-1')?.statusCode).toBe(500)
  })

  it('handleWsEvent clears flows on reset', () => {
    useFlowStore.setState({ flows: new Map([['flow-1', mockFlow]]) })
    useFlowStore.getState().handleWsEvent({ type: 'flows/reset' })
    expect(useFlowStore.getState().flows.size).toBe(0)
  })

  it('setConnectionStatus updates mitmweb connection state', () => {
    useFlowStore.getState().setConnectionStatus('connected')
    expect(useFlowStore.getState().connectionStatus).toBe('connected')
  })
})
