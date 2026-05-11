import { describe, it, expect } from 'bun:test'
import { toFlowSummary, toFlowDetail } from './transform'
import type { MitmFlow } from '../types/flow'

const httpFlow: MitmFlow = {
  id: 'abc-123',
  intercepted: false,
  is_replay: null,
  type: 'http',
  modified: false,
  marked: '',
  comment: 'test comment',
  timestamp_created: 1000,
  request: {
    method: 'GET',
    scheme: 'https',
    host: 'example.com',
    port: 443,
    path: '/api/users',
    http_version: 'HTTP/1.1',
    headers: [['Accept', 'application/json']],
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
    headers: [['Content-Type', 'application/json']],
    contentLength: 256,
    contentHash: 'deadbeef',
    timestamp_start: 1060,
    timestamp_end: 1100,
  },
}

const interceptedFlow: MitmFlow = {
  ...httpFlow,
  id: 'def-456',
  intercepted: true,
  is_replay: 'client',
  marked: '🔴',
  response: undefined,
}

describe('toFlowSummary', () => {
  it('maps basic HTTP fields', () => {
    const s = toFlowSummary(httpFlow)
    expect(s.id).toBe('abc-123')
    expect(s.type).toBe('http')
    expect(s.timestamp).toBe(1000)
    expect(s.method).toBe('GET')
    expect(s.scheme).toBe('https')
    expect(s.host).toBe('example.com')
    expect(s.port).toBe(443)
    expect(s.path).toBe('/api/users')
  })

  it('maps response fields', () => {
    const s = toFlowSummary(httpFlow)
    expect(s.statusCode).toBe(200)
    expect(s.responseSize).toBe(256)
  })

  it('calculates duration from timestamps', () => {
    const s = toFlowSummary(httpFlow)
    // response.timestamp_end (1100) - request.timestamp_start (1000) = 100ms
    expect(s.duration).toBeCloseTo(100)
  })

  it('returns null duration when response not yet received', () => {
    const s = toFlowSummary(interceptedFlow)
    expect(s.duration).toBeNull()
    expect(s.statusCode).toBeNull()
    expect(s.responseSize).toBeNull()
  })

  it('maps intercepted and replay flags', () => {
    const s = toFlowSummary(interceptedFlow)
    expect(s.intercepted).toBe(true)
    expect(s.isReplay).toBe(true)
    expect(s.marked).toBe('🔴')
  })

  it('uses pretty_host for host', () => {
    const flow: MitmFlow = {
      ...httpFlow,
      request: { ...httpFlow.request!, host: '1.2.3.4', pretty_host: 'api.example.com' },
    }
    expect(toFlowSummary(flow).host).toBe('api.example.com')
  })
})

describe('toFlowDetail', () => {
  it('includes all FlowSummary fields', () => {
    const d = toFlowDetail(httpFlow)
    expect(d.id).toBe('abc-123')
    expect(d.method).toBe('GET')
    expect(d.statusCode).toBe(200)
  })

  it('includes request and response headers', () => {
    const d = toFlowDetail(httpFlow)
    expect(d.requestHeaders).toEqual([['Accept', 'application/json']])
    expect(d.responseHeaders).toEqual([['Content-Type', 'application/json']])
  })

  it('returns null responseHeaders when no response', () => {
    const d = toFlowDetail(interceptedFlow)
    expect(d.responseHeaders).toBeNull()
    expect(d.responseReason).toBeNull()
  })

  it('maps comment and error fields', () => {
    const d = toFlowDetail(httpFlow)
    expect(d.comment).toBe('test comment')
    expect(d.error).toBeNull()
  })

  it('maps error when present', () => {
    const flow: MitmFlow = { ...httpFlow, error: { msg: 'connection reset', timestamp: 1200 } }
    expect(toFlowDetail(flow).error).toEqual({ msg: 'connection reset', timestamp: 1200 })
  })
})
