import { describe, it, expect } from 'bun:test'
import { formatBytes, formatDuration, methodColor, statusColor } from './utils'

describe('formatBytes', () => {
  it('returns — for null', () => expect(formatBytes(null)).toBe('—'))
  it('formats bytes', () => expect(formatBytes(512)).toBe('512 B'))
  it('formats kilobytes', () => expect(formatBytes(1536)).toBe('1.5 KB'))
  it('formats megabytes', () => expect(formatBytes(2 * 1024 * 1024)).toBe('2.0 MB'))
})

describe('formatDuration', () => {
  it('returns — for null', () => expect(formatDuration(null)).toBe('—'))
  it('formats milliseconds', () => expect(formatDuration(45)).toBe('45ms'))
  it('formats seconds when >= 1000ms', () => expect(formatDuration(1500)).toBe('1.50s'))
  it('rounds ms to integer', () => expect(formatDuration(99.7)).toBe('100ms'))
})

describe('methodColor', () => {
  it('GET is green', () => expect(methodColor('GET')).toContain('green'))
  it('POST is blue', () => expect(methodColor('POST')).toContain('blue'))
  it('DELETE is red', () => expect(methodColor('DELETE')).toContain('red'))
  it('unknown falls back to gray', () => expect(methodColor('CUSTOM')).toContain('gray'))
})

describe('statusColor', () => {
  it('returns gray for null', () => expect(statusColor(null)).toContain('gray'))
  it('2xx is green', () => expect(statusColor(200)).toContain('green'))
  it('3xx is blue', () => expect(statusColor(301)).toContain('blue'))
  it('4xx is yellow', () => expect(statusColor(404)).toContain('yellow'))
  it('5xx is red', () => expect(statusColor(500)).toContain('red'))
})
