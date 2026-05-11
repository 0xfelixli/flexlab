import { describe, it, expect } from 'bun:test'
import { getApiBaseUrl, getXsrfToken, joinApiPath } from './client'

describe('getXsrfToken', () => {
  it('returns empty string when no cookie', () => {
    expect(getXsrfToken('')).toBe('')
  })

  it('extracts _xsrf value from cookie string', () => {
    expect(getXsrfToken('_xsrf=abc123')).toBe('abc123')
  })

  it('extracts _xsrf when multiple cookies present', () => {
    expect(getXsrfToken('session=xyz; _xsrf=tok456; other=val')).toBe('tok456')
  })

  it('handles _xsrf at start of cookie string', () => {
    expect(getXsrfToken('_xsrf=first; other=val')).toBe('first')
  })

  it('returns empty string when _xsrf cookie not present', () => {
    expect(getXsrfToken('session=abc; other=xyz')).toBe('')
  })

  it('handles Tornado XSRF token format (pipe-separated)', () => {
    const token = '2|deadbeef|1234567890'
    expect(getXsrfToken(`_xsrf=${token}`)).toBe(token)
  })
})

describe('getApiBaseUrl', () => {
  it('uses an explicit configured base URL without a trailing slash', () => {
    expect(getApiBaseUrl('http://127.0.0.1:8081/')).toBe('http://127.0.0.1:8081')
  })

  it('falls back to same-origin proxy when no base URL is configured', () => {
    expect(getApiBaseUrl('')).toBe('')
  })
})

describe('joinApiPath', () => {
  it('joins same-origin paths unchanged when no base URL is configured', () => {
    expect(joinApiPath('/flows', '')).toBe('/flows')
  })

  it('joins configured mitmweb base URL with API paths', () => {
    expect(joinApiPath('/flows/abc/replay', 'http://127.0.0.1:8081/')).toBe(
      'http://127.0.0.1:8081/flows/abc/replay',
    )
  })
})
