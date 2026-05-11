import { describe, it, expect } from 'bun:test'
import { parseWsMessage, calcReconnectDelay } from './ws'

describe('parseWsMessage', () => {
  it('parses flows/add event', () => {
    const flow = { id: 'abc', type: 'http' }
    const raw = JSON.stringify({ type: 'flows/add', payload: { flow } })
    const result = parseWsMessage(raw)
    expect(result).toEqual({ type: 'flows/add', flow })
  })

  it('parses flows/update event', () => {
    const flow = { id: 'xyz', type: 'http' }
    const raw = JSON.stringify({ type: 'flows/update', payload: { flow } })
    const result = parseWsMessage(raw)
    expect(result).toEqual({ type: 'flows/update', flow })
  })

  it('parses flows/reset event', () => {
    const raw = JSON.stringify({ type: 'flows/reset' })
    expect(parseWsMessage(raw)).toEqual({ type: 'flows/reset' })
  })

  it('returns null for unknown event types', () => {
    const raw = JSON.stringify({ type: 'flows/filterUpdate', payload: {} })
    expect(parseWsMessage(raw)).toBeNull()
  })

  it('returns null for malformed JSON', () => {
    expect(parseWsMessage('not json')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseWsMessage('')).toBeNull()
  })
})

describe('calcReconnectDelay', () => {
  it('starts at 500ms on first attempt', () => {
    expect(calcReconnectDelay(0)).toBe(500)
  })

  it('doubles on each attempt', () => {
    expect(calcReconnectDelay(1)).toBe(1000)
    expect(calcReconnectDelay(2)).toBe(2000)
    expect(calcReconnectDelay(3)).toBe(4000)
  })

  it('caps at 5000ms', () => {
    expect(calcReconnectDelay(4)).toBe(5000)
    expect(calcReconnectDelay(10)).toBe(5000)
    expect(calcReconnectDelay(100)).toBe(5000)
  })
})
