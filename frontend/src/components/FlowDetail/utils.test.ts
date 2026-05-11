import { describe, it, expect } from 'bun:test'
import { syntaxToLanguage, getRequestContentType } from './utils'

describe('syntaxToLanguage', () => {
  it('maps json', () => expect(syntaxToLanguage('json')).toBe('json'))
  it('maps xml', () => expect(syntaxToLanguage('xml')).toBe('xml'))
  it('maps html', () => expect(syntaxToLanguage('html')).toBe('html'))
  it('maps javascript', () => expect(syntaxToLanguage('javascript')).toBe('javascript'))
  it('maps css', () => expect(syntaxToLanguage('css')).toBe('css'))
  it('falls back to plaintext for unknown', () => expect(syntaxToLanguage('image')).toBe('plaintext'))
  it('falls back to plaintext for empty', () => expect(syntaxToLanguage('')).toBe('plaintext'))
})

describe('getRequestContentType', () => {
  it('finds content-type header case-insensitively', () => {
    const headers: [string, string][] = [['Content-Type', 'application/json']]
    expect(getRequestContentType(headers)).toBe('application/json')
  })

  it('handles lowercase header name', () => {
    const headers: [string, string][] = [['content-type', 'text/html']]
    expect(getRequestContentType(headers)).toBe('text/html')
  })

  it('returns empty string when not found', () => {
    const headers: [string, string][] = [['Accept', 'application/json']]
    expect(getRequestContentType(headers)).toBe('')
  })
})
